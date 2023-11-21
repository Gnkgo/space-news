

const apiKey = 'ZuW891bZkaap2ZJ9L1tJHldstVbEZfWZef1WpSHX '
const weatherURL = `https://mars.nasa.gov/rss/api/?feed=weather&category=insight_temperature&feedtype=json&ver=1.0`;
const roverName = "curiosity";
function getFormattedDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

const backupDate = "2021-08-01";
const todayDate = getFormattedDate();
const backUpURL = `https://api.nasa.gov/mars-photos/api/v1/rovers/${roverName}/photos?earth_date=${backupDate}&api_key=${apiKey}`;
const roverApiUrl = `https://api.nasa.gov/mars-photos/api/v1/rovers/${roverName}/photos?earth_date=${todayDate}&api_key=${apiKey}`;

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
  const appElement = document.getElementById("marsID");
  const photoData = await getRoverPhotos(roverApiUrl);
  let photo;
  console.log("CHECK");
  if (appElement) {
    console.log("APP ELEMENT");
    if (photoData.photos.length > 0) {
      console.log("PICTURES");
      photo = photoData.photos[0]; // Take the first photo
    } else {
      console.log("NO PICTURES");
      const photoDataBackUp = await getRoverPhotos(backUpURL);
      photo = photoDataBackUp.photos[0];
    }

    // Inside the renderRoverPhotos function after setting the photoBox content
    document.body.style.backgroundImage = `url('${photo.img_src}')`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.overflow = "hidden"; // Optional: To hide scrollbars if needed


    //const photoBox = document.createElement("div");
    //photoBox.className = "photo-box";
//
    //// Display the image and other relevant information
    //photoBox.innerHTML = `
    //    <img src="${photo.img_src}" alt="Mars Rover Photo">
    //    <p>Sol: ${photo.sol}</p>
    //    <p>Earth Date: ${photo.earth_date}</p>
    //    <p>Camera: ${photo.camera.full_name}</p>
    //  `;
//
    //// Append the photoBox to the 'app' element
    //appElement.appendChild(photoBox);

    // Set the background image of the body element

  }
}

renderRoverPhotos();


async function getWeatherData(): Promise<any> {
  try {
    const response = await fetch(weatherURL);
    const data = await response.json();
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
    const weatherData = await getWeatherData();
    renderWeather(weatherData);
  } catch (error) {
    console.error("Error initializing weather app", error);
  }
}

function renderWeather(data: any): void {
  const appElement = document.getElementById("marsID");
 
  if (appElement) {
    const maxSol: string = data.sol_keys.reduce((max: string, solKey: string) => {
      return parseInt(solKey, 10) > parseInt(max, 10) ? solKey : max;
    }, data.sol_keys[0]);

    const outerWeatherBox = document.createElement("div");
    outerWeatherBox.className = "weather-box-outer";

    const innerWeatherBox = document.createElement("div");
    innerWeatherBox.className = "weather-box";

    innerWeatherBox.innerHTML = `
      <h2>Sol ${maxSol}</h2>
      <p>Average Temperature: ${data[maxSol].AT.av} °C</p>
      <p>Horizontal Wind Speed: ${data[maxSol].HWS.av} m/s</p>
      <p>Atmospheric Pressure: ${data[maxSol].PRE.av} Pa</p>
      <p>Season: ${data[maxSol].Season}</p>
    `;

    outerWeatherBox.appendChild(innerWeatherBox);
    appElement.appendChild(outerWeatherBox);
  }
}



init();
