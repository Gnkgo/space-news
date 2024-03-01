import { displayRoverOptions, getRoverPhotos, renderRoverPhotos } from "./mars/roverPhotos";
import sunUrl from '../img/sun.png';
import blueMoon from '../img/blueMoon.png'

export let chosenRover: string;

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
    sunButton.src = sunUrl;

    divContainer.appendChild(sunButton);
    sunButton?.addEventListener('click', goHome);
}


export function createTitle(divContainer: HTMLDivElement, title: string, paragraph: string, isSol: boolean, dateEarth: string, dateSol: string) {
    let titleBox = divContainer.querySelector(".title-box"); // Assuming you are using a class selector
    if (titleBox) titleBox.remove();

    titleBox = document.createElement("div");
    titleBox.id = `title-box-${divContainer.id}`;
    titleBox.classList.add("title-box");

    const titleElement = document.createElement("h1");
    titleElement.textContent = title;

    const dateElement = document.createElement("h2");

    const paragraphElement = document.createElement("p");
    paragraphElement.textContent = paragraph;

    if (isSol) {
        dateElement.textContent = `Sol ${dateSol}`;
    } else {
        dateElement.textContent = `${dateEarth}`;
    }

    const greyBox = document.createElement("div");

    greyBox.id = `inner-title-${divContainer.id}`;
    greyBox.className = "grey-box";

    greyBox.appendChild(titleElement);
    greyBox.appendChild(dateElement);
    greyBox.appendChild(paragraphElement);



    titleBox.appendChild(greyBox);
    divContainer.appendChild(titleBox);
}
export function createImage(container: HTMLElement, imagePath: string, description: string, dateContainer: HTMLDivElement | null): void {
    const existingImage = container.querySelector('#image-container-moon-container') as HTMLImageElement;

    if (existingImage) {
        existingImage.remove();
    }

    const image = document.createElement('img');
    image.className = 'image';
    image.id = `${container.id}-image`;
    image.src = imagePath;

    const imageContainer = document.createElement('div');
    imageContainer.className = 'image-container';
    imageContainer.id = `image-container-${container.id}`;
    console.log(imageContainer.id);
    imageContainer.appendChild(image);
    const descriptionTextNode = document.createTextNode(description);

    imageContainer.appendChild(descriptionTextNode);
    if (dateContainer) {
        imageContainer.appendChild(dateContainer);
    }

    if (container.id === 'mars-container') {
        console.log("mars container")
        const rovers = document.createElement('div');
        rovers.id = "rovers";
        rovers.className = "rovers";

        const roverButtonCuriosity = document.createElement('button');
        roverButtonCuriosity.id = "curiosity";
        roverButtonCuriosity.className = "rover-button";
        roverButtonCuriosity.textContent = "Curiosity";

        roverButtonCuriosity.addEventListener('click', () => {
            chosenRover = "curiosity";
            getRoverPhotos();
            renderRoverPhotos();
            console.log("clicked curiosity");
        });


        const roverButtonOpportunity = document.createElement('button');
        roverButtonOpportunity.id = "opportunity";
        roverButtonOpportunity.className = "rover-button";
        roverButtonOpportunity.textContent = "Opportunity";

        roverButtonOpportunity.addEventListener('click', () => {
            chosenRover = "opportunity";
            console.log(chosenRover);
            getRoverPhotos();
            renderRoverPhotos();
        });

        const roverButtonSpirit = document.createElement('button');
        roverButtonSpirit.id = "spirit";
        roverButtonSpirit.className = "rover-button";
        roverButtonSpirit.textContent = "Spirit";

        roverButtonSpirit.addEventListener('click', () => {
            chosenRover = "spirit";
            console.log(chosenRover);

            getRoverPhotos();
            renderRoverPhotos();
        });


        rovers.appendChild(roverButtonCuriosity);
        rovers.appendChild(roverButtonOpportunity);
        rovers.appendChild(roverButtonSpirit);

        imageContainer.appendChild(rovers);

        image.addEventListener('click', () => {
            console.log("hover");
            displayRoverOptions();
        })



    } else if (container.id === 'moon-container') {
        image.addEventListener('click', () => {

            const catImage = document.createElement('img');
            catImage.className = 'image';
            catImage.src = blueMoon;
            imageContainer.removeChild(descriptionTextNode);

            imageContainer.removeChild(image);
            if (dateContainer) {
                imageContainer.removeChild(dateContainer);
            }
            imageContainer.appendChild(catImage);
            container.appendChild(imageContainer);

            setTimeout(() => {
                imageContainer.removeChild(catImage);
                imageContainer.appendChild(image);
                imageContainer.appendChild(descriptionTextNode);
                if (dateContainer) {
                    imageContainer.appendChild(dateContainer);
                }
                container.appendChild(imageContainer);

            }, 1000);
        });
    }

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

    // Create a list of names
    const names = ["DeValdi", "Gnkgo", "Nick20500"];

    const footerText = document.createTextNode("© 2023 by ");
    footer.appendChild(footerText);
    // Create an anchor element for each name and append it to the footer
    names.forEach(name => {
        const anchor = document.createElement("a");
        anchor.className = "github-link";
        anchor.href = `https://github.com/${name}`;
        if (name == "Nick20500") {
            anchor.textContent = "Nick";
        } else {
            anchor.textContent = name;
        }
        anchor.target = "_blank"; // Open link in a new tab
        footer.appendChild(anchor);

        // Add a separator (comma) between names, except for the last one
        if (name !== names[names.length - 1]) {
            const separator = document.createElement("span");
            separator.textContent = " - ";
            footer.appendChild(separator);
        }
    });

    // Add the footer to the container
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

    const spinningEarthContainer = document.getElementById('spinning-earth-container');
    if (spinningEarthContainer) {
        spinningEarthContainer.style.display = 'none';
    }
}

/**
 * Hide the FROM element with display = none, and show the TO element.
 * This achieves an inplace "switch" of elements.
 * @param from html id of the element to hide
 * @param to html id of the element to show
 * @param newDisplayStyle optional parameter for TO element new display value, default is FROM.style.display
 */
export function changeElemDisplay(from: string, to: string, newDisplayStyle?: string) {
    const fromElem = document.getElementById(from);
    const toElem = document.getElementById(to);
    if (fromElem && toElem) {
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
export function removeAllSpaces(str: string) {
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
export function getUserLocation(): Promise<number[]> {
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

/**
 * "Real" modulo function, since "%" operator is only remainder function in JS.
 * @param n dividend
 * @param m divosor
 * @returns modulo-remainder
 */
export function modulo(n: number, m: number) {
    return ((n % m) + m) % m;
}

/**
 * Closes a modal element by hiding it.
 * @param modalId The HTML id of the modal element.
 */
export function closeModal(modalId: string): void {
    const modal = document.getElementById(modalId) as HTMLElement;
    modal.style.display = "none";
}

/**
 * Creates and opens a modal tutorial for the given component.
 * @param componentId The id of the component (limited to the range 0-15 or 0-31, dunno).
 * @param dict An object providing different texts for different languages. If more specific language
 * tags are added (like 'en-US' besides just 'en'), they need to be ordered BEFORE their less specific
 * counterpart(s). The language tag 'en' is mandatory, as it is the fallback option.
 */
export function tryShowTutorial(componentId: number, dict: { "en": string, [lang: string]: string }, onClose: () => void = () => { }): void {
    const bit = 1 << componentId;
    const getClosedTutorials = () => Number.parseInt(localStorage.getItem("closedTutorials") ?? "0");
    if ((getClosedTutorials() & bit) > 0) {
        onClose();
        return;
    }
    const modal = document.createElement("div") as HTMLDivElement;
    modal.id = `tutorial-modal-${componentId}`;
    modal.className = "modal";
    const listeners: { closeOnClick?: (e: MouseEvent) => void, closeOnEscape?: (e: KeyboardEvent) => void } = {};
    const close = () => {
        localStorage.setItem("closedTutorials", (getClosedTutorials() | bit).toString());
        closeModal(modal.id);
        document.removeEventListener("click", listeners.closeOnClick!);
        document.removeEventListener("keyup", listeners.closeOnEscape!);
        onClose();
    }
    listeners.closeOnClick = (_e: MouseEvent) => close();
    listeners.closeOnEscape = (e: KeyboardEvent) => { if (e.key == "Escape") close(); };
    modal.addEventListener("click", listeners.closeOnClick);
    document.addEventListener("keyup", listeners.closeOnEscape);
    const prompt = document.createElement("h2") as HTMLHeadingElement;
    const language = navigator.language;
    prompt.innerHTML = `${Object.entries(dict).find(([lang, _text]) => language.startsWith(lang))?.[1] ?? dict["en"]}`;
    modal.appendChild(prompt);
    document.body.appendChild(modal);
    modal.style.display = "flex";
}
export const HOME_COMPONENT_ID = 0;
export const MARS_COMPONENT_ID = 1;
export const MOON_COMPONENT_ID = 2;
export const NEO_COMPONENT_ID = 3;
export const SPINNING_EARTH_COMPONENT_ID = 4;
