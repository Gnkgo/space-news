import { createTitle, createText, createFooter, formatDate, createSunBackButton, changeElemDisplay } from '.././base';
import { MarsWeatherRes as MarsData } from '../../../common/api';
import * as d3 from 'd3';
import { renderRoverPhotos } from '../mars/roverPhotos';
import { renderWeather } from '../mars/todayWeatherBox';
import { createButtons } from '../mars/buttons';
import { getWeatherData } from '../mars/weatherDataCollection';

export let isCelsius = true;
export let isSol = true;
let currentDate: string = "";
let currentDateSol: string = "";
export const marsContainer = document.getElementById('mars-container') as HTMLDivElement;
export let weatherData: MarsData;
  
async function init(): Promise<void> {
  try {
    if (marsContainer) {
      createButtons();
      weatherData = await getWeatherData();
      currentDate = weatherData.soles[0]?.terrestrial_date || '';
      currentDateSol = weatherData.soles[0]?.sol || '';
      renderWeather();
      d3.select(window).on('resize', renderWeather);
      createTitle(marsContainer, `Mars Weather`, isSol, formatDate(currentDate), currentDateSol);
      createText(marsContainer, "Please be advised that our weather predictions on Mars are subject to occasional \
      delays due to unpredictable dust storms. \
      If you're planning outdoor activities or rover missions, stay tuned for real-time updates and exercise caution during stormy conditions. Stay tuned for the latest weather reports \
      from the fourth rock from the sun, and embrace the unique challenges that Mars\' atmosphere presents. Safe travels!", "Note: Mars weather predictions are subject to occasional delays due to dust storms. \
      If planning outdoor activities or rover missions, stay tuned for updates and exercise caution during storms. Embrace the challenges of Mars' atmosphere. Safe travels!");
      createFooter(marsContainer);
      createSunBackButton(marsContainer);
    }
  } catch (error) {
    console.error("Error initializing weather app", error);
  }
}



async function toggleDateUnit() {
  isSol = !isSol;
  renderWeather();
  createTitle(marsContainer, `Mars Weather`, isSol, formatDate(currentDate), currentDateSol);
}

async function toggleTemperatureUnit() {
  isCelsius = !isCelsius;
  renderWeather();
}


export function handleButtonClick(label: string): void {
  if (label === "mars-date") {
    changeElemDisplay('mars-date-button', 'earth-date-button');
    toggleDateUnit();
  } else if (label === "earth-date") {
    changeElemDisplay('earth-date-button', 'mars-date-button');
    toggleDateUnit();
  } else if (label === "celsius") {
    changeElemDisplay('celsius-button', 'fahrenheit-button');
    toggleTemperatureUnit();
  } else if (label === "fahrenheit") {
    changeElemDisplay('fahrenheit-button', 'celsius-button');
    toggleTemperatureUnit();
  } else if (label === "pictures") {
    console.log("CHECK");
    renderRoverPhotos();
  }
}

init();
