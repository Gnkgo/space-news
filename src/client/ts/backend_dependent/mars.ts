import { createTitle, createText, createFooter, formatDate, celsiusToFahrenheit, createSunBackButton, changeElemDisplay } from '.././base';
import { MarsWeatherRes as MarsData, MarsRoverPhotosRes, SolEntryRes, marsWeatherTarget } from '../../../common/api';
import { marsRoverPhotosTarget } from '../../../common/api';
import { extractAndDisplayTemperature } from '../mars/createTemperatureGraph';


const rovers = ["curiosity", "opportunity", "spirit"];
let randomRover = rovers[Math.floor(Math.random() * rovers.length)];

let isCelsius = true;
let isSol = true;
let currentDate: string = "";
let currentDateSol: string = "";
const marsContainer = document.getElementById('mars-container') as HTMLDivElement;
let weatherData: MarsData;

interface TemperatureData {
  terrestrial_date: string;
  min_temp: string;
  max_temp: string;
}

async function init(): Promise<void> {
  try {
    if (marsContainer) {
      createButtons();
      weatherData = await getWeatherData();
      renderWeather();
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




async function getRoverPhotos(): Promise<MarsRoverPhotosRes> {
  try {
    if (randomRover == undefined) randomRover = "opportunity";
    const response = await fetch(marsRoverPhotosTarget.resolve({ rover: randomRover }));
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching rover photos", error);
    throw error;
  }
}

async function renderRoverPhotos(): Promise<void> {
  const photoData = await getRoverPhotos();
  let photo: any;


  if (photoData.photos.length > 0) {
    photo = photoData.photos[Math.floor(Math.random() * photoData.photos.length)];
  }
  createModal();

  openModal(photo);


  // Create a button element
  //const showImageButton = createButton("buttons", "Show Mars", "pictures");
  //showImageButton.addEventListener("click", () => openModal(photo.img_src)); // Pass the image URL to the function
}

// modal.ts
export function openModal(photo: any): void {
  const modal = document.getElementById("myModal") as HTMLElement;
  const modalImage = document.getElementById("modalImage") as HTMLImageElement;

  modalImage.src = photo.img_src;
  modal.style.display = "block";
}


function closeModal(): void {
  const modal = document.getElementById("myModal") as HTMLElement;
  modal.style.display = "none";
}


function createModal(): void {
  const modal = document.createElement("div");
  modal.id = "myModal";
  modal.className = "modal";

  const closeBtn = document.createElement("span");
  closeBtn.className = "close";
  closeBtn.innerHTML = "&times;";
  closeBtn.onclick = closeModal;

  const modalImage = document.createElement("img");
  modalImage.src = "";
  modalImage.id = "modalImage";
  modalImage.alt = "Mars Rover Photo";

  modal.appendChild(closeBtn);
  modal.appendChild(modalImage);

  document.body.appendChild(modal);
}






async function getWeatherData(): Promise<MarsData> {
  try {
    const response = await fetch(marsWeatherTarget.resolve({}));
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

async function toggleDateUnit() {
  isSol = !isSol;
  renderWeather();
  createTitle(marsContainer, `Mars Weather`, isSol, formatDate(currentDate), currentDateSol);
}

async function toggleTemperatureUnit() {
  isCelsius = !isCelsius;
  renderWeather();
}
function createButtons(): void {
  const buttonBox = document.createElement("div");
  buttonBox.id = "button-box";
  buttonBox.className = "button-box";

  const buttonLabels = { 'pictures': 'Show Mars', 'celsius': '°C', 'fahrenheit': '°F', 'earth-date': 'Earth', 'mars-date': 'Sol' };

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

function handleButtonClick(label: string): void {
  console.log("HANDLECLICK");
  console.log(label);
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


function createInnerWeatherBox(moreInfo: boolean, sol: SolEntryRes): HTMLDivElement {
  const innerWeatherBox = document.createElement('div');
  innerWeatherBox.classList.add('grey-box');
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


function renderWeather(): void {
  let marsMain = marsContainer.querySelector("main");
  if (!marsMain) {
    marsMain = document.createElement("main");
    marsContainer.appendChild(marsMain);
  } else {
    marsMain.innerHTML = '';
  }
  let temperatureData: TemperatureData[] = [];
  if (marsMain && weatherData.soles.length > 0) {
    const outerWeatherBox = document.createElement("div");
    outerWeatherBox.className = "weather-boxes";
    for (let i = Math.min(weatherData.soles.length, 300); i > 0; i--) {
      const sol = weatherData.soles[i];
      if (sol == undefined) continue;
      temperatureData.push({
        terrestrial_date: sol.terrestrial_date,
        min_temp: sol.min_temp,
        max_temp: sol.max_temp
      });
      outerWeatherBox.appendChild(createInnerWeatherBox(false, sol));
    }
    todayWeather();
    extractAndDisplayTemperature(temperatureData);
    //marsMain.appendChild(outerWeatherBox,);
  }
}



function todayWeather(): void {
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

    currentDate = sol.terrestrial_date;
    currentDateSol = sol.sol;

    // Append the new box to the body
    if (weatherData.soles[0] === undefined) return;
    outerWeatherBox.appendChild(createInnerWeatherBox(true, weatherData.soles[0]));
    marsContainer.appendChild(outerWeatherBox);
  }
}

init();
