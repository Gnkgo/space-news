import { createWriteStream } from "node:fs";

export type Log = {
    readonly append: (data: string) => void
    readonly end: () => void;
}

export function logCreate(name: string): Log {
    const stream = createWriteStream(`./api_logs/${name}.txt`, {flags:'a'});
    return {
        append: (data: string) => stream.write(`[${new Date().toUTCString()}]: ${data}\r\n`),
        end: () => stream.end()
    };
}