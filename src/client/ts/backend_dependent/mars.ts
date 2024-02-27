import { createTitle, createFooter, formatDate, createSunBackButton } from '.././base';
import { MarsWeatherRes as MarsData } from '../../../common/api';
import * as d3 from 'd3';
import { getWeatherData } from '../mars/weatherDataCollection';
import { extractAndDisplayTemperature } from '../mars/createTemperatureGraph';
import { TemperatureData } from '../mars/createTemperatureGraph';
import { createModal, openModal } from "../mars/modal";
import { createImage } from '.././base';
import marsModifiedUrl from '../../img/mars-modified.png';
import marsModalUrl from '../../img/marsModal.jpg';
import {check} from '../mars/brush'

export let isCelsius = true;
export let isSol = true;
let currentDate: string = "";
let currentDateSol: string = "";
export const marsContainer = document.getElementById('mars-container') as HTMLDivElement;
export let weatherData: MarsData;
let text = "Note: Mars weather forecasts are subject to occasional delays due to dust storms. \
Stay tuned for updates when planning outdoor activities or rover missions. Embrace the challenges of the Martian atmosphere. Safe travels!";
async function initMars(): Promise<void> {
  try {
    if (marsContainer) {
      marsContainer.innerHTML = '';
      weatherData = await getWeatherData();
      currentDate = weatherData.soles[0]?.terrestrial_date || '';
      currentDateSol = weatherData.soles[0]?.sol || '';
      renderWeather();
      createTitle(marsContainer, `Mars Weather`, text, isSol, formatDate(currentDate), currentDateSol);
      createFooter(marsContainer);
      createSunBackButton(marsContainer);
      createImage(marsContainer, marsModifiedUrl, "", null);

    }
  } catch (error) {
    console.error("Error initializing weather app", error);
  }
}





async function toggleDateUnit() {
  isSol = !isSol;
  renderWeather();
  createTitle(marsContainer, `Mars Weather`, "Note: Mars weather forecasts are subject to occasional delays due to dust storms. \
  Stay tuned for updates when planning outdoor activities or rover missions. Embrace the challenges of the Martian atmosphere. Safe travels!",
    isSol, formatDate(currentDate), currentDateSol);
}

async function toggleTemperatureUnit() {
  isCelsius = !isCelsius;
  renderWeather();
}
export function createInnerWeatherBox(moreInfo: boolean, sol: any): HTMLDivElement {
  const innerWeatherBox = document.createElement('div');
  innerWeatherBox.classList.add('grey-box');
  if (sol == undefined) return innerWeatherBox;

  const title = document.createElement('h1');
  title.textContent = isSol ? `Sol ${sol.sol}` : `${formatDate(sol.terrestrial_date)}`;
  title.id = "mars-title";


  const temperatureMin = isCelsius ? sol.min_temp : sol.min_temp_fahrenheit;
  const temperatureMax = isCelsius ? sol.max_temp : sol.max_temp_fahrenheit;
  innerWeatherBox.appendChild(title);
  innerWeatherBox.innerHTML += `
      <p>Min.: ${temperatureMin} <span id="celsius-unit-min" class="${isCelsius ? 'selected' : ''}">°C</span> | <span id="fahrenheit-unit-min" class="${!isCelsius ? 'selected' : ''}">°F</span></p>
      <p>Max.: ${temperatureMax} <span id="celsius-unit-max" class="${isCelsius ? 'selected' : ''}">°C</span> | <span id="fahrenheit-unit-max" class="${!isCelsius ? 'selected' : ''}">°F</span></p>
  `;

  const button = document.createElement('button');
  button.id = 'more-information';
  button.textContent = 'More Information';
  innerWeatherBox.appendChild(button);

  if (moreInfo) {
    innerWeatherBox.innerHTML += `
    <p>Weather: ${sol.atmo_opacity}</p>
    <p>UV: ${sol.local_uv_irradiance_index}</p>
        <p>Pressure: ${sol.pressure} Pa</p>
        <p>Sunrise: ${sol.sunrise}</p>
        <p>Sunset: ${sol.sunset}</p>
        <p>Season: ${sol.season}</p>
        <p>Wind Speed: ${sol.wind_speed} m/s</p>
        <p>Wind Direction: ${sol.wind_direction}°</p>
        
      `;
  }

  // Adding event listener directly to the created innerWeatherBox
  innerWeatherBox.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (((target.id === 'celsius-unit-min' || target.id === 'celsius-unit-max') && !isCelsius) ||
      ((target.id === 'fahrenheit-unit-min' || target.id === 'fahrenheit-unit-max') && isCelsius)) {
      toggleTemperatureUnit();
    } else if (target.id === 'mars-title') {
      toggleDateUnit();
    } else if (target.id === 'more-information') {
      createModal();
      openModal(marsModalUrl, weatherData, false, false);
    }
  });

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
    for (let i = Math.min(weatherData.soles.length, 365); i > 0; i--) {
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
    check(temperatureData, isCelsius)
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


    }

    // Append the new box to the body
    if (weatherData.soles[0] === undefined) return;
    outerWeatherBox.innerHTML = '';
    outerWeatherBox.appendChild(createInnerWeatherBox(false, weatherData.soles[0]));

    marsContainer.appendChild(outerWeatherBox);
  }
}


initMars();
d3.select(window).on('resize', renderWeather);

