import { moonContainer } from "../backend_dependent/moon";

export function updateCountdown(differenceInMilliseconds: number, isCurrentDate: boolean) {
    let countdownElement = document.getElementById('countdown');

    countdownElement?.remove();


    if (!isCurrentDate) return;



    countdownElement = document.createElement("div");
    countdownElement.id = "countdown";
    countdownElement.className = "countdown";
    moonContainer.appendChild(countdownElement);

    if (differenceInMilliseconds > 0) {
        const days = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24));
        const hours = Math.floor((differenceInMilliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((differenceInMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((differenceInMilliseconds % (1000 * 60)) / 1000);

        countdownElement.innerHTML = `Time until Full Moon: <br>${days}d ${hours}h ${minutes}m ${seconds}s`;

    } else {
        countdownElement.innerHTML = "TODAY IS THE DAY! IT IS FULL MOON! SLEEP WELL";
    }

}
