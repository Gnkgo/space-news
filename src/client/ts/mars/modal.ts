import { MarsWeatherRes as MarsData } from '../../../common/api';
import { changeElemDisplay, modulo } from '../base';
import { createInnerWeatherBox } from "./todayWeatherBox";

let currentModalImageIndex = 0;
let photoArrayLength: number;

export function openModal(photos: any, data : MarsData | null, isRover : boolean): void {
  let modal = document.getElementById("myModal") as HTMLElement;
  let modalImages = document.getElementsByClassName("modal-image") as HTMLCollectionOf<HTMLImageElement>;
  let modalWeatherBox = document.getElementById("modalText") as HTMLElement;

  if (modalImages.length > 0){
    for (const modalImage of modalImages){
      modalImage.remove();
    }
  }
  if (modalWeatherBox) modalWeatherBox.remove();

  if (isRover) {
    photoArrayLength = photos.length;

    let photoIndex = 0;
    for (const photo of photos){
      const modalImage = document.createElement("img");
      modalImage.id = `modal-image-${photoIndex}`;
      modalImage.className = "modal-image"
      modalImage.alt = "Mars Rover Photo";
      modalImage.src = photo.img_src;
      modalImage.style.display = (currentModalImageIndex == photoIndex) ? "flex" : "none";
      modal.appendChild(modalImage);
      photoIndex += 1;
    }

    //set modal carousel counter
    const modalCarouselCounter = document.getElementById("modal-carousel-counter");
    if(modalCarouselCounter) modalCarouselCounter.textContent = `${currentModalImageIndex + 1}/${photoArrayLength}`;
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
  
  
export function closeModal(modalId: string): void {
  const modal = document.getElementById(modalId) as HTMLElement;
  modal.style.display = "none";
}
  
  
export function createModal(title?: string, multiObjectModal?: boolean): void {
  let modal = document.getElementById("myModal") as HTMLElement;
  if (modal) modal.remove();    
  modal = document.createElement("div");
  modal.id = "myModal";
  modal.className = "modal";

  //Add Modal close button
  const closeBtn = document.createElement("i");
  closeBtn.className = "close fa-solid fa-xmark";
  closeBtn.addEventListener('click', () => closeModal("myModal"));

  //Add optional title
  if(title){
    const titleElem = document.createElement("h3");
    titleElem.id = "title";
    titleElem.textContent = `Mars Rover: ${title}`;
    modal.appendChild(titleElem);
  }

  //Add optional object switch buttons
  if(multiObjectModal){
    const leftArrow = document.createElement("i");
    leftArrow.id = "left-arrow";
    leftArrow.className = "switch-modal-object-button fa-solid fa-angle-left";
    leftArrow.addEventListener('click', () => {
      const newModalImageIndex = modulo((currentModalImageIndex - 1), (photoArrayLength));
      changeElemDisplay(`modal-image-${currentModalImageIndex}`, `modal-image-${newModalImageIndex}`);
      currentModalImageIndex = newModalImageIndex;
      
      //adjust modal carousel counter
      const modalCarouselCounter = document.getElementById("modal-carousel-counter");
      if(modalCarouselCounter) modalCarouselCounter.textContent = `${currentModalImageIndex + 1}/${photoArrayLength}`;
    });
    modal.appendChild(leftArrow);

    const rightArrow = document.createElement("i");
    rightArrow.id = "right-arrow";
    rightArrow.className = "switch-modal-object-button fa-solid fa-angle-right";
    rightArrow.addEventListener('click', () => {
      const newModalImageIndex = modulo((currentModalImageIndex + 1), (photoArrayLength));
      changeElemDisplay(`modal-image-${currentModalImageIndex}`, `modal-image-${newModalImageIndex}`);
      currentModalImageIndex = newModalImageIndex;

      //adjust modal carousel counter
      const modalCarouselCounter = document.getElementById("modal-carousel-counter");
      if(modalCarouselCounter) modalCarouselCounter.textContent = `${currentModalImageIndex + 1}/${photoArrayLength}`;
    });
    modal.appendChild(rightArrow);

    //Add Object counter
    const modalCarouselCounter = document.createElement("h5");
    modalCarouselCounter.id = "modal-carousel-counter";
    modal.appendChild(modalCarouselCounter);
  }

  modal.appendChild(closeBtn);

  document.body.appendChild(modal);
}

export function createAndOpenTutoralModal(){
  let modal = document.createElement("div") as HTMLDivElement;
  modal.id = "tutorial-modal";
  modal.className = "modal";
  modal.addEventListener('click', () => {
    localStorage.setItem("notFirstTimeUser", 'true');
    closeModal("tutorial-modal")
  });
  document.addEventListener('keyup', (e) => {
    if(e.key == "Escape") {
      localStorage.setItem("notFirstTimeUser", 'true');
      closeModal("tutorial-modal");
    }
  });

  //Add tutorial text to modal
  const prompt = document.createElement("h2") as HTMLHeadingElement;
  prompt.innerHTML = "<i class=\"fa-solid fa-arrow-pointer\"></i> Click any celestial body to get more information.";
  modal.appendChild(prompt);

  document.body.appendChild(modal);
  modal.style.display = "flex";
}