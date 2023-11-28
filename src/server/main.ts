import express from "express";
import { ParamsDictionary } from "express-serve-static-core";
import QueryString from "qs";
import ViteExpress from "vite-express";
import path from "path";
import { CADReq, CADRes, MarsRoverPhotosReq, MarsRoverPhotosRes, MarsWeatherReq, MarsWeatherRes, FireballReq, FireballRes, MoonReq, MoonRes, moonTarget } from "../common/api";
import { constants, accessSync, readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { cadTarget, marsRoverPhotosTarget, marsWeatherTarget, fireballTarget } from "../common/api";

/**
 * TODO
 * 
 * - Remove old cached values
 * - Logs
 */

// creates the expres app do not change
const app = express();

// Constants
const marsRoverApiKey = 'ZuW891bZkaap2ZJ9L1tJHldstVbEZfWZef1WpSHX';
const moonApiKey = 'TANA3BSE43X9AFK3TDSPXST5P';

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
    computeTtl: () => Math.floor((new Date().getTime() + period) / period) * period
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
  genReq: (req: TReq) => Promise<string>,
  genRes: (json: any) => Promise<TRes>
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
function regApi<TReq, TRes>(api: ApiDef<TReq, TRes>, func: (req: express.Request<ParamsDictionary, any, any, QueryString.ParsedQs, Record<string, any>>) => any): void {
  apiInit(api);
  app.get(api.target, async (req, res) => {
    try {
      const apiReq = func(req) as TReq;
      const fetchNew = async () => await fetch(await api.genReq(apiReq)).then((data) => data.json()).then(async (json) => await api.genRes(json));
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
function regUrlApi<TReq, TRes>(api: ApiDef<TReq, TRes>): void {
  regApi<TReq, TRes>(api, (req) => req.query);
}
/*function regHeaderApi<TReq, TRes>(api: ApiDef<TReq, TRes>): void {
  regApi<TReq, TRes>(api, (req) => req.headers);
}*/

regHtml('/', 'home.html');
regHtml('/neo.html', 'neo.html');
regApi<CADReq, CADRes>({
  apiName: "Close Approach Data",
  target: cadTarget.raw(),
  cache: cacheCreateDaily("cad"),
  genReq: async (req) => `https://ssd-api.jpl.nasa.gov/cad.api?date-min=${req["date-min"]}&date-max=%2B${req["date-max"]}&min-dist-max=${req["min-dist-max"]}`,
  genRes: async (res) => res
});
regUrlApi<MarsWeatherReq, MarsWeatherRes>({
  apiName: "Mars Weather Data",
  target: marsWeatherTarget.raw(),
  cache: cacheCreateDaily("mars_weather"),
  genReq: async (_req) => 'https://mars.nasa.gov/rss/api/?feed=weather&category=msl&feedtype=json',
  genRes: async (res) => res as MarsWeatherRes
});
regUrlApi<MarsRoverPhotosReq, MarsRoverPhotosRes>({
  apiName: "Mars Rover Photos Data",
  target: marsRoverPhotosTarget.raw(),
  cache: cacheCreateDaily("mars_rover_photos"),
  genReq: async (req) => {
    const manifest = await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/${req.rover}?api_key=${marsRoverApiKey}`).then((data) => data.json());
    return `https://api.nasa.gov/mars-photos/api/v1/rovers/${req.rover}/photos?sol=${manifest.photo_manifest.max_sol}&api_key=${marsRoverApiKey}`
  },
  genRes: async (res) => res as MarsRoverPhotosRes
});
regUrlApi<MoonReq, MoonRes>({
  apiName: "Moon Data",
  target: moonTarget.raw(),
  cache: cacheCreateDaily("moon"),
  genReq: async (req) => `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${req.location}/${req.date}?unitGroup=metric&include=days&key=${moonApiKey}&contentType=json&elements=datetime,moonphase,sunrise,sunset,moonrise,moonset`,
  genRes: async (res) => res as MoonRes
});
regApi<FireballReq, FireballRes>({
  apiName: "Fireball Data",
  target: fireballTarget,
  genReq: (req) => `https://ssd-api.jpl.nasa.gov/fireball.api?date-min=${req["date-min"]}&req-loc=${req["req-loc"]}`,
  genRes: (res) => res as FireballRes
});

// VALENTIN END

// NICK START
/*app.get('/', (_req, res) => {
  res.sendFile(path.resolve('src', 'client', 'html', 'home.html'));
});
app.get('/neo.html', (_req, res) => {
  res.sendFile(path.resolve('src', 'client', 'html', 'neo.html'));
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
