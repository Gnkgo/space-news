import { MarsWeatherRes as MarsData } from '../../../common/api';
import { createInnerWeatherBox } from "./todayWeatherBox";

export function openModal(photo: any, data : MarsData | null, isRover : boolean): void {
    let modal = document.getElementById("myModal") as HTMLElement;
    let modalImage = document.getElementById("modalImage") as HTMLImageElement;
    let modalWeatherBox = document.getElementById("modalText") as HTMLElement;

    if (modalImage) modalImage.remove();
    if (modalWeatherBox) modalWeatherBox.remove();
  
    if (isRover) {
      modalImage = document.createElement("img");
      modalImage.src = "";
      modalImage.id = "modalImage";
      modalImage.alt = "Mars Rover Photo";
      modalImage.src = photo.img_src;
      modal.appendChild(modalImage);
    } else {
      modalWeatherBox = document.createElement("div");
      modalWeatherBox.id = "modalText";
      modalWeatherBox.className = "today-weather-box";
      modalWeatherBox.appendChild(createInnerWeatherBox(true, data?.soles[0]));
      modal.appendChild(modalWeatherBox);
      modal.className = "modal";
    }
    modal.style.display = "flex";
  }
  
  
  export function closeModal(): void {
    const modal = document.getElementById("myModal") as HTMLElement;
    modal.style.display = "none";
  }
  
  
  export function createModal(): void {
    let modal = document.getElementById("myModal") as HTMLElement;
    if (modal) modal.remove();    
    modal = document.createElement("div");
    modal.id = "myModal";
    modal.className = "modal";
  
    const closeBtn = document.createElement("span");
    closeBtn.className = "close";
    closeBtn.innerHTML = "&times;";
    closeBtn.onclick = closeModal;

  
    modal.appendChild(closeBtn);
  
    document.body.appendChild(modal);
  }