import { createTitle, createText, createFooter, formatDate, createSunBackButton, changeElemDisplay } from '.././base';
import { MarsWeatherRes as MarsData } from '../../../common/api';
import * as d3 from 'd3';
import { renderRoverPhotos } from '../mars/roverPhotos';
import { renderWeather } from '../mars/todayWeatherBox';
import { getWeatherData } from '../mars/weatherDataCollection';

export let isCelsius = true;
export let isSol = true;
let currentDate: string = "";
let currentDateSol: string = "";
export const marsContainer = document.getElementById('mars-container') as HTMLDivElement;
export let weatherData: MarsData;
let text = "Note: Mars weather predictions are subject to occasional delays due to dust storms. \
If planning outdoor activities or rover missions, stay tuned for updates and exercise caution during storms. Embrace the challenges of Mars' atmosphere. Safe travels!";
async function initMars(): Promise<void> {
  try {
    if (marsContainer) {
      weatherData = await getWeatherData();
      currentDate = weatherData.soles[0]?.terrestrial_date || '';
      currentDateSol = weatherData.soles[0]?.sol || '';
      renderWeather();
      createTitle(marsContainer, `Mars Weather`, text, isSol, formatDate(currentDate), currentDateSol);
      createFooter(marsContainer);
      createSunBackButton(marsContainer);
      createButtons();
    }
  } catch (error) {
    console.error("Error initializing weather app", error);
  }
}

function handleButtonClick(label: string): void {
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
  } else if (label === "test") {
    changeElemDisplay('test-button', 'test2-button');
    renderRoverPhotos();
  } else if (label === "test2") {
    changeElemDisplay('test2-button', 'test-button');
    renderRoverPhotos();
  }
}

function createButtons(): void {
  console.log("Creating buttons");
  const buttonBox = document.createElement("div");
  buttonBox.id = "button-box";
  buttonBox.className = "button-box";
  const buttonLabels = { 'test': 'Show Mars', 'test2': 'Show Mars', 'celsius': '°C', 'fahrenheit': '°F', 'earth-date': 'Earth', 'mars-date': 'Sol' };

  for (const [key, label] of Object.entries(buttonLabels)) {
    const button = createButton('buttonChange', label, key);
    button.addEventListener("click", () => handleButtonClick(key));
    buttonBox.appendChild(button);
  }

  marsContainer.appendChild(buttonBox);
}

function createButton(className: string, label: string, id: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.className = className;
  button.id = `${id}-button`;
  button.textContent = label;

  return button;

}

async function toggleDateUnit() {
  isSol = !isSol;
  renderWeather();
  createTitle(marsContainer, `Mars Weather`, "Note: Mars weather predictions are subject to occasional delays due to dust storms. \
  If planning outdoor activities or rover missions, stay tuned for updates and exercise caution during storms. Embrace the challenges of Mars' atmosphere. Safe travels!",
   isSol, formatDate(currentDate), currentDateSol);
}

async function toggleTemperatureUnit() {
  isCelsius = !isCelsius;
  renderWeather();
}


initMars();
d3.select(window).on('resize', renderWeather);

