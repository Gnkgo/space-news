import {apiKey, getFormattedDate} from './api';

const dateToday = getFormattedDate();
const dateInAWeek = '2023-11-29';
const neoAPIURL = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${dateToday}&end_date=${dateInAWeek}&api_key=${apiKey}`;

fetch(neoAPIURL)
  .then((res: Response) => {
    // Handle the response here
    console.log(res.json());
  })
  .catch((error) => {
    // Handle errors
    console.log("Error: " + error)
  });
