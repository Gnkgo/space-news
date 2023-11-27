import { getFormattedDate, moonAPI } from './api';
import { createTitle, createFooter, formatDate, createImage, createSunBackButton } from './base';
import { MoonData } from './interfaces';

const moonContainer = document.getElementById('moon-container') as HTMLDivElement;
let location = 'zurich';
let today = getFormattedDate();
let currentMoonURL = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}/next30days?unitGroup=us&key=TANA3BSE43X9AFK3TDSPXST5P&contentType=json&elements=datetime,moonphase,sunrise,sunset,moonrise,moonset`;


let isCurrentDate = true;

let currentMoonData: MoonData;
let pickedMoonData: MoonData;;

async function getMoonData(moonURL: string): Promise<MoonData> {
    try {
        const response = await fetch(moonURL);
        const data = await response.json() as MoonData;
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
            createDatePicker();
            createFooter(moonContainer);
            currentMoonData = await getMoonData(currentMoonURL);
            pickedMoonData = await getMoonData(currentMoonURL);
            createTitle(moonContainer, `Status Moon`, false, formatDate(currentMoonData.days[0]?.datetime), "");
            displayMoon(currentMoonData);
            moonriseMoonset(currentMoonData);
        }
    } catch (error) {
        console.error("Error initializing weather app", error);
    }
}

function moonriseMoonset(moonData : MoonData): void {
    console.log("MOONDATA", moonData);
    if (moonData.days[0] !== undefined) {
        const moonrise = moonData.days[0].moonrise;
        const moonset = moonData.days[0].moonset;

        const moonBox = document.createElement("div");
        moonBox.id = "mooon-box";
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

function displayMoon(moonData: MoonData): void {
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
            moonImage = 'src/client/img/moon_images/waning-crescent-modified.png';
            break;
        case moonphase === 0.25:
            moonText = 'First Quarter';
            moonImage = 'src/client/img/moon_images/first-quarter-modified.png';
            break;
        case moonphase < 0.5:
            moonText = 'Waxing Gibbous';
            moonImage = 'src/client/img/moon_images/waning-gibbous-modified.png';
            break;
        case moonphase === 0.5:
            moonText = 'Full Moon';
            moonImage = 'src/client/img/moon_images/full-modified.png';
            break;
        case moonphase < 0.75:
            moonText = 'Waning Gibbous';
            moonImage = 'src/client/img/moon_images/waning-crescent-modified.png';
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
    createImage(moonContainer, moonImage, moonText);
}

function updateCountdown(differenceInMilliseconds: number) {
    let countdownElement = document.getElementById('countdown');
    if (!countdownElement) {
        countdownElement = document.createElement("div");
        countdownElement.id = "countdown";
        countdownElement.className = "countdown";
        moonContainer.appendChild(countdownElement);
    } else {
        countdownElement.innerHTML = '';
    }
    if (differenceInMilliseconds > 0 && !isSameDay) {
        const days = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24));
        const hours = Math.floor((differenceInMilliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((differenceInMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((differenceInMilliseconds % (1000 * 60)) / 1000);

        countdownElement.innerHTML = `Time until Full Moon: ${days}d ${hours}h ${minutes}m ${seconds}s`;

    } else {
        countdownElement.innerHTML = "Full Moon today!";
    }
}

function isSameDay(date1: Date, date2: Date): boolean {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}


function getTimeUntilNextFullMoon(isCurrentDate: boolean): number {
    const currentDate = new Date();
    if (pickedMoonData && pickedMoonData.days && pickedMoonData.days[0]) {

        const datePick = new Date(pickedMoonData.days[0].datetime);
        const fullMoonDates = pickedMoonData.days.filter((day) => day.moonphase === 0.5);

        if (fullMoonDates.length > 0) {
            
            const nextFullMoonDate = fullMoonDates.find((date) => {
                const datetime = date.datetime;
                return datetime && new Date(datetime) > datePick;
            });

            if (nextFullMoonDate) {
                if (isSameDay(new Date(nextFullMoonDate.datetime), datePick)) {
                    return 0;
                }

                
                let timeUntilFullMoon = 0;

                if (isCurrentDate) {
                    timeUntilFullMoon = new Date(nextFullMoonDate.datetime).getTime() - currentDate.getTime();
                    
                    
                } else {
                    timeUntilFullMoon = new Date(nextFullMoonDate.datetime).getTime() - datePick.getTime();
                }
                return timeUntilFullMoon;
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
        const pickedMoonURL = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}/${selectedDate}/${getNextMonth(new Date(selectedDate))}?unitGroup=metric&include=days&key=${moonAPI}&contentType=json&elements=datetime,moonphase,sunrise,sunset,moonrise,moonset`;
        pickedMoonData = await getMoonData(pickedMoonURL);
        displayMoon(pickedMoonData);
        moonriseMoonset(pickedMoonData);
        if (selectedDate != today) {
            isCurrentDate = false;
        } else {
            isCurrentDate = true;
        }

    }

    datePicker.addEventListener("input", handleInputEvent);

    dateContainer.appendChild(datePicker);

    moonContainer.appendChild(dateContainer);
}

function getNextMonth(date: Date) {
    var futureDate = new Date();
    futureDate.setDate(date.getDate() + 30);
    var futureDateString = futureDate.toISOString().split('T')[0];
    return futureDateString;
}

initMoon();

setInterval(() => {
    updateCountdown(getTimeUntilNextFullMoon(isCurrentDate));
}, 1000);