import { apiKey, weatherURL, roverAPIUrl, randomRover } from './api';
import { createTitle, createText, createFooter, formatDate, celsiusToFahrenheit, createSunBackButton } from './base';
import { MarsWeatherRes } from '../../common/api';



let isCelsius = true;
let isSol = true;
let currentDate: string = "";
let currentDateSol: string = "";
const marsContainer = document.getElementById('mars-container') as HTMLDivElement;
let marsData: MarsWeatherRes;


async function init(): Promise<void> {
  try {
    if (marsContainer) {
      createButtons();
      const weatherData = await getWeatherData();
      renderWeather(weatherData);
      renderRoverPhotos();
      createTitle(marsContainer, `Mars Weather`, isSol, formatDate(currentDate), currentDateSol);
      createText(marsContainer, "Please be advised that our weather predictions on Mars are subject to occasional \
      delays due to unpredictable dust storms. \
      If you're planning outdoor activities or rover missions, stay tuned for real-time updates and exercise caution during stormy conditions. Stay tuned for the latest weather reports from the fourth rock from the sun, and embrace the unique challenges that Mars\' atmosphere presents. Safe travels!");
      createFooter(marsContainer);
      createSunBackButton(marsContainer);

    }
  } catch (error) {
    console.error("Error initializing weather app", error);
  }
}

async function getRoverPhotos(api: string): Promise<any> {
  try {
    const response = await fetch(api);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching rover photos", error);
    throw error;
  }
}

async function renderRoverPhotos(): Promise<void> {
  const main = marsContainer.querySelector("main");
  if (!main) {
    const mainElement = document.createElement("main");
    marsContainer.appendChild(mainElement);
  }
  const manifest = await getRoverPhotos(roverAPIUrl);
  let photo;

  const photoData = await getRoverPhotos(`https://api.nasa.gov/mars-photos/api/v1/rovers/${randomRover}/photos?sol=${manifest.photo_manifest.max_sol}&api_key=${apiKey}`);

  if (photoData.photos.length > 0) {
    photo = photoData.photos[Math.floor(Math.random() * photoData.photos.length)];
  }

  marsContainer.style.backgroundImage = `url('${photo.img_src}')`;
  marsContainer.style.backgroundSize = "cover";
  marsContainer.style.backgroundPosition = "center";
  marsContainer.style.backgroundRepeat = "no-repeat";
  marsContainer.style.overflow = "hidden";
}


async function getWeatherData(): Promise<MarsWeatherRes> {
  try {
    const response = await fetch(weatherURL);
    const data = await response.json() as MarsWeatherRes;
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

async function toggleDateUnit() {
  isSol = !isSol;
  const weatherData = await getWeatherData();
  renderWeather(weatherData);
  createTitle(marsContainer, `Mars Weather`, isSol, formatDate(currentDate), currentDateSol);
}

async function toggleTemperatureUnit() {
  isCelsius = !isCelsius;
  const weatherData = await getWeatherData();
  renderWeather(weatherData);
}
function createButtons(): void {
  const buttonBox = document.createElement("div");
  buttonBox.id = "button-box";
  buttonBox.className = "button-box";

  const buttonLabels = ["C", "F", "Earth", "Sol"];

  buttonLabels.forEach((label) => {
    const button = createButton("buttonChange", label);
    button.addEventListener("click", () => handleButtonClick(label));
    buttonBox.appendChild(button);
  });

  marsContainer.appendChild(buttonBox);
}

function createButton(className: string, label: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.className = className;
  button.textContent = label;
  return button;
}

function handleButtonClick(label: string): void {
  if (label === "Sol" && !isSol) {
    toggleDateUnit();
  } else if (label === "Earth" && isSol) {
    toggleDateUnit();
  } else if (label === "C" && !isCelsius) {
    toggleTemperatureUnit();
  } else if (label === "F" && isCelsius) {
    toggleTemperatureUnit();
  }
}


function createInnerWeatherBox(moreInfo: boolean): HTMLDivElement {
  const innerWeatherBox = document.createElement('div');
  innerWeatherBox.classList.add('grey-box');
  const sol = marsData.soles[0];
  if (sol == undefined) return innerWeatherBox;
  const title = document.createElement('h3');
  title.textContent = isSol ? `Sol ${sol.sol}` : `${formatDate(sol.terrestrial_date)}`;
  innerWeatherBox.appendChild(title);

  const temperatureUnit = isCelsius ? '°C' : '°F';
  innerWeatherBox.innerHTML += `
    <p>Min.: ${sol.min_temp} ${temperatureUnit}</p>
    <p>Max.: ${sol.max_temp} ${temperatureUnit}</p>
    <p>Weather: ${sol.atmo_opacity}</p>
    <p>UV: ${sol.local_uv_irradiance_index}</p>
  `;

  if (moreInfo) {
    innerWeatherBox.innerHTML += `
      <p>Pressure: ${sol.pressure} Pa</p>
      <p>Sunrise: ${sol.sunrise}</p>
      <p>Sunset: ${sol.sunset}</p>
    `;
  }

  return innerWeatherBox;
}


function renderWeather(data: MarsWeatherRes): void {
  let marsMain = marsContainer.querySelector("main");
  if (!marsMain) {
    marsMain = document.createElement("main");
    marsContainer.appendChild(marsMain);
  } else {
    marsMain.innerHTML = '';
  }
  if (marsMain && data.soles.length > 0) {
    const outerWeatherBox = document.createElement("div");
    outerWeatherBox.className = "weather-boxes";
    for (let i = Math.min(data.soles.length, 6); i > 0; i--) {
      const sol = data.soles[i];
      if (sol == undefined) continue;
      outerWeatherBox.appendChild(createInnerWeatherBox(false));
    }
    todayWeather();
    marsMain.appendChild(outerWeatherBox);
  }
}

function todayWeather(): void {
  if (marsContainer && marsData.soles.length > 0) {
    const sol = marsData.soles[0];
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

    currentDate = sol.terrestrial_date;
    currentDateSol = sol.sol;

    // Append the new box to the body
    outerWeatherBox.appendChild(createInnerWeatherBox(true));
    marsContainer.appendChild(outerWeatherBox);
  }
}

init();
