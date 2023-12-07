import { moonContainer } from "../backend_dependent/moon";

export function updateCountdown(differenceInMilliseconds: number, isCurrentDate: boolean) {
    let countdownElement = document.getElementById('countdown');

    countdownElement?.remove();
    if (!isCurrentDate) return;

    countdownElement = document.createElement("div");
    countdownElement.id = "countdown";
    countdownElement.classList.add("countdown");

    const greyBox = document.createElement("div");
    greyBox.classList.add("grey-box");


    const title = document.createElement("h3");

    if (differenceInMilliseconds > 0) {
        const days = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24));
        const hours = Math.floor((differenceInMilliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((differenceInMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((differenceInMilliseconds % (1000 * 60)) / 1000);

        title.textContent = "Time until Full Moon";

        const text = document.createElement("p");
        text.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
        greyBox.appendChild(title);
        greyBox.appendChild(text);

    } else {
        title.textContent = "TODAY IS THE DAY! IT IS FULL MOON! SLEEP WELL";
        greyBox.appendChild(title);
    }



    countdownElement.appendChild(greyBox);
    moonContainer.appendChild(countdownElement);

}
