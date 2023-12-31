import { Meteorite } from "./entities";
import { movementType } from "./input";

let _lastFpsTime = 0;
let _lastFpsValue = "";
let _deltaTimeSum = 0;
let _deltaTimeFilter = 0;

const fpsText = document.createElement("h2");
export function renderFPSText(div: HTMLDivElement, deltaTime: number) {
    const now = new Date().getTime();
    _deltaTimeSum += deltaTime - _deltaTimeFilter;
    _deltaTimeFilter = _deltaTimeSum / 100;
    if (now - _lastFpsTime > 1000) {
        _lastFpsTime = now;
        _lastFpsValue = (1000/_deltaTimeFilter).toFixed(0);
    }

    fpsText.textContent = `Average FPS: ${_lastFpsValue}`;
    div.appendChild(fpsText);
}

export function renderMovementType() {
    const currMovementType = document.getElementById("current-movement-type");
    if(currMovementType){
        currMovementType.textContent = `Movement Type:        ${["Locked", "Detached", "Free", "Tracking"][movementType()]}`;
    }
}

export function renderCADInfo() {
    const meteorite = Meteorite.marked() ?? Meteorite.tracked();
    const cadInfoContainer = document.getElementById("cad-elem-info");
    if (cadInfoContainer) {
        cadInfoContainer.remove();
    }
    
    if (meteorite) {
        //Create Info Box
        const cadElemInfo = document.createElement("div");
        cadElemInfo.classList.add("grey-box");
        cadElemInfo.id = "cad-elem-info"

        const objectName = document.createElement("h2");
        objectName.textContent = `Asteroid - ${meteorite.name}`;
        cadElemInfo?.appendChild(objectName)

        const objectDateText = document.createElement("pre");
        objectDateText.innerHTML = `Closest Approach date: ${meteorite.date}`;
        cadElemInfo?.appendChild(objectDateText);

        const objectDistText = document.createElement("pre");
        objectDistText.textContent = `Distance:              ${meteorite.dist}`;
        cadElemInfo?.appendChild(objectDistText);

        const objectVelText = document.createElement("pre");
        objectVelText.textContent = `Velocity:              ${meteorite.vel}`;
        cadElemInfo?.appendChild(objectVelText);

        const spinningEarthContainer = document.getElementById("spinning-earth-container");
        spinningEarthContainer?.appendChild(cadElemInfo);
    }
}
