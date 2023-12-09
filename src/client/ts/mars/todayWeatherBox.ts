import { weatherData, isSol, isCelsius, marsContainer, } from "../backend_dependent/mars";
import { formatDate } from "../base";
import { TemperatureData, extractAndDisplayTemperature } from "./createTemperatureGraph";
import { openModal, createModal } from './modal';



export function createInnerWeatherBox(moreInfo: boolean, sol: any): HTMLDivElement {
  const innerWeatherBox = document.createElement('div');
  innerWeatherBox.classList.add('grey-box');
  if (sol == undefined) return innerWeatherBox;


  const title = document.createElement('h1');
  title.textContent = isSol ? `Sol ${sol.sol}` : `${formatDate(sol.terrestrial_date)}`;
  innerWeatherBox.appendChild(title);

  innerWeatherBox.innerHTML += `
      <p>Min.: ${sol.min_temp} <span id="celsius-unit-min" class="${isCelsius ? 'selected' : ''}">°C</span> | <span id="fahrenheit-unit-min" class="${!isCelsius ? 'selected' : ''}">°F</span></p>
      <p>Max.: ${sol.max_temp} <span id="celsius-unit-max" class="${isCelsius ? 'selected' : ''}">°C</span> | <span id="fahrenheit-unit-max" class="${!isCelsius ? 'selected' : ''}">°F</span></p>
      <p>Weather: ${sol.atmo_opacity}</p>
      <p>UV: ${sol.local_uv_irradiance_index}</p>
  `;

  if (moreInfo) {
    innerWeatherBox.innerHTML += `
        <p>Pressure: ${sol.pressure} Pa</p>
        <p>Sunrise: ${sol.sunrise}</p>
        <p>Sunset: ${sol.sunset}</p>
        <p>Season: ${sol.season}</p>
        <p>Wind Speed: ${sol.wind_speed} m/s</p>
        <p>Wind Direction: ${sol.wind_direction}°</p>
        
      `;
  }

  return innerWeatherBox;
}


export function renderWeather(): void {
  let marsMain = marsContainer.querySelector("main");
  if (!marsMain) {
    marsMain = document.createElement("main");
    marsContainer.appendChild(marsMain);
  } else {
    marsMain.innerHTML = '';
  }
  let temperatureData: TemperatureData[] = [];
  if (marsMain && weatherData.soles.length > 0) {
    for (let i = Math.min(weatherData.soles.length, 200); i > 0; i--) {
      const sol = weatherData.soles[i];
      if (sol == undefined) continue;
      temperatureData.push({
        terrestrial_date: sol.terrestrial_date,
        min_temp: sol.min_temp,
        max_temp: sol.max_temp,
        min_temp_fahrenheit: sol.min_temp_fahrenheit || '',
        max_temp_fahrenheit: sol.max_temp_fahrenheit || '',
        isCelcius: isCelsius
      });
    }
    todayWeather();
    extractAndDisplayTemperature(temperatureData, isCelsius);
  }
}



export function todayWeather(): void {
  if (marsContainer && weatherData.soles.length > 0) {
    const sol = weatherData.soles[0];
    if (sol == undefined) return;

    let outerWeatherBox = marsContainer.querySelector("#today-weather-box");


    if (!outerWeatherBox) {
      outerWeatherBox = document.createElement("div");
      outerWeatherBox.id = "today-weather-box";
      outerWeatherBox.className = "today-weather-box";
    } else {
      outerWeatherBox.parentNode?.removeChild(outerWeatherBox);
      outerWeatherBox.innerHTML = '';
    }



    // Append the new box to the body
    if (weatherData.soles[0] === undefined) return;
    outerWeatherBox.appendChild(createInnerWeatherBox(false, weatherData.soles[0]));
    //outerWeatherBox.addEventListener("click", () => {
    //  createModal();
    //  openModal("src/client/img/marsModal.jpg", weatherData, false);
    //}
    //);
    marsContainer.appendChild(outerWeatherBox);
  }
}