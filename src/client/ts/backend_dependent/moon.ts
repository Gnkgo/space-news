import { MoonRes as MoonData } from '../../../common/api';
import { getFormattedDate } from '../../../common/utils';
import { createTitle, createFooter, formatDate, createSunBackButton } from '.././base';
import { displayMoonEvents } from '../moon/moonEvents';
import { displayMoon } from '../moon/datePicker';
import { getMoonData } from '../moon/moonDataCollection';

export const moonContainer = document.getElementById('moon-container') as HTMLDivElement;
let today = getFormattedDate();
export let locationSave: number[];

export let currentMoonData: MoonData;
export let pickMoonData: MoonData;

//const backup: MoonData = {
//    description: {
//      location: "Sample Location",
//      timeZone: "UTC+0",
//    },
//    days: [
//      {
//        datetime: "2023-11-28T18:30:00",
//        sunrise: "2023-11-28T06:30:00",
//        sunset: "2023-11-28T17:45:00",
//        moonphase: 0.75,
//        moonrise: "2023-11-28T14:00:00",
//        moonset: "2023-11-29T03:45:00",
//      },
//    ],
//};



export async function initMoon(location : number[]): Promise<void> {
    try {
        if (moonContainer) {
            locationSave = location;
            moonContainer.innerHTML = "";
            createSunBackButton(moonContainer);
            createFooter(moonContainer);
            currentMoonData = await getMoonData("next30days", (locationSave));
            pickMoonData = await getMoonData(today, (locationSave));
            createTitle(moonContainer, formatDate(currentMoonData.days[0]?.datetime), "", false, "", "");
            displayMoon(currentMoonData, today);
            displayMoonEvents(currentMoonData);
            console.log("current moon data: ", currentMoonData," - ",(location));
        }
    } catch (error) {
        console.error("Error initializing weather app", error);
    }
}


setInterval(() => {
    displayMoonEvents(currentMoonData);

    //let countdown = document.getElementById('countdown');
    //let countdown2 = moonContainer.querySelector('#countdown');
    //let box = document.getElementById('moon-content');
//
    //console.log("countdown: " + countdown);
    //console.log("countdown2: " + countdown2);
    //console.log("box: " + box);
    //if (!countdown) {
    //    countdown = document.createElement("p");
    //    countdown.id = "countdown";
    //    countdown.textContent = updateCountdown(getTimeUntilNextFullMoon(), isCurrentDate);
    //    box?.appendChild(countdown);
    //} else {
    //    countdown.textContent = updateCountdown(getTimeUntilNextFullMoon(), isCurrentDate);
    //}
}, 10000);