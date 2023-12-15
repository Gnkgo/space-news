import { HOME_COMPONENT_ID, MARS_COMPONENT_ID, MOON_COMPONENT_ID, getUserLocation, tryShowTutorial } from "./base";
//import { createAndOpenTutoralModal } from "./mars/modal";
import { initMoon } from "./backend_dependent/moon";
import "@fortawesome/fontawesome-free/css/all.css";
import { createModal, openModal } from "./mars/modal";

//Display Tutorial for NEW user
//if(!localStorage.getItem("notFirstTimeUser")) createAndOpenTutoralModal();
localStorage.clear();
tryShowTutorial(HOME_COMPONENT_ID, {
    "en": "<i class=\"fa-solid fa-arrow-pointer\"></i> Click any celestial body to get more information.",
    "de": "<i class=\"fa-solid fa-arrow-pointer\"></i> Klicken Sie auf einen Himmelskörper, um zusätzliche Informationen zu erhalten."
})

//Add click-eventlistener to planets
const mars = document.getElementById('mars');
mars?.addEventListener('click', () => showPlanetInformation('mars'));

const earth = document.getElementById('earth');
earth?.addEventListener('click', () => showPlanetInformation('neo'));

const moon = document.getElementById('moon');
moon?.addEventListener('click', () => showPlanetInformation('moon'));

//Add click-eventlistener for sun gimmick
const sun = document.getElementById('sun') as HTMLImageElement;
let clickCount = 0;

sun?.addEventListener('click', () => {
    showSunEasterEgg(sun);
    clickCount++;

    if (clickCount === 3 || clickCount === 20 || clickCount === 30) {
        sun.classList.add("explosion");

        setTimeout(() => {
            sun.classList.remove("explosion");

        }, 2000);
        setTimeout(() => {
            createModal();
            openModal("", null, false, true);
        }, 2000);
    }
});

async function showPlanetInformation(planet: string) {
    const homeContainer = document.getElementById("home-container");
    if (homeContainer) {
        homeContainer.style.display = 'none';
    }

    switch (planet) {
        case 'mars':
            const marsContainer = document.getElementById('mars-container');
            if (marsContainer) {
                marsContainer.style.display = 'grid';
                tryShowTutorial(MARS_COMPONENT_ID, {
                    "en": "<i class=\"fa-solid fa-arrow-pointer\"></i> Discover the weather on Mars. You can zoom in and out of the temperature graph. Discover what it looks like on Mars. Press on the planet to see an image from one of the three Rovers on Mars.",
                })
            }
            break;

        case 'neo':
            const neoContainer = document.getElementById('neo-container');
            if (neoContainer) {
                neoContainer.style.display = 'grid';
            }
            break;
        case 'moon':
            const moonContainer = document.getElementById('moon-container');
            if (moonContainer) {
                moonContainer.style.display = 'grid';
                const location = await getUserLocation();
                initMoon(location);
                tryShowTutorial(MOON_COMPONENT_ID, {
                    "en": "<i class=\"fa-solid fa-arrow-pointer\"></i> Cannot sleep tonight? Maybe the moon is keeping you awake. Find out when the next full moon is.",
                })
            }
            break;
        default:
            break;
    }
}


function showSunEasterEgg(sunImg: HTMLImageElement) {
    sunImg.style.animation = 'sunEasterEgg 0.6s ease-in-out';
    setTimeout(() => {
        sunImg.style.animation = '';
    }, 600);
}