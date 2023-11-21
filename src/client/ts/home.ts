//Add click-eventlistener to planets
const mars = document.getElementById('mars');
mars?.addEventListener('click', () => showPlanetInformation('mars'));

const earth = document.getElementById('earth');
earth?.addEventListener('click', () => showPlanetInformation('nea'));

const moon = document.getElementById('moon');
moon?.addEventListener('click', () => showPlanetInformation('moon'));

//Add click-eventlistener for sun gimmick
const sun = document.getElementById('sun');
sun?.addEventListener('click', showSunEasterEgg);


function showPlanetInformation(planet: string){
    const body = document.body;
    body.innerHTML = '';

    switch (planet) {
        case 'mars':
            body.style.backgroundImage = 'none';
            const marsDiv = document.createElement('div');
            marsDiv.id = 'marsID';
            const script = document.createElement('script');
            script.src = "/src/client/ts/mars.ts";

            body.appendChild(marsDiv);
            body.appendChild(script);
            break;
        case 'nea':
            body.innerHTML = '<h1>NEA</h1>'
            body.style.backgroundImage = 'none';
            break;
        case 'moon':
            body.innerHTML = '<h1>moon</h1>'
            body.style.backgroundImage = 'none';
            break;
        default:
            break;
    }
}

function showSunEasterEgg(){
    
}