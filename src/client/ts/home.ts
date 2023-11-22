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
    const head = document.head;

    switch (planet) {
        case 'mars':
            // Add link to mars.css
            const marsStylesheet = document.createElement('link');
            marsStylesheet.rel = 'stylesheet';
            marsStylesheet.type = 'text/css';
            marsStylesheet.href = '/src/client/css/mars.css';
            head.appendChild(marsStylesheet);

            const main = document.createElement('main'); // Change 'div' to 'main'
            main.id = 'main';
            const script = document.createElement('script');
            script.src = "/src/client/ts/mars.ts";


            body.appendChild(main);
            body.appendChild(script);


            break;
        case 'nea':
            fetch('/nea.html')
                .then(response => response.text())
                .then(html => {
                    body.innerHTML = html;
                })
                .catch(error => console.error('Error loading nea.html:', error));
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