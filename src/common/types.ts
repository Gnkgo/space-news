export type CADReq = {
    'date-min': string,
    'date-max': string,
    'dist-max': string,
}

export type CADRes = {
    signature: {
        version: string;
        source: string;
    };
    count: number;
    fields: string[];
    data: Array<Array<string | number>>;
}