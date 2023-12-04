import { marsContainer } from "../backend_dependent/mars";
import { handleButtonClick } from "../backend_dependent/mars";



  export function createButtons(): void {
    const buttonBox = document.createElement("div");
    buttonBox.id = "button-box";
    buttonBox.className = "button-box";
  
    const buttonLabels = { 'pictures': 'Show Mars', 'celsius': '°C', 'fahrenheit': '°F', 'earth-date': 'Earth', 'mars-date': 'Sol' };
  
    for (const [key, label] of Object.entries(buttonLabels)) {
      const button = createButton('buttonChange', label, key);
      button.addEventListener("click", () => handleButtonClick(key));
      buttonBox.appendChild(button);
    }
  
    marsContainer.appendChild(buttonBox);
  }
  
  export function createButton(className: string, label: string, id: string): HTMLButtonElement {
    const button = document.createElement("button");
    button.className = className;
    button.id = `${id}-button`;
    button.textContent = label;
    return button;
  
  }