export const cadTarget = '/nasa-cad-api';
export const marsWeatherTarget = '/nasa-mars-weather-api';
export const marsRoverPhotosTarget = '/nasa-mars-rover-photos-api';

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
  'date': string;
  'camera': string;
}

export type MarsRoverPhotosRes = any;

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


export type MoonDataRes = {
  description: Record<string, string>;
  days: MoonEntryRes[];
}




