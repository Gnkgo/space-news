import { MoonRes as MoonData } from '../../../common/api';
import { getFormattedDate } from '../../../common/utils';
import { createTitle, createFooter, formatDate, createSunBackButton } from '.././base';
import { moonriseMoonset } from '../moon/moonriseMoonset';
import { updateCountdown } from '../moon/countdown';
import { getTimeUntilNextFullMoon } from '../moon/datePicker';
import { displayMoon } from '../moon/datePicker';
import { getMoonData } from '../moon/moonDataCollection';

export const moonContainer = document.getElementById('moon-container') as HTMLDivElement;
let today = getFormattedDate();

let isCurrentDate = true;

export let currentMoonData: MoonData;
export let pickMoonData: MoonData;

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



export async function initMoon(location?: number[]): Promise<void> {
    try {
        if (moonContainer) {
            moonContainer.innerHTML = "";
            createSunBackButton(moonContainer);
            createFooter(moonContainer);
            currentMoonData = await getMoonData("next30days", (location ? location : [47.3725151766, 8.54219283122]));
            pickMoonData = await getMoonData(today, (location ? location : [47.3725151766, 8.54219283122]));
            createTitle(moonContainer, `Status Moon`, formatDate(currentMoonData.days[0]?.datetime), false, "", "");
            displayMoon(currentMoonData, today);
            moonriseMoonset(currentMoonData);
            console.log("current moon data: " + currentMoonData + " - " + (location ? location : [47.3725151766, 8.54219283122]));
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