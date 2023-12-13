import { getUserLocation } from "./base";
import { createAndOpenTutoralModal, createModal, openModal } from "./mars/modal";
import { initMoon } from "./backend_dependent/moon";
import "@fortawesome/fontawesome-free/css/all.css";

//Display Tutorial for NEW user
if (!localStorage.getItem("notFirstTimeUser")) createAndOpenTutoralModal();

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