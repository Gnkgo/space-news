import express from "express";
import ViteExpress from "vite-express";
import path from "path";
import { CADReq, CADRes } from "../common/types";
import { constants, accessSync, readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";

// creates the expres app do not change
const app = express();

// VALENTIN START
/*type LoggedError = {
  apiName: string,
  timeStamp: number,
  error: unknown
};*/

type CacheEntry<TRes> = {
  ttl: number,
  value: TRes
}
type Cache<TRes> = {
  cached: Map<string, CacheEntry<TRes>>,
  computeTtl: () => number,
}
function cacheCreate<TRes>(period: number): Cache<TRes> {
  return {
    cached: new Map<string, CacheEntry<TRes>>(),
    computeTtl: () => Math.ceil((new Date().getTime() + period) / period) * period
  };
}
const dayMillis = 24 * 60 * 60 * 1000;
function cacheCreateDaily<TRes>(): Cache<TRes> {
  return cacheCreate(dayMillis);
}
/*const weekMillis = 7 * dayMillis;
function cacheCreateWeekly<TRes>(): Cache<TRes> {
  return cacheCreate(weekMillis);
}*/
function cacheGet<TRes>(cache: Cache<TRes>, key: any): CacheEntry<TRes> | undefined {
  return cache.cached.get(String(key));
}
function cacheSet<TReq, TRes>(cache: Cache<TRes>, key: TReq, value: TRes): CacheEntry<TRes> {
  const entry = { ttl: cache.computeTtl(), value: value };
  cache.cached.set(String(key), entry);
  return entry;
}
function cacheData<TRes>(cache: Cache<TRes>): Map<string, CacheEntry<TRes>> {
  return cache.cached;
}

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
    const path = apiCachePath(api);
    try {
      const cache = api.cache;
      if (cache != undefined) {
        accessSync(path, constants.F_OK);
        const data = cacheData(cache);
        Object.entries(JSON.parse(readFileSync(path, { encoding: "utf8" }))).forEach(([k, v]) => data.set(k, v as CacheEntry<TRes>));
      }
    } catch {
      apiWrite(api);
    };
  }
  return api;
}
function apiCachePath(api: ApiDef<any, any>): string {
  return `./src/server/caches/${api.apiName}.json`;
}
async function apiWrite<TRes, TReq>(api: ApiDef<TReq, TRes>) {
  const cache = api.cache;
  if (cache != undefined)
    await writeFile(apiCachePath(api), JSON.stringify(Object.fromEntries(cache.cached), undefined, 2));
}

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
        if (entry != undefined && new Date().getTime() < entry.ttl)
          apiRes = entry.value;
        else {
          cacheSet(cache, apiReq, apiRes = await fetchNew());
          apiWrite(api);
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
  apiName: "CAD",
  target: '/nasa-cad-api',
  cache: cacheCreateDaily(),
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
