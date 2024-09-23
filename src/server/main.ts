import express from "express";
import { ParamsDictionary } from "express-serve-static-core";
import QueryString from "qs";
import ViteExpress from "vite-express";
//import path from "path";
import { CADReq, CADRes, MarsRoverPhotosReq, MarsRoverPhotosRes, MarsWeatherReq, MarsWeatherRes, MoonReq, MoonRes, FireballReq, FireballRes } from "../common/api";
import { cadTarget, marsRoverPhotosTarget, marsWeatherTarget, fireballTarget, moonTarget } from "../common/api";
import { Cache, cacheCreateDaily, cacheCreateMinutely, cacheGetOrFetch } from "./cache";
import { Log, logCreate } from "./log";

/**
 * Key for the NASA rover API.
 */
const marsRoverApiKey = 'ZuW891bZkaap2ZJ9L1tJHldstVbEZfWZef1WpSHX';
/**
 * Key for the NASA moon API.
 */
const moonApiKey = 'TANA3BSE43X9AFK3TDSPXST5P';

/**
 * Represents an API with fetch methods and an optional backing cache.
 */
export type ApiDef<TReq, TRes> = {
  /**
   * The name of the API (can be anything, used for logging).
   */
  readonly apiName: string,
  /**
   * The HTTP target string for the server to listen to.
   * Most likely, you will want to use the raw value of a target pattern for this.
   */
  readonly target: string,
  /**
   * The (optional) cache that will be checked against the request before needlessly fetching stale data.
   */
  cache?: Cache<TReq, TRes>
  /**
   * The method to transform a client request into a fetch done by the server.
   * This method is only called when the cache does not have the corresponding value yet.
   * 
   * It is possible to do intermediate requests in this method (e.g. fwtching a manifest)
   * before generating the actual server fetch.
   * @param req The request data type as given by the client.
   * @returns The string which the server will use to fetch a resource.
   */
  readonly genReq: (req: TReq) => Promise<string>,
  /**
   * The method to transform the API's response into a suitable response for the client.
   * The value returned by this method will be cached by associating it with the initial
   * request done by the client.
   * 
   * It is highly encouraged to extract only the client-essential data in this method.
   * This will lead to lower storage space needed on the server and quicker transfer times
   * between the server and the client (due to less unused data being transferred).
   * @param json The response by the API.
   * @returns The request data type returned to the client.
   */
  readonly genRes: (json: any) => Promise<TRes>
  readonly log: Log;
}
/**
 * Create a new promise for a response based on a client request.
 * @param api The API.
 * @param req The client request.
 * @returns The response promise.
 */
export async function apiFetchNew<TReq, TRes>(api: ApiDef<TReq, TRes>, req: TReq): Promise<TRes> {
  const str = await api.genReq(req);
  const res = await fetch(str);
  const json = await res.json();
  return await api.genRes(json);
}

/**
 * The Express app global variable. Do not change.
 */
const app = express();

/**
 * Register a fetchable file at the given path.
 * @param target The HTTP target string for the server to listen to.
 * @param paths The path as an array of multiple directories and a file.
 */
//function regFile(target: string, ...paths: string[]): void {
//  app.get(target, (_req, res) => {
//    res.sendFile(path.resolve(...paths));
//  });
//}
/**
 * Register a fetchable HTML file with the given file name.
 * @param target The HTTP target string for the server to listen to.
 * @param file The file name (without path!). Defaults to the target without the leading '/'.
 */
//function regHtml(target: string, file: string = target.substring(1)): void {
//  regFile(target, 'src', 'client', 'html', file);
//}
/**
 * Register a fetchable image file with the given file name.
 * @param target The HTTP target string for the server to listen to.
 * @param file The file name (without path!). Defaults to the target without the leading '/'.
 */
//function regImg(target: string, file: string = target.substring(1)): void {
//  regFile(target, 'src', 'client', 'img', file);
//}
/**
 * Register an API.
 * @param api The API.
 * @param func The function building a request data type from the express request.
 * @return The API.
 */
const _apis: ApiDef<any, any>[] = [];
function regApi<TReq, TRes>(api: ApiDef<TReq, TRes>, func: (req: express.Request<ParamsDictionary, any, any, QueryString.ParsedQs, Record<string, any>>) => TReq): ApiDef<TReq, TRes> {
  app.get(api.target, async (req, res) => {
    try {
      const apiReq = func(req) as TReq;
      const cache = api.cache;
      res.json(cache != undefined ? await cacheGetOrFetch(cache, apiReq) : await apiFetchNew(api, apiReq));
    } catch (error) {
      console.error(error);
      api.log.append("" + error);
      res.status(500).send('Internal Server Error');
    }
  });
  _apis.push(api);
  api.log.append(`Registered API '${api.apiName}'...`);
  return api;
}
/**
 * Register an API where the request parameters are part of the URL.
 * @param api The API.
 * @return The API.
 */
function regUrlApi<TReq, TRes>(api: ApiDef<TReq, TRes>): ApiDef<TReq, TRes> {
  return regApi<TReq, TRes>(api, (req) => req.query as TReq);
}
/*function regHeaderApi<TReq, TRes>(api: ApiDef<TReq, TRes>): void {
  regApi<TReq, TRes>(api, (req) => req.headers);
}*/

// 3D stuff
//regHtml('/spinning_earth.html');
//regImg('/earth_texture.bmp');
//regImg('/meteorite_texture.bmp');
//
//// HTML pages
//regHtml('/', 'home.html');
//regHtml('/neo.html', 'neo.html');
//
// Close Approach API
const cadApi = regUrlApi<CADReq, CADRes>({
  apiName: "Close Approach Data",
  target: cadTarget.raw(),
  genReq: async (req) => `https://ssd-api.jpl.nasa.gov/cad.api?date-min=${req["date-min"]}&date-max=${req["date-max"]}&dist-max=${req["dist-max"]}`,
  genRes: async (res) => res as CADRes,
  log: logCreate("cad")
});
cacheCreateMinutely("cad", cadApi);
console.log("cadApi", cadApi);

// Mars Weather API
const marsWeatherApi = regUrlApi<MarsWeatherReq, MarsWeatherRes>({
  apiName: "Mars Weather Data",
  target: marsWeatherTarget.raw(),
  genReq: async (_req) => 'https://mars.nasa.gov/rss/api/?feed=weather&category=msl&feedtype=json',
  genRes: async (res) => {
    const data = res as MarsWeatherRes;
    // Ensure that 'sols' property exists and is an array
    if (data.soles && Array.isArray(data.soles)) {
      // Shorten the 'sols' array to only the first 400 elements
      data.soles = data.soles.length >= 400 ? data.soles.slice(0, 400) : data.soles;
    }
    return data;
  },
  log: logCreate("mars_weather"),
});
cacheCreateDaily("mars_weather", marsWeatherApi, [() => { return {}; }]);

// Mars Rover Photos API
const marsRoverPhotosApi = regUrlApi<MarsRoverPhotosReq, MarsRoverPhotosRes>({
  apiName: "Mars Rover Photos Data",
  target: marsRoverPhotosTarget.raw(),
  genReq: async (req) => {
    const manifest = await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/${req.rover}?api_key=${marsRoverApiKey}`).then((data) => data.json());
    return `https://api.nasa.gov/mars-photos/api/v1/rovers/${req.rover}/photos?sol=${manifest.photo_manifest.max_sol}&api_key=${marsRoverApiKey}`
  },
  genRes: async (res) => res as MarsRoverPhotosRes,
  log: logCreate("mars_rover_photos")
});
cacheCreateDaily("mars_rover_photos", marsRoverPhotosApi);
// Moon API
const moonApi = regUrlApi<MoonReq, MoonRes>({
  apiName: "Moon Data",
  target: moonTarget.raw(),
  genReq: async (req) => `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${req.lat}%2C%20${req.lon}/${req.date}?unitGroup=metric&include=days&key=${moonApiKey}&contentType=json&elements=datetime,moonphase,sunrise,sunset,moonrise,moonset`,
  genRes: async (res) => res as MoonRes,
  log: logCreate("moon")
});
cacheCreateDaily("moon", moonApi);

// Fireball API
const fireballApi = regUrlApi<FireballReq, FireballRes>({
  apiName: "Fireball Data",
  target: fireballTarget.raw(),
  genReq: async (req) =>
  `https://ssd-api.jpl.nasa.gov/fireball.api?date-min=${req["date-min"]}&req-loc=${req["req-loc"]}`,
  genRes: async (res) => res as FireballRes,
  log: logCreate("fireball")
});
cacheCreateDaily("fireball", fireballApi);

// Sever start. Do not change.
ViteExpress.listen(app, 80, () =>
    console.log("Server is listening on http://localhost:80"),
);
function onShutdown() {
  for (const api of _apis) {
    api.log.append("Process exiting...");
    api.log.end();
  }
  process.exit();
}
process.on('SIGINT', onShutdown);
process.on('SIGTERM', onShutdown);
process.on('exit', onShutdown);