import { MoonRes as MoonData } from '../../../common/api';
import { moonContainer } from '../backend_dependent/moon';
import { updateCountdown } from './countdown';
import { getTimeUntilNextFullMoon, isSameDayBoolean } from './datePicker';
import { formatDate, isSameDay } from '../base';

export function displayMoonEvents(moonData: MoonData): void {

  let moonEvents = document.getElementById('moon-events');

  moonEvents?.remove();

  moonEvents = document.createElement("div");
  moonEvents.id = "moon-events";
  moonEvents.classList.add("moon-events");

  if (moonData && (moonData.days[0] !== undefined)) {
    const moonrise = moonData.days[0].moonrise;
    const moonset = moonData.days[0].moonset;

    const moonContent = document.createElement("div");
    moonContent.id = "moon-content";
    moonContent.className = "grey-box";

    const title = document.createElement("h1");
    title.textContent = formatDate(moonData.days[0]?.datetime);

    moonContent.appendChild(title);
    moonContent.innerHTML += `
        <p>Moonrise: ${moonrise}</p>
        <p>Moonset: ${moonset}</p>
      `;

    const countdown = document.createElement("p");
    countdown.id = "countdown";
    console.log(new Date(moonData.days[0]?.datetime), new Date());
    countdown.textContent = updateCountdown(getTimeUntilNextFullMoon(), isSameDayBoolean);
    moonContent.appendChild(countdown);

    moonEvents.appendChild(moonContent);
    moonContainer.appendChild(moonEvents);
  }
}