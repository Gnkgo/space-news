import { currentMoonData } from "../backend_dependent/moon";
import { isSameDay } from "../base";
import { createImage, createTitle } from "../base";
import { moonContainer } from "../backend_dependent/moon";
import { MoonRes as MoonData } from '../../../common/api';
import { displayMoonEvents } from "./moonEvents";
import { formatDate } from "../base";
import { getMoonData } from "./moonDataCollection";
import { locationSave } from "../backend_dependent/moon";
import { text } from "../backend_dependent/moon";

export function getTimeUntilNextFullMoon(): number {
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



export function createDatePicker(selectedDate: string) {
    const dateContainer = document.createElement("div");
    dateContainer.id = "date-container";
    dateContainer.className = "date-container";
    const datePicker = document.createElement("input");

    datePicker.type = "date";
    datePicker.id = "date-picker";
    datePicker.className = "date-picker";
    datePicker.min = "1971-01-01";
    datePicker.max = "2050-01-01";
    datePicker.value = selectedDate;

    async function handleInputEvent() {
        selectedDate = datePicker.value;
        const pickedMoonData = await getMoonData(selectedDate, locationSave);
        displayMoon(pickedMoonData, selectedDate);
        displayMoonEvents(pickedMoonData);
        createTitle(moonContainer, "Different Moon Information", text, false, formatDate(currentMoonData.days[0]?.datetime), "");
    }
    datePicker.addEventListener("input", handleInputEvent);
    dateContainer.appendChild(datePicker);
    return dateContainer;
}

export function displayMoon(moonData: MoonData, selectedDate : string): void {
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
    createImage(moonContainer, moonImage, moonText, createDatePicker(selectedDate));
}
