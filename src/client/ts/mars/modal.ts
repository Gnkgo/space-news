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
  
  
  export function createModal(title?: string): void {
    let modal = document.getElementById("myModal") as HTMLElement;
    if (modal) modal.remove();    
    modal = document.createElement("div");
    modal.id = "myModal";
    modal.className = "modal";
  
    //Add Modal close button
    const closeBtn = document.createElement("i");
    closeBtn.className = "close fa-solid fa-xmark";
    closeBtn.innerHTML = "&times;";
    closeBtn.onclick = closeModal;

    //Add optional title
    if(title){
      const titleElem = document.createElement("h3");
      titleElem.id = 'title';
      titleElem.textContent = `Mars Rover: ${title}`;
      modal.appendChild(titleElem);
    }
  
    modal.appendChild(closeBtn);
  
    document.body.appendChild(modal);
  }