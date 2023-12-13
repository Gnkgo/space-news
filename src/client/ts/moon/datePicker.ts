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
import  firstQuarter from "../../img/moon_images/firstQuarter.png";
import  full from "../../img/moon_images/full.png";
import  newMoon  from "../../img/moon_images/newMoon.png";
import  thirdQuarter from "../../img/moon_images/thirdQuarter.png";
import  waningCrescent from "../../img/moon_images/waningCrescent.png";
import  waningGibbous from "../../img/moon_images/waningGibbous.png";
import  waxingCrescent from "../../img/moon_images/waxingCrescent.png";
import  waxingGibbous from "../../img/moon_images/waxingGibbous.png";


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
    
    if (moonphase === 0) {
        moonText = 'New Moon';
        moonImage = newMoon;
    } else if (moonphase < 0.25) {
        moonText = 'Waxing Crescent';
        moonImage = waxingCrescent;
    } else if (moonphase === 0.25) {
        moonText = 'First Quarter';
        moonImage = firstQuarter;
    } else if (moonphase < 0.5) {
        moonText = 'Waxing Gibbous';
        moonImage = waxingGibbous;
    } else if (moonphase === 0.5) {
        moonText = 'Full Moon';
        moonImage = full;
    } else if (moonphase < 0.75) {
        moonText = 'Waning Gibbous';
        moonImage = waningGibbous;
    } else if (moonphase === 0.75) {
        moonText = 'Last Quarter';
        moonImage = thirdQuarter;
    } else if (moonphase < 1) {
        moonText = 'Waning Crescent';
        moonImage = waningCrescent;
    } else {
        moonText = 'Error';
    }
    
    createImage(moonContainer, moonImage, moonText, createDatePicker(selectedDate));
}
