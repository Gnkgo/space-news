export interface SolEntry {
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
  
  export interface MarsData {
    descriptions: Record<string, string>;
    soles: SolEntry[];
  }