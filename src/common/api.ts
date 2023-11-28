export const cadTarget = '/nasa-cad-api';
export const marsWeatherTarget = '/nasa-mars-weather-api';
export const marsRoverPhotosTarget = '/nasa-mars-rover-photos-api';

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

export type SolEntry = {
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

  export type MarsWeatherReq = {};
  
  export type MarsWeatherRes = {
    descriptions: Record<string, string>;
    soles: SolEntry[];
  }

  export type MarsRoverPhotosReq = {
    earthDate: string 
  }

  export type MarsRoverPhotosRes = any;