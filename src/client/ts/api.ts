export const apiKey = 'ZuW891bZkaap2ZJ9L1tJHldstVbEZfWZef1WpSHX'; // DEPRECATED, remove soon (moved to backend)

export const moonAPI = 'TANA3BSE43X9AFK3TDSPXST5P';

export function getFormattedDate(): string { // DEPRECATED, remove soon (moved to common)
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export const weatherURL = 'https://mars.nasa.gov/rss/api/?feed=weather&category=msl&feedtype=json';

const rovers = ["curiosity", "opportunity", "spirit"];
export const randomRover = rovers[Math.floor(Math.random() * rovers.length)];
export const roverAPIUrl = `https://api.nasa.gov/mars-photos/api/v1/manifests/${randomRover}?api_key=${apiKey}`;
