//import {apiKey, getFormattedDate} from './api';

const apiKey = 'ZuW891bZkaap2ZJ9L1tJHldstVbEZfWZef1WpSHX'
const weatherURL = 'https://mars.nasa.gov/rss/api/?feed=weather&category=msl&feedtype=json';
const roverName = "curiosity";

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

let currentDate: string = "";
let currentDateSol: string = "";

function getFormattedDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const backupDate = "2023-11-01";
const todayDate = getFormattedDate();


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
  const backUpURL = `https://api.nasa.gov/mars-photos/api/v1/rovers/${roverName}/photos?earth_date=${currentDate}&api_key=${apiKey}`;
  const roverApiUrl = `https://api.nasa.gov/mars-photos/api/v1/rovers/${roverName}/photos?earth_date=${todayDate}&api_key=${apiKey}`;

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

function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9 / 5) + 32;
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

async function init(): Promise<void> {
  try {
    console.log("Initializing weather app");
    createTemperatureToggleBox(); // Call the function to create the temperature toggle box

    const weatherData = await getWeatherData();
    renderWeather(weatherData);
    renderRoverPhotos();
    createTitle(`Mars Weather`);
    createText("The weather data is collected by NASA which is currently on Mars. The data is updated every day. Note that the weather is due to storms and other inconveniences not always available and has a delay up to two weeks.")
    createFooter();
  } catch (error) {
    console.error("Error initializing weather app", error);
  }
}
let isCelsius = true;

async function toggleTemperatureUnit() {
  isCelsius = !isCelsius;
  const weatherData = await getWeatherData();
  renderWeather(weatherData); // Assuming weatherData is a global variable or accessible within the scope
}

function createTemperatureToggleBox() {
  const body = document.body;
  const temperatureToggleBox = document.createElement("div");
  temperatureToggleBox.id = "temperatureToggleBox";

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

  body?.appendChild(temperatureToggleBox);
}



function renderWeather(data: MarsData): void {
  const appElement = document.getElementById("main");

  if (appElement && data.soles.length > 0) {
    appElement.innerHTML = '';
    const outerWeatherBox = document.createElement("div");
    outerWeatherBox.className = "weather-box-outer";


    for (let i = Math.min(data.soles.length, 6); i >= 0; i--) {

      const sol = data.soles[i];
      if (sol == undefined) return;
      const innerWeatherBox = document.createElement("div");
      innerWeatherBox.className = "weather-box";

      const solElement = document.createElement("h2");
      solElement.textContent = `Sol ${sol.sol}`;
      innerWeatherBox.appendChild(solElement);


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

      innerWeatherBox.innerHTML +=  `
      <p>Weather: ${sol.atmo_opacity}</p>
      <p>UV: ${sol.local_uv_irradiance_index}</p>
      `;
      currentDate = sol.terrestrial_date;
      outerWeatherBox.appendChild(innerWeatherBox);
    }
    appElement.appendChild(outerWeatherBox);
  }
}




function createTitle(title: string) {
  const body = document.body;
  const titleElement = document.createElement("h1");
  titleElement.textContent = title;
  body?.appendChild(titleElement);
}

function createText(text: string) {
  const body = document.body;
  const textElement = document.createElement("p");
  textElement.textContent = text;
  body?.appendChild(textElement);
}

function createFooter() {
  const body = document.body;
  const footer = document.createElement("footer");  
  footer.textContent = "© 2023 by DeValdi - Gnkgo - Nick20500";
  body?.appendChild(footer);
}

init();
