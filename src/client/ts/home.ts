//Add click-eventlistener to planets
const mars = document.getElementById('mars');
mars?.addEventListener('click', () => showPlanetInformation('mars'));

const earth = document.getElementById('earth');
earth?.addEventListener('click', () => showPlanetInformation('nea'));

const moon = document.getElementById('moon');
moon?.addEventListener('click', () => showPlanetInformation('moon'));

//Add click-eventlistener for sun gimmick
const sun = document.getElementById('sun');



function showPlanetInformation(planet: string){
    const body = document.body;
    body.innerHTML = '';

    switch (planet) {
        case 'mars':
            body.innerHTML = '<h1>Mars</h1>'
            body.style.backgroundImage = 'none';
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