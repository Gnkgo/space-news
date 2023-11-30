export function formatDate(inputDate: string | undefined): string {
    if (inputDate === undefined) {
        // Handle the case when inputDate is undefined
        return "N/A";
    }
    const dateParts = inputDate.split("-");

    const year = parseInt(dateParts?.[0] ?? "N/A");
    const month = parseInt(dateParts?.[1] ?? "N/A");
    const day = parseInt(dateParts?.[2] ?? "N/A");

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const formattedDate = `${day} ${months[month - 1]} ${year}`;
    return formattedDate;
}

export function createSunBackButton(divContainer: HTMLDivElement) {
    const sunButton = document.createElement("img");
    sunButton.classList.add("sun-button");
    sunButton.id = "sun-button";

    // Set the path to your sun image
    sunButton.src = "/src/client/img/sun.png";

    divContainer.appendChild(sunButton);
    sunButton?.addEventListener('click', goHome);
}


export function createTitle(divContainer: HTMLDivElement, title: string, isSol: boolean, dateEarth: string, dateSol: string) {
    let titleBox = divContainer.querySelector("#title-box");
    titleBox?.parentNode?.removeChild(titleBox);
    if (titleBox) titleBox.remove();

    titleBox = document.createElement("div");
    titleBox.id = "title-box";
    titleBox.classList.add("title-box");

    const titleElement = document.createElement("h1");
    titleElement.textContent = title;

    const dateElement = document.createElement("h2");

    if (isSol) {
        dateElement.textContent = `Sol ${dateSol}`;
    } else {
        dateElement.textContent = `${dateEarth}`;
    }

    const innerTitle = document.createElement("div");
    innerTitle.id = "inner-title";

    const greyBox = document.createElement("div");
    greyBox.id = "inner-title";
    greyBox.className = "grey-box";

    innerTitle.appendChild(titleElement);
    innerTitle.appendChild(dateElement);

    greyBox?.appendChild(innerTitle);


    titleBox.appendChild(greyBox);
    divContainer.appendChild(titleBox);
}

export function createImage(container: HTMLElement, imagePath: string, description: string, dateContainer: HTMLDivElement): void {
    const existingImage = container.querySelector('#image-container') as HTMLImageElement;

    if (existingImage) {
        existingImage.remove();
    }

    const image = document.createElement('img');
    image.className = 'image';
    image.id = 'image';
    image.src = imagePath;

    image.width = 300;
    image.height = 300;

    const imageContainer = document.createElement('div');
    imageContainer.className = 'image-container';
    imageContainer.id = 'image-container';
    imageContainer.appendChild(image);
    imageContainer.appendChild(document.createTextNode(description));
    imageContainer.appendChild(dateContainer);

    container.appendChild(imageContainer);
}


export function createText(divContainer: HTMLDivElement, text: string) {
    const paragraphBox = document.createElement("div");
    paragraphBox.className = "paragraph-box";
    paragraphBox.id = "paragraph-box";

    const textNode = document.createTextNode(text);

    const greyBox = document.createElement("div");
    greyBox.id = "paragraph";
    greyBox.className = "grey-box";

    greyBox.appendChild(textNode);

    paragraphBox.appendChild(greyBox);
    divContainer.appendChild(paragraphBox);
}

export function createFooter(divContainer: HTMLDivElement) {
    const footer = document.createElement("footer");
    footer.textContent = "© 2023 by DeValdi - Gnkgo - Nick";
    divContainer.appendChild(footer);
}

export function celsiusToFahrenheit(celsius: number): number {
    return (celsius * 9 / 5) + 32;
}



export function goHome() {

    const homeContainer = document.getElementById("home-container");
    if (homeContainer) {
        homeContainer.style.display = 'flex';
    }

    const marsContainer = document.getElementById('mars-container');
    if (marsContainer) {
        marsContainer.style.display = 'none';
    }

    const neoContainer = document.getElementById('neo-container');
    if (neoContainer) {
        neoContainer.style.display = 'none';
    }

    const moonContainer = document.getElementById('moon-container');
    if (moonContainer) {
        moonContainer.style.display = 'none';
    }
}

/**
 * Hide the FROM element with display = none, and show the TO element.
 * This achieves an inplace "switch" of elements.
 * @param from html id of the element to hide
 * @param to html id of the element to show
 * @param newDisplayStyle optional parameter for TO element new display value, default is FROM.style.display
 */
export function changeElemDisplay(from: string, to: string, newDisplayStyle?: string){
    const fromElem = document.getElementById(from);
    const toElem = document.getElementById(to);
    if(fromElem && toElem){
      const oldDisplay = window.getComputedStyle(fromElem).display;
      fromElem.style.display = 'none';
      toElem.style.display = newDisplayStyle ? newDisplayStyle : oldDisplay;
    } else {
      console.log(`Error getting Element to change Display. FromElem: ${fromElem}, ToElem: ${toElem}`);
    }
}