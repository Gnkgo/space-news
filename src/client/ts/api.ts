// NASA Key
export const apiKey = 'ZuW891bZkaap2ZJ9L1tJHldstVbEZfWZef1WpSHX'; // DEPRECATED, remove soon (moved to backend)

export function getFormattedDate(): string { // DEPRECATED, remove soon (moved to common)
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

//Mars Weather
export const weatherURL = 'https://mars.nasa.gov/rss/api/?feed=weather&category=msl&feedtype=json'; // DEPRECATED, remove soon (moved to backend)

// Mars Pictures
const rovers = ["curiosity", "opportunity", "spirit"];
export const randomRover = rovers[Math.floor(Math.random() * rovers.length)]!;
export const roverAPIUrl = `https://api.nasa.gov/mars-photos/api/v1/manifests/${randomRover}?api_key=${apiKey}`; // DEPRECATED, remove soon (moved to backend)

// Moon
export const moonAPI = 'TANA3BSE43X9AFK3TDSPXST5P'; // DEPRECATED, remove soon (moved to backend)
export const moonURL = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/zurich?next30days?unitGroup=metric&include=days&key=${moonAPI}&contentType=json&elements=datetime,moonphase,sunrise,sunset,moonrise,moonset`; // DEPRECATED, remove soon (moved to backend)
