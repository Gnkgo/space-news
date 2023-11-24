import express from "express";
import ViteExpress from "vite-express";
import path from "path";
import { CADReq, CADRes } from "../common/types";
import { constants, accessSync, readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";

// creates the expres app do not change
const app = express();

// Helper functions
function toPrettyJson(obj: any): string {
  return JSON.stringify(obj, undefined, 2);
}

// Caches
type CacheEntry<TRes> = {
  ttl: number,
  value: TRes
}
type Cache<TRes> = {
  path: string,
  entries: Map<string, CacheEntry<TRes>>,
  computeTtl: () => number,
}
function cacheCreate<TRes>(name: string, period: number): Cache<TRes> {
  return {
    path: `./caches/${name}.json`,
    entries: new Map<string, CacheEntry<TRes>>(),
    computeTtl: () => Math.ceil((new Date().getTime() + period) / period) * period
  };
}
const dayMillis = 24 * 60 * 60 * 1000;
function cacheCreateDaily<TRes>(name: string): Cache<TRes> {
  return cacheCreate(name, dayMillis);
}
/*const weekMillis = 7 * dayMillis;
function cacheCreateWeekly<TRes>(): Cache<TRes> {
  return cacheCreate(weekMillis);
}*/
function cacheGet<TRes>(cache: Cache<TRes>, key: any): CacheEntry<TRes> | undefined {
  return cache.entries.get(JSON.stringify(key));
}
async function cacheSet<TReq, TRes>(cache: Cache<TRes>, key: TReq, value: TRes): Promise<CacheEntry<TRes>> {
  const entry = { ttl: cache.computeTtl(), value: value };
  cache.entries.set(JSON.stringify(key), entry);
  await cacheWrite(cache);
  return entry;
}
async function cacheWrite(cache: Cache<any>): Promise<void> {
  await writeFile(cache.path, toPrettyJson(Object.fromEntries(cache.entries)));
}

// API's
type ApiDef<TReq, TRes> = {
  apiName: string,
  target: string,
  cache?: Cache<TRes>,
  genReq: (req: TReq) => string,
  genRes: (json: any) => TRes
}
function apiInit<TReq, TRes>(api: ApiDef<TReq, TRes>): ApiDef<TReq, TRes> {
  const cache = api.cache;
  if (cache != undefined) {
    const path = cache.path;
    try {
      const cache = api.cache;
      if (cache != undefined) {
        accessSync(path, constants.F_OK);
        const data = cache.entries;
        Object.entries(JSON.parse(readFileSync(path, { encoding: "utf8" }))).forEach(([k, v]) => data.set(k, v as CacheEntry<TRes>));
      }
    } catch {
      cacheWrite(cache);
    };
  }
  return api;
}

// Express shortcuts
function regFile(target: string, ...paths: string[]): void {
  app.get(target, (_req, res) => {
    res.sendFile(path.resolve(...paths));
  });
}
function regHtml(target: string, file: string): void {
  regFile(target, 'src', 'client', 'html', file);
}
function regApi<TReq, TRes>(api: ApiDef<TReq, TRes>): void {
  apiInit(api);
  app.get(api.target, async (req, res) => {
    try {
      const apiReq = req.query as TReq;
      const fetchNew = async () => await fetch(api.genReq(apiReq)).then((data) => data.json()).then((json) => api.genRes(json));
      let apiRes: TRes;
      const cache = api.cache;
      if (cache != undefined) {
        const entry = cacheGet(cache, apiReq);
        console.log("The stored value for ");
        console.log(apiReq);
        console.log(" is:\r\n");
        console.log(entry);
        if (entry != undefined && new Date().getTime() < entry.ttl)
          apiRes = entry.value;
        else {
          cacheSet(cache, apiReq, apiRes = await fetchNew());
        }
      } else
        apiRes = await fetchNew();
      res.json(apiRes);
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });
}
regHtml('/', 'home.html');
regHtml('/nea.html', 'nea.html');
regApi<CADReq, CADRes>({
  apiName: "Close Approach Data",
  target: '/nasa-cad-api',
  cache: cacheCreateDaily("cad"),
  genReq: (req) => `https://ssd-api.jpl.nasa.gov/cad.api?date-min=${req["date-min"]}&date-max=%2B${req["date-max"]}&dist-max=${req["dist-max"]}`,
  genRes: (res) => res
});
// VALENTIN END

// NICK START
/*app.get('/', (_req, res) => {
  res.sendFile(path.resolve('src', 'client', 'html', 'home.html'));
});
app.get('/nea.html', (_req, res) => {
  res.sendFile(path.resolve('src', 'client', 'html', 'nea.html'));
});
app.get('/nasa-cad-api', async (req, res) => {
  try {
    const {'date-min': dateMin, 'date-max': dateMax, 'dist-max': distMax} = req.query as {'date-min': string, 'date-max': string, 'dist-max': string};
    const response = await fetch(`https://ssd-api.jpl.nasa.gov/cad.api?date-min=${dateMin}&date-max=%2B${dateMax}&dist-max=${distMax}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});*/
// NICK END

// Do not change below this line
ViteExpress.listen(app, 5173, () =>
    console.log("Server is listening on http://localhost:5173"),
);
