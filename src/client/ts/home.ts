import { HOME_COMPONENT_ID, getUserLocation, tryShowTutorial } from "./base";
//import { createAndOpenTutoralModal } from "./mars/modal";
import { initMoon } from "./backend_dependent/moon";
import "@fortawesome/fontawesome-free/css/all.css";

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
sun?.addEventListener('click', () => showSunEasterEgg(sun));



async function showPlanetInformation(planet: string) {
        const homeContainer = document.getElementById("home-container");
        if(homeContainer){
            homeContainer.style.display = 'none';
        }

    switch (planet) {
        case 'mars':
            const marsContainer = document.getElementById('mars-container');
            if(marsContainer){
                marsContainer.style.display = 'grid';
            }
            break;
    
        case 'neo':
            const neoContainer = document.getElementById('neo-container');
            if(neoContainer){
                neoContainer.style.display = 'grid';
            }
            break;
        case 'moon':
            const moonContainer = document.getElementById('moon-container');
            if(moonContainer){
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