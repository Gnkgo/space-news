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



function showPlanetInformation(planet: string) {
        const homeContainer = document.getElementById("home-container");
        if(homeContainer){
            console.log("Current display style:", getComputedStyle(homeContainer).display);
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