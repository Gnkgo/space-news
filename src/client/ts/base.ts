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
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
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


export function createTitle(divContainer: HTMLDivElement, title: string, paragraph: string, isSol: boolean, dateEarth: string, dateSol: string) {
    let titleBox = divContainer.querySelector(".title-box"); // Assuming you are using a class selector
    if (titleBox) titleBox.remove();

    titleBox = document.createElement("div");
    titleBox.id = "title-box";
    titleBox.classList.add("title-box");

    const titleElement = document.createElement("h1");
    titleElement.textContent = title;

    const dateElement = document.createElement("h2");

    const paragraphElement = document.createElement("p");
    paragraphElement.textContent = paragraph;
    paragraphElement.style.fontSize = "8pt";

    if (isSol) {
        dateElement.textContent = `Sol ${dateSol}`;
    } else {
        dateElement.textContent = `${dateEarth}`;
    }

    const innerTitle = document.createElement("div");
    const greyBox = document.createElement("div");

    greyBox.id = "inner-title";
    greyBox.className = "grey-box";

    innerTitle.appendChild(titleElement);
    innerTitle.appendChild(dateElement);
    innerTitle.appendChild(paragraphElement);

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

    const paragraphBoxSmall = document.createElement("div");
    paragraphBoxSmall.className = "paragraph-box-small";
    paragraphBoxSmall.id = "paragraph-box-small";

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

/**
 * Removes all spaces in a string which results in one long word.
 * @param str arbitrary string to edit
 * @returns STR where are all spaces got deleted
 */
export function removeAllSpaces(str: string){
    return str.replace(/\s+/g, '');
}

/**
 * Generate a random integer between min (inclusive) and max (exclusive)
 * @param min 
 * @param max
 * @returns random Integer between MIN and MAX
 */
export function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min) + min);
}
/**
 * Check if two dates are the same day
 * @param date2 html id of the element to show
 */
export function isSameDay(date1: Date, date2: Date): boolean {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}

/**
 * Uses HTML Geolocation API to retrieve the user's position.
 * @returns a number array with [latitude, longitude], default is Zurich
 */
export function getUserLocation(): Promise<number[]>{
    return new Promise((resolve) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve([position.coords.latitude, position.coords.longitude]);
                },
                (_error) => {
                    //Geolocation has been declined by the user, use Zurich as default
                    resolve([47.3725151766, 8.54219283122])
                }
            );
        } else { 
            //Geolocation is n/A therefore we use Zurich as default
            resolve([47.3725151766, 8.54219283122]);
        }
    });
}