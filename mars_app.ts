// src/app.ts
const marsWeatherAPI = 'https: //api.nasa.gov/insight_weather/?api_key=5vvRuFXWmXxt0S2T1Etrp7DuKKUOIFa9DlrHx8gC&feedtype=json&ver=1.0';

//AT atmospheric temperature
//HWS horizontal wind speed
//PRE atmospheric pressure
//WD wind direction
//Season





async function getMarsWeather() {
  try {
    const response = await fetch(marsWeatherAPI);
    const data = await response.json();
    console.log(response);
    return data;
  } catch (error) {
    console.error('Error fetching Mars weather:', error);
  }
}

function displayWeather(data: any) {
  const appDiv = document.getElementById('app');
  if (appDiv) {
    appDiv.innerHTML = `<h1>Mars Weather</h1>
      <p>${data ? `Temperature: ${data.temperature}°C` : 'Failed to fetch data'}</p>`;
  }
}

async function init() {
  const marsWeatherData = await getMarsWeather();
  displayWeather(marsWeatherData);
}

init();
