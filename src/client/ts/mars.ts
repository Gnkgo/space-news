import { apiKey } from './api';
import { createTitle, createText, createFooter, formatDate, celsiusToFahrenheit } from './base';

const backupDate = "2023-10-01";
const weatherURL = 'https://mars.nasa.gov/rss/api/?feed=weather&category=msl&feedtype=json';
const roverName = "curiosity";
let isCelsius = true;
let isSol = true;
let currentDate: string = "";
let currentDateSol: string = "";

interface SolEntry {
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

interface MarsData {
  descriptions: Record<string, string>;
  soles: SolEntry[];
}

async function init(): Promise<void> {
  try {
    console.log("Initializing weather app");
    createTemperatureToggleBox(); // Call the function to create the temperature toggle box
    createDateToggle();
    const weatherData = await getWeatherData();
    renderWeather(weatherData);
    renderRoverPhotos();
    createTitle(`Mars Weather`, isSol, formatDate(currentDate), currentDateSol);
    createText("The weather data is collected by NASA which is currently on Mars. The data is updated every day. Note that the weather is due to storms and other inconveniences not always available and has a delay up to two weeks.")
    createFooter();
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
  const backUpURL = `https://api.nasa.gov/mars-photos/api/v1/rovers/${roverName}/photos?earth_date=${backupDate}&api_key=${apiKey}`;
  const roverApiUrl = `https://api.nasa.gov/mars-photos/api/v1/rovers/${roverName}/photos?earth_date=${currentDate}&api_key=${apiKey}`;

  const main = document.getElementById("main");
  const photoData = await getRoverPhotos(roverApiUrl);
  let photo;
  if (main) {
    if (photoData.photos.length > 0) {
      console.log(photoData.photos.length, "photos");
      photo = photoData.photos[Math.floor(Math.random() * photoData.photos.length)]; // Take the first photo
    } else {
      const photoDataBackUp = await getRoverPhotos(backUpURL);
      console.log(photoDataBackUp.photos.length, "photos");
      const index = Math.floor(Math.random() * photoDataBackUp.photos.length);
      photo = photoDataBackUp.photos[index];
    }

    document.body.style.backgroundImage = `url('${photo.img_src}')`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.overflow = "hidden";
  }
}

async function getWeatherData(): Promise<MarsData> {
  try {
    const response = await fetch(weatherURL);
    const data = await response.json() as MarsData;

    // Calculate and assign Fahrenheit temperatures
    data.soles.forEach(sol => {
      if (sol.min_temp) {
        sol.min_temp_fahrenheit = celsiusToFahrenheit(parseFloat(sol.min_temp)).toFixed(2);
      }

      if (sol.max_temp) {
        sol.max_temp_fahrenheit = celsiusToFahrenheit(parseFloat(sol.max_temp)).toFixed(2);
      }
    });

    console.log("Weather data fetched successfully", data);
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
  createTitle(`Mars Weather`, isSol, formatDate(currentDate), currentDateSol);
}

async function toggleTemperatureUnit() {
  isCelsius = !isCelsius;
  const weatherData = await getWeatherData();
  renderWeather(weatherData);
}

function createTemperatureToggleBox() {
  const temperatureToggleBox = document.createElement("div");
  temperatureToggleBox.id = "temperatureToggleBox";
  const todayWeather = document.getElementById("today-weather-box-outer");


  const celsiusButton = document.createElement("button");
  celsiusButton.textContent = "C";
  celsiusButton.addEventListener("click", () => {
    if (!isCelsius) {
      toggleTemperatureUnit();
    }
  });
  const fahrenheitButton = document.createElement("button");
  fahrenheitButton.textContent = "F";
  fahrenheitButton.addEventListener("click", () => {
    if (isCelsius) {
      toggleTemperatureUnit();
    }
  });

  temperatureToggleBox.appendChild(celsiusButton);
  temperatureToggleBox.appendChild(fahrenheitButton);

  todayWeather?.appendChild(temperatureToggleBox);

}


function createDateToggle() {
  const body = document.body;
  const dateToggleBox = document.createElement("div");
  dateToggleBox.id = "dateToggleBox";

  const solButton = document.createElement("button");
  solButton.textContent = "Sol";
  solButton.addEventListener("click", () => {
    if (!isSol) {
      toggleDateUnit();
    }
  });

  const earthButton = document.createElement("button");
  earthButton.textContent = "Earth";
  earthButton.addEventListener("click", () => {
    if (isSol) {
      toggleDateUnit();
    }
  });

  dateToggleBox.appendChild(solButton);
  dateToggleBox.appendChild(earthButton);

  body?.appendChild(dateToggleBox);
}


function renderWeather(data: MarsData): void {
  const appElement = document.getElementById("main");

  if (appElement && data.soles.length > 0) {
    appElement.innerHTML = '';
    const outerWeatherBox = document.createElement("div");
    outerWeatherBox.className = "weather-box-outer";


    for (let i = Math.min(data.soles.length, 6); i > 0; i--) {

      const sol = data.soles[i];
      if (sol == undefined) return;
      const innerWeatherBox = document.createElement("div");
      innerWeatherBox.className = "weather-box";


      const title = document.createElement("h3");
      if (isSol) {
        title.textContent = `Sol ${sol.sol}`;
      } else {
        title.textContent = `${formatDate(sol.terrestrial_date)}`;
      }
      innerWeatherBox.appendChild(title);


      if (isCelsius) {
        innerWeatherBox.innerHTML += `
        <p>Min.: ${sol.min_temp} °C</p>
        <p>Max.: ${sol.max_temp} °C</p>
      `;
      } else {
        innerWeatherBox.innerHTML += `
        <p>Min.: ${sol.min_temp_fahrenheit} °F</p>
        <p>Max.: ${sol.max_temp_fahrenheit} °F</p>
      `;
      }

      innerWeatherBox.innerHTML += `
      <p>Weather: ${sol.atmo_opacity}</p>
      <p>UV: ${sol.local_uv_irradiance_index}</p>
      `;

      outerWeatherBox.appendChild(innerWeatherBox);
    }
    todayWeather(data);
    appElement.appendChild(outerWeatherBox);
  }
}

function todayWeather(data: MarsData): void {
  const body = document.body;
  if (body && data.soles.length > 0) {
    const sol = data.soles[0];
    if (sol == undefined) return;

    let outerWeatherBox = document.getElementById("today-weather-box-outer");

    if (!outerWeatherBox) {
      outerWeatherBox = document.createElement("div");
      outerWeatherBox.id = "today-weather-box-outer";
      outerWeatherBox.className = "today-weather-box-outer";
    } else {
      // Remove the existing box from the body
      outerWeatherBox.parentNode?.removeChild(outerWeatherBox);
      outerWeatherBox.innerHTML = ''; // Clear inner HTML
    }

    const innerWeatherBox = document.createElement("div");
    innerWeatherBox.id = "weather-box";
    innerWeatherBox.className = "weather-box"; // Add a class for styling

    const title = document.createElement("h3");
    if (isSol) {
      title.textContent = `Sol ${sol.sol}`;
    } else {
      title.textContent = `${formatDate(sol.terrestrial_date)}`;
    }
    innerWeatherBox.appendChild(title);

    if (isCelsius) {
      innerWeatherBox.innerHTML += `
        <p>Min.: ${sol.min_temp} °C</p>
        <p>Max.: ${sol.max_temp} °C</p>
      `;
    } else {
      innerWeatherBox.innerHTML += `
        <p>Min.: ${sol.min_temp_fahrenheit} °F</p>
        <p>Max.: ${sol.max_temp_fahrenheit} °F</p>
      `;
    }

    innerWeatherBox.innerHTML += `
      <p>Weather: ${sol.atmo_opacity}</p>
      <p>UV: ${sol.local_uv_irradiance_index}</p>
      <p>Wind: ${sol.wind_speed} m/s</p>
      <p>Pressure: ${sol.pressure} Pa</p>
      <p>Humidity: ${sol.abs_humidity} %</p>
      <p>Sunrise: ${sol.sunrise}</p>
      <p>Sunset: ${sol.sunset}</p>
    `;

    currentDate = sol.terrestrial_date;
    currentDateSol = sol.sol;
    
    // Append the new box to the body
    outerWeatherBox.appendChild(innerWeatherBox);
    body.appendChild(outerWeatherBox);
  }
}



init();
