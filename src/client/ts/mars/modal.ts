// modal.ts
export function openModal(photo: any): void {
    const modal = document.getElementById("myModal") as HTMLElement;
    const modalImage = document.getElementById("modalImage") as HTMLImageElement;
  
    modalImage.src = photo.img_src;
    modal.style.display = "block";
  }
  
  
  export function closeModal(): void {
    const modal = document.getElementById("myModal") as HTMLElement;
    modal.style.display = "none";
  }
  
  
  export function createModal(): void {
    const modal = document.createElement("div");
    modal.id = "myModal";
    modal.className = "modal";
  
    const closeBtn = document.createElement("span");
    closeBtn.className = "close";
    closeBtn.innerHTML = "&times;";
    closeBtn.onclick = closeModal;
  
    const modalImage = document.createElement("img");
    modalImage.src = "";
    modalImage.id = "modalImage";
    modalImage.alt = "Mars Rover Photo";
  
    modal.appendChild(closeBtn);
    modal.appendChild(modalImage);
  
    document.body.appendChild(modal);
  }