export class TargetPattern<TReq extends {}> {
  private readonly _target: string;

  public constructor(target: string) {
    this._target = target;
  }

  public raw(): string {
    return this._target;
  }

  public resolve(req: TReq): string {
    const entries = Object.entries(req);
    if (entries.length == 0)
      return this._target;
    return `${this._target}?${entries.map(entry => `${entry[0]}=${entry[1]}`).join('&')}`;
  }
}

export const cadTarget = new TargetPattern<CADReq>('/nasa-cad-api');
export const marsWeatherTarget = new TargetPattern<MarsWeatherReq>('/nasa-mars-weather-api');
export const marsRoverPhotosTarget = new TargetPattern<MarsRoverPhotosReq>('/nasa-mars-rover-photos-api');
export const moonTarget = new TargetPattern<MoonReq>('/visual-crossing-moon-api');
export const moonSelectedDayTarget = new TargetPattern<MoonReq>('/visual-crossing-moon-api2');
export const fireballTarget = new TargetPattern<FireballReq>('/nasa-fireball-api');

export type CADReq = {
  'date-min': string,
  'date-max': string,
  'min-dist-max': string,
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

// MARS WEATHER

export type MarsWeatherReq = {}

export type SolEntryRes = {
  id: string;
  terrestrial_date: string;
  sol: string;
  ls: string;
  season: string;
  min_temp: string;
  max_temp: string;
  min_temp_fahrenheit?: string;
  max_temp_fahrenheit?: string;
  pressure: string;
  pressure_string: string;
  abs_humidity: string;
  wind_speed: string;
  wind_direction: string;
  atmo_opacity: string;
  sunrise: string;
  sunset: string;
  local_uv_irradiance_index: string;
  min_gts_temp: string;
  max_gts_temp: string;
}


export type MarsWeatherRes = {
  descriptions: Record<string, string>;
  soles: SolEntryRes[];
}

// MARS ROVER PHOTOS

export type MarsRoverPhotosReq = {
  'rover': string;
}

export type MarsRoverPhotosRes = any;

export type FireballReq = {
  'date-min': string,
  'req-loc': boolean
};

export type FireballRes = {
  signature: {
    version: string;
    source: string;
  };
  count: number;
  fields: string[];
  data: Array<Array<string | number>>;
};
// MOON

export type MoonReq = {
  'date': string;
  'location': string;
}

export type MoonEntryRes = {
  datetime: string;
  sunrise: string;
  sunset: string;
  moonphase: number;
  moonrise: string;
  moonset: string;
}

export type MoonRes = {
  description: Record<string, string>;
  days: MoonEntryRes[];
}