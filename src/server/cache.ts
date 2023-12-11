import { accessSync, constants, readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { ApiDef, apiFetchNew } from "./main";

/**
 * Helper function to print an object in indented JSON format.
 * @param obj The object to print.
 * @returns The stringified object.
 */
function toPrettyJson(obj: any): string {
    return JSON.stringify(obj, undefined, 2);
}

/**
 * Represents a temporary cache for fetched responses from HTTP.
 * 
 * All responses are invalided at the same time at an interval given by the TTL (time-to-live) value.
 */
export type Cache<TReq, TRes> = {
    /**
     * The path to the cache file.
     */
    readonly path: string,
    /**
     * The in-memory map of the cached responses.
     */
    readonly entries: Map<string, TRes>,
    /**
     * The invalidation interval in milliseconds.
     */
    readonly ttl: number,
    readonly api: ApiDef<TReq, TRes>
    readonly autoFetched: TReq[]
}
const cachesPerTtl: Map<number, Cache<any, any>[]> = new Map<number, Cache<any, any>[]>();
function _cacheInit<TReq, TRes>(cache: Cache<TReq, TRes>): void {
    const path = cache.path;
    try {
        accessSync(path, constants.F_OK);
        const data = cache.entries;
        Object.entries(JSON.parse(readFileSync(path, { encoding: "utf8" }))).forEach(([k, v]) => data.set(k, v as TRes));
    } catch (error) {
        cache.api.log.append("" + error)
        cacheWrite(cache);
    };
}
async function _cacheAutoFetch<TReq, TRes>(cache: Cache<TReq, TRes>): Promise<void> {
    for (const req of cache.autoFetched)
        if (_cacheGet(cache, req) == undefined)
            await apiFetchNew(cache.api, req).then((res) => _cacheSet(cache, req, res));
}
function _cacheSetTimeout(ttl: number): void {
    const caches = cachesPerTtl.get(ttl);
    if (caches == undefined)
        return;
    const currTime = new Date().getTime();
    const nextTime = Math.floor((currTime + ttl) / ttl) * ttl;
    setTimeout(async () => {
        for (const c of caches) {
            await _cacheClear(c);
            await _cacheAutoFetch(c);
        }
        _cacheSetTimeout(ttl);
    }, nextTime - currTime);
}
/**
 * Create a cache with the given name and TTL.
 * @param name The name of the cache.
 * @param ttl The time-to-live value.
 * @param api The API.
 * @param autoFetched The responses that should be auto-fetched when the cache is cleared.
 * @returns The cache.
 */
export function cacheCreate<TReq, TRes>(name: string, ttl: number, api: ApiDef<TReq, TRes>, autoFetched: TReq[]): Cache<TReq, TRes> {
    const cache = {
        path: `./api_caches/${name}.json`,
        entries: new Map<string, TRes>(),
        ttl: ttl,
        api: api,
        autoFetched: autoFetched
    };
    _cacheInit(cache);
    _cacheAutoFetch(cache);
    let caches = cachesPerTtl.get(ttl);
    if (caches == undefined) {
        const newCaches: Cache<any, any>[] = [cache];
        cachesPerTtl.set(ttl, caches = newCaches);
        _cacheSetTimeout(ttl);
    }
    api.cache = cache;
    return cache;
}
const minuteMillis = 60 * 1000;
/**
 * Create a cache with minutely entry invalidation.
 * @param name The name of the cache.
 * @param api The API.
 * @param autoFetched The responses that should be auto-fetched when the cache is cleared.
 * @returns The cache.
 */
export function cacheCreateMinutely<TReq, TRes>(name: string, api: ApiDef<TReq, TRes>, autoFetched: TReq[] = []): Cache<TReq, TRes> {
    return cacheCreate(name, minuteMillis, api, autoFetched);
}
const dayMillis = 24 * 60 * minuteMillis;
/**
 * Create a cache with daily entry invalidation.
 * @param name The name of the cache.
 * @param api The API.
 * @param autoFetched The responses that should be auto-fetched when the cache is cleared.
 * @returns The cache.
 */
export function cacheCreateDaily<TReq, TRes>(name: string, api: ApiDef<TReq, TRes>, autoFetched: TReq[] = []): Cache<TReq, TRes> {
    return cacheCreate(name, dayMillis,api, autoFetched);
}
const weekMillis = 7 * dayMillis;
/**
 * Create a cache with weekly entry invalidation.
 * @param name The name of the cache.
 * @param api The API.
 * @param autoFetched The responses that should be auto-fetched when the cache is cleared.
 * @returns The cache.
 */
export function cacheCreateWeekly<TReq, TRes>(name: string, api: ApiDef<TReq, TRes>, autoFetched: TReq[] = []): Cache<TReq, TRes> {
  return cacheCreate(name, weekMillis, api, autoFetched);
}
/**
 * Write the cache to disk. This function should be used everytime an entry is added / removed.
 * @param cache The cache.
 */
export async function cacheWrite(cache: Cache<any, any>): Promise<void> {
    return writeFile(cache.path, toPrettyJson(Object.fromEntries(cache.entries)));
}
function _reqToString<TReq>(req: TReq): string {
    return JSON.stringify(req);
}
function _cacheGet<TReq, TRes>(cache: Cache<TReq, TRes>, req: TReq): TRes | undefined {
    return cache.entries.get(_reqToString(req));
}
/**
 * Read a value from the cache or fetch it if it is not present.
 * @param cache The cache.
 * @param req The request.
 * @returns A promise to the response.
 */
export async function cacheGetOrFetch<TReq, TRes>(cache: Cache<TReq, TRes>, req: TReq): Promise<TRes> {
    let value = _cacheGet(cache, req);
    console.log("The stored response for ");
    console.log(req);
    console.log(" is:\r\n");
    console.log(value);
    if (value != undefined)
        return value;
    return apiFetchNew(cache.api, req)
        .then((res) => _cacheSet(cache, req, res).then(() => res));
}
async function _cacheSet<TReq, TRes>(cache: Cache<TReq, TRes>, req: TReq, res: TRes): Promise<void> {
    cache.entries.set(_reqToString(req), res);
    return cacheWrite(cache);
}
async function _cacheClear(cache: Cache<any, any>): Promise<void> {
    cache.entries.clear();
    return cacheWrite(cache);
}