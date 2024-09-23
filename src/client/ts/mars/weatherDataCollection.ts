import { MarsWeatherRes as MarsData, marsWeatherTarget } from '../../../common/api';
import { celsiusToFahrenheit } from '.././base';

export async function getWeatherData(): Promise<MarsData> {
    try {
      const response = await fetch(marsWeatherTarget.resolve({}));
      console.log(response, "response mars");
      const data = await response.json() as MarsData;
      data.soles.forEach(sol => {
        if (sol.min_temp) {
          sol.min_temp_fahrenheit = celsiusToFahrenheit(parseFloat(sol.min_temp)).toFixed(2);
        }
  
        if (sol.max_temp) {
          sol.max_temp_fahrenheit = celsiusToFahrenheit(parseFloat(sol.max_temp)).toFixed(2);
        }
      });
      return data;
    } catch (error) {
      console.error("Error fetching weather data", error);
      throw error;
    }
  }