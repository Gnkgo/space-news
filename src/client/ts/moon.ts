import { moonURL } from './api';
import { createTitle, createFooter, formatDate, createImage, createSunBackButton } from './base';
import {MoonData} from './interfaces';

const moonContainer = document.getElementById('moon-container') as HTMLDivElement;

let moonData: MoonData;

async function getMoonData(): Promise<MoonData> {
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
            moonData = await getMoonData();
            createTitle(moonContainer, `Status Moon`, false, formatDate(moonData.days[0]?.datetime), "");
            createFooter(moonContainer);
            displayMoon();
            moonriseMoonset();
            updateCountdown(getTimeUntilNextFullMoon());
            createSunBackButton(moonContainer);

        }
    } catch (error) {
        console.error("Error initializing weather app", error);
    }
}

function moonriseMoonset(): void {
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

function displayMoon(): void {
    if (moonData.days[0] !== undefined) {
        const moonphase = moonData.days[0].moonphase;

        let moonText = '';
        let moonImage = '';

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
}

function updateCountdown(differenceInMilliseconds: number) {
    let countdownElement = document.getElementById('countdown');
    if (!countdownElement) {
        countdownElement = document.createElement("div");
        countdownElement.id = "countdown";
        countdownElement.className = "countdown";
        moonContainer.appendChild(countdownElement);
    }
    if (differenceInMilliseconds > 0) {
        const days = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24));
        const hours = Math.floor((differenceInMilliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((differenceInMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((differenceInMilliseconds % (1000 * 60)) / 1000);

        countdownElement.innerHTML = `Time until Full Moon: ${days}d ${hours}h ${minutes}m ${seconds}s`;

    } else {
        countdownElement.innerHTML = "TODAY IS THE DAY! IT IS FULL MOON! SLEEP WELL";
    }
}

function getTimeUntilNextFullMoon(): number {
    const currentDate = new Date();
    const fullMoonDates = moonData.days.filter((day) => day.moonphase === 0.5);

    if (fullMoonDates.length > 0) {
        const nextFullMoonDate = fullMoonDates.find((date) => new Date(date.datetime) > currentDate);

        if (nextFullMoonDate) {
            const timeUntilFullMoon = new Date(nextFullMoonDate.datetime).getTime() - currentDate.getTime();
            return timeUntilFullMoon;
        }
    }

    return -1;
}

setInterval(() => {
    updateCountdown(getTimeUntilNextFullMoon());
}, 1000);

initMoon();
