import { MarsWeatherRes as MarsData } from '../../../common/api';
import { changeElemDisplay, modulo } from '../base';
import { createInnerWeatherBox } from "./todayWeatherBox";

let currentModalImageIndex = 0;
let photoArrayLength: number;

export function openModal(photos: any, data : MarsData | null, isRover : boolean, easteregg : boolean): void {
  let modal = document.getElementById("myModal") as HTMLElement;
  let modalImages = document.getElementsByClassName("modal-image") as HTMLCollectionOf<HTMLImageElement>;
  let modalWeatherBox = document.getElementById("modalText") as HTMLElement;
  console.log("modalOUT", modal);



  if (easteregg) {
    const text = document.createElement("h1");
    text.textContent = "THANK YOU FOR VISITING MILKYWAY!";
    const paragraph = document.createElement("p");
    paragraph.textContent = `We hope you enjoyed your stay. Please come back soon!
    A huge thanks goes to the best team: DeValdi, Gnkgo, and Nick. Thanks for all the discussions, the meetings, and for pulling off this crazy website!
    A lot of work and time (and some tears because crappy CSS is still new to some of the team members), and we are ready to show the world our creation!
    Thanks to everyone outside the team who helped us achieve it!
    A special thanks goes to NoRelect who showed us important tips and tricks! It is always a pleasure to work with you!
    A huge thanks goes to W. Paceley, who showed us where we can get all the important data from. Check out his nice Mars Weather App in the App Store.
    And last but not least, a thank you to my dog Chuma, who was always there for me when I needed a break from coding.`;
    
    modal.appendChild(text);
    modal.appendChild(paragraph);
    modal.className = "modal";
    console.log("modalIN", modal);
    modal.style.display = "block";

    return;
  }

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
    leftArrow.addEventListener('click', () => showNextImage(-1));
    document.addEventListener('keydown', (e: KeyboardEvent) => {if (e.key == "ArrowLeft") showNextImage(-1);});
    modal.appendChild(leftArrow);

    const rightArrow = document.createElement("i");
    rightArrow.id = "right-arrow";
    rightArrow.className = "switch-modal-object-button fa-solid fa-angle-right";
    rightArrow.addEventListener('click', () => showNextImage(+1));
    document.addEventListener('keydown', (e: KeyboardEvent) => {if (e.key == "ArrowRight") showNextImage(+1);});
    modal.appendChild(rightArrow);

    //Add Object counter
    const modalCarouselCounter = document.createElement("h5");
    modalCarouselCounter.id = "modal-carousel-counter";
    modal.appendChild(modalCarouselCounter);
  }

  modal.appendChild(closeBtn);

  document.body.appendChild(modal);
}

function showNextImage(step: number){
  const newModalImageIndex = modulo((currentModalImageIndex + step), (photoArrayLength));
  changeElemDisplay(`modal-image-${currentModalImageIndex}`, `modal-image-${newModalImageIndex}`);
  currentModalImageIndex = newModalImageIndex;

  //adjust modal carousel counter
  const modalCarouselCounter = document.getElementById("modal-carousel-counter");
  if(modalCarouselCounter) modalCarouselCounter.textContent = `${currentModalImageIndex + 1}/${photoArrayLength}`;
}