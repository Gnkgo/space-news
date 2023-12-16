import { MoonRes as MoonData } from '../../../common/api';
import { getFormattedDate } from '../../../common/utils';
import { createTitle, createFooter, formatDate, createSunBackButton } from '.././base';
import { displayMoonEvents } from '../moon/moonEvents';
import { displayMoon, getTimeUntilNextFullMoon } from '../moon/datePicker';
import { getMoonData } from '../moon/moonDataCollection';
import { updateCountdown } from '../moon/countdown';

export const moonContainer = document.getElementById('moon-container') as HTMLDivElement;
let today = getFormattedDate();
export let locationSave: number[];
export let text = "Explore the wonders of Earth's celestial companion with our comprehensive Moon information platform. \
On this website, you'll find a wealth of fascinating details about the Moon, covering a range of topics to satisfy your curiosity."

export let currentMoonData: MoonData;
export let pickMoonData: MoonData;
export async function initMoon(location: number[]): Promise<void> {
    try {
        if (moonContainer) {
            locationSave = location;
            createSunBackButton(moonContainer);
            createFooter(moonContainer);

            currentMoonData = await getMoonData("next30days", locationSave);
            pickMoonData = await getMoonData(today, locationSave);

            createTitle(moonContainer, "Moon Phase", text, false, formatDate(currentMoonData.days[0]?.datetime), "");
            displayMoon(currentMoonData, today);
            displayMoonEvents(currentMoonData);
        }
    } catch (error) {
        console.error("Error initializing weather app", error);
    }
}



setInterval(() => {
    const countdown = document.getElementById("countdown");
    if (countdown) {
        countdown.textContent = updateCountdown(getTimeUntilNextFullMoon(), true);
    }
}, 1000);