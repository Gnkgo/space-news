import { MoonRes as MoonData } from '../../../common/api';
import { moonContainer } from '../backend_dependent/moon';

export function moonriseMoonset(moonData: MoonData): void {
    if (moonData.days[0] !== undefined) {
        const moonrise = moonData.days[0].moonrise;
        const moonset = moonData.days[0].moonset;

        let moonBox = document.getElementById("moon-box");
        if (moonBox) moonBox.remove();
        
        moonBox = document.createElement("div");
        moonBox.id = "moon-box";
        moonBox.className = "moon-box";

        const moonContent = document.createElement("div");
        moonContent.id = "moon-content";
        moonContent.className = "grey-box";

        const title = document.createElement("h3");
        title.textContent = "Moon Events";

        moonContent.appendChild(title);
        moonContent.innerHTML += `
        <p>Moonrise: ${moonrise}</p>
        <p>Moonset: ${moonset}</p>
      `;

        moonBox.appendChild(moonContent);
        moonContainer.appendChild(moonBox);
    }
}