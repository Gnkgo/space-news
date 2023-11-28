import { MoonDataRes } from '../../common/api';
import { getFormattedDate, moonAPI } from './api';
import { createTitle, createFooter, formatDate, createImage, createSunBackButton } from './base';

const moonContainer = document.getElementById('moon-container') as HTMLDivElement;
let location = 'zurich';
let today = getFormattedDate();
let currentMoonURL = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}/next30days?unitGroup=us&key=TANA3BSE43X9AFK3TDSPXST5P&contentType=json&elements=datetime,moonphase,sunrise,sunset,moonrise,moonset`;

let isCurrentDate = true;

let currentMoonData: MoonDataRes;
let pickedMoonData: MoonDataRes;

const backup: MoonDataRes = {
    description: {
      location: "Sample Location",
      timeZone: "UTC+0",
    },
    days: [
      {
        datetime: "2023-11-28T18:30:00",
        sunrise: "2023-11-28T06:30:00",
        sunset: "2023-11-28T17:45:00",
        moonphase: 0.75,
        moonrise: "2023-11-28T14:00:00",
        moonset: "2023-11-29T03:45:00",
      },
    ],
  };
  


async function getMoonData(moonURL: string): Promise<MoonDataRes> {
    try {
        const response = await fetch(moonURL);
        const data = await response.json() as MoonDataRes;
        console.log("Moon data fetched successfully", data);
        return data;
    } catch (error) {
        console.error("Error fetching weather data", error);
        throw error;
    }
}

async function initMoon(): Promise<void> {
    try {
        console.log("Initializing Moon");
        if (moonContainer) {
            createSunBackButton(moonContainer);
            createFooter(moonContainer);
            currentMoonData = await getMoonData(currentMoonURL);
            pickedMoonData = await getMoonData(currentMoonURL);
            createTitle(moonContainer, `Status Moon`, false, formatDate(currentMoonData.days[0]?.datetime), "");
            displayMoon(currentMoonData);
            moonriseMoonset(currentMoonData);
        }
    } catch (error) {
        displayMoon(backup);
        createTitle(moonContainer, `Status Moon`, false, formatDate(backup.days[0]?.datetime), "");
        moonriseMoonset(backup);
        console.error("Error initializing weather app", error);
    }
}

function moonriseMoonset(moonData: MoonDataRes): void {
    console.log("MOONDATA", moonData);
    if (moonData.days[0] !== undefined) {
        const moonrise = moonData.days[0].moonrise;
        const moonset = moonData.days[0].moonset;

        let moonBox = document.getElementById("moon-box");
        if (moonBox) moonBox.remove();
        
        moonBox = document.createElement("div");
        moonBox.id = "moon-box";
        moonBox.className = "moon-box";

        const moonContent = document.createElement("div");
        moonContent.id = "moon-content";
        moonContent.className = "grey-box";

        const title = document.createElement("h3");
        title.textContent = "Moonrise & Moonset";

        moonContent.appendChild(title);
        moonContent.innerHTML += `
        <p>Moonrise: ${moonrise}</p>
        <p>Moonset: ${moonset}</p>
      `;

        moonBox.appendChild(moonContent);
        moonContainer.appendChild(moonBox);
    }
}

function displayMoon(moonData: MoonDataRes): void {
    const moonphase = moonData.days[0]?.moonphase;
    let moonText = '';
    let moonImage = '';
    if (moonphase === undefined) {
        moonText = 'Error';
        return;
    }
    switch (true) {
        case moonphase === 0:
            moonText = 'New Moon';
            moonImage = 'src/client/img/moon_images/new-moon-modified.png';
            break;
        case moonphase < 0.25:
            moonText = 'Waxing Crescent';
            moonImage = 'src/client/img/moon_images/waxing-crescent-modified.png';
            break;
        case moonphase === 0.25:
            moonText = 'First Quarter';
            moonImage = 'src/client/img/moon_images/first-quarter-modified.png';
            break;
        case moonphase < 0.5:
            moonText = 'Waxing Gibbous';
            moonImage = 'src/client/img/moon_images/waxing-gibbous-modified.png';
            break;
        case moonphase === 0.5:
            moonText = 'Full Moon';
            moonImage = 'src/client/img/moon_images/full-modified.png';
            break;
        case moonphase < 0.75:
            moonText = 'Waning Gibbous';
            moonImage = 'src/client/img/moon_images/waning-gibbous-modified.png';
            break;
        case moonphase === 0.75:
            moonText = 'Last Quarter';
            moonImage = 'src/client/img/moon_images/third-quarter-modified.png';
            break;
        case moonphase < 1:
            moonText = 'Waning Crescent';
            moonImage = 'src/client/img/moon_images/waning-crescent-modified.png';
            break;
        default:
            moonText = 'Error';
            break;
    }
    createImage(moonContainer, moonImage, moonText, createDatePicker());
}

function updateCountdown(differenceInMilliseconds: number) {
    let countdownElement = document.getElementById('countdown');

    countdownElement?.innerHTML == '';

    if (!isCurrentDate) return;

    countdownElement = document.createElement("div");
    countdownElement.id = "countdown";
    countdownElement.className = "countdown";
    moonContainer.appendChild(countdownElement);

    if (differenceInMilliseconds > 0) {
        const days = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24));
        const hours = Math.floor((differenceInMilliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((differenceInMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((differenceInMilliseconds % (1000 * 60)) / 1000);

        countdownElement.innerHTML = `Time until Full Moon: ${days}d ${hours}h ${minutes}m ${seconds}s`;

    } else {
        countdownElement.innerHTML = "Full Moon today! Sleep Well!";
    }

}

function isSameDay(date1: Date, date2: Date): boolean {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}


function getTimeUntilNextFullMoon(): number {
    const currentDate = new Date();

    if (currentMoonData.days[0]) {
        const datePick = new Date(currentMoonData.days[0].datetime);
        const fullMoonDates = currentMoonData.days.filter((day) => day.moonphase === 0.5);
        if (fullMoonDates.length > 0) {
            const nextFullMoonDate = fullMoonDates.find((date) => {
                const datetime = date.datetime;
                return datetime && new Date(datetime) > datePick;
            });
            if (nextFullMoonDate) {
                if (isSameDay(new Date(nextFullMoonDate.datetime), datePick)) {
                    return 0;
                }

                return new Date(nextFullMoonDate.datetime).getTime() - currentDate.getTime();
            }
        }
    }

    return -1;
}

function createDatePicker() {
    const dateContainer = document.createElement("div");
    dateContainer.id = "date-container";
    dateContainer.className = "date-container";
    const datePicker = document.createElement("input");

    datePicker.type = "date";
    datePicker.id = "date-picker";
    datePicker.className = "date-picker";
    datePicker.min = "1971-01-01";
    datePicker.max = "2050-01-01";

    async function handleInputEvent() {
        const selectedDate = datePicker.value;
        const pickedMoonURL = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}/${selectedDate}?unitGroup=metric&include=days&key=${moonAPI}&contentType=json&elements=datetime,moonphase,sunrise,sunset,moonrise,moonset`;
        pickedMoonData = await getMoonData(pickedMoonURL);
        displayMoon(pickedMoonData);
        moonriseMoonset(pickedMoonData);
        createTitle(moonContainer, `Status Moon`, false, formatDate(pickedMoonData.days[0]?.datetime), "");
        if (selectedDate != today) {
            isCurrentDate = false;
        } else {
            isCurrentDate = true;
        }
    }
    datePicker.addEventListener("input", handleInputEvent);
    dateContainer.appendChild(datePicker);
    return dateContainer;
}

function getNextMonth(date: Date) {
    var futureDate = new Date();
    futureDate.setDate(date.getDate() + 30);
    var futureDateString = futureDate.toISOString().split('T')[0];
    console.log("futureDateString", futureDateString);
    return futureDateString;
}

initMoon();

setInterval(() => {
    updateCountdown(getTimeUntilNextFullMoon());
}, 1000);