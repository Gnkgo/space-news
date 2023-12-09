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
}, 1000);