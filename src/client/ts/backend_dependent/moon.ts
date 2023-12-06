import { MoonRes as MoonData, moonTarget } from '../../../common/api';
import { getFormattedDate } from '../../../common/utils';
import { createTitle, createFooter, formatDate, createSunBackButton } from '.././base';
import { moonriseMoonset } from '../moon/moonriseMoonset';
import { updateCountdown } from '../moon/countdown';
import { getTimeUntilNextFullMoon } from '../moon/datePicker';
import { displayMoon } from '../moon/datePicker';


export const moonContainer = document.getElementById('moon-container') as HTMLDivElement;
let location = 'zurich';
let today = getFormattedDate();

let isCurrentDate = true;

export let currentMoonData: MoonData;
let pickedMoonData: MoonData;

const backup: MoonData = {
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
  


async function getMoonData(date: string): Promise<MoonData> {
    try {
        const response = await fetch(moonTarget.resolve({date: date, location: location}));
        const data = await response.json() as MoonData;
        return data;
    } catch (error) {
        console.error("Error fetching weather data", error);
        throw error;
    }
}

async function initMoon(): Promise<void> {
    try {
        if (moonContainer) {
            createSunBackButton(moonContainer);
            createFooter(moonContainer);
            currentMoonData = await getMoonData("next30days");
            pickedMoonData = await getMoonData(getFormattedDate());
            createTitle(moonContainer, `Status Moon`, "", false, formatDate(currentMoonData.days[0]?.datetime), "");
            displayMoon(currentMoonData, today);
            moonriseMoonset(currentMoonData);
        }
    } catch (error) {
        displayMoon(backup, '1900-01-01');
        createTitle(moonContainer, `Status Moon`, "", false, formatDate(backup.days[0]?.datetime), "");
        moonriseMoonset(backup);
        console.error("Error initializing weather app", error);
    }
}


initMoon();

setInterval(() => {
    updateCountdown(getTimeUntilNextFullMoon(), isCurrentDate);
}, 1000);