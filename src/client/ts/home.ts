//Add click-eventlistener to planets
const mars = document.getElementById('mars');
mars?.addEventListener('click', () => showPlanetInformation('mars'));

const earth = document.getElementById('earth');
earth?.addEventListener('click', () => showPlanetInformation('nea'));

const moon = document.getElementById('moon');
moon?.addEventListener('click', () => showPlanetInformation('moon'));

//Add click-eventlistener for sun gimmick
const sun = document.getElementById('sun');



function showPlanetInformation(planet: string) {
    const body = document.body;
    body.innerHTML = '';
    const head = document.head;

    const baseStyleSheet = document.createElement('link');
    baseStyleSheet.rel = 'stylesheet';
    baseStyleSheet.type = 'text/css';
    baseStyleSheet.href = '/src/client/css/base.css';

    const componentStyleSheet = document.createElement('link');
    componentStyleSheet.rel = 'stylesheet';
    componentStyleSheet.type = 'text/css';
    componentStyleSheet.href = '/src/client/css/component.css';
    head.appendChild(componentStyleSheet);

    switch (planet) {
        case 'mars':
            const marsStylesheet = document.createElement('link');
            marsStylesheet.rel = 'stylesheet';
            marsStylesheet.type = 'text/css';
            marsStylesheet.href = '/src/client/css/mars.css';

            head.appendChild(baseStyleSheet);

            head.appendChild(componentStyleSheet);

            head.appendChild(marsStylesheet);

    
            const main = document.createElement('main');
            main.id = 'main';
    
            const script = document.createElement('script');
            script.type = 'module';
            script.src = '/src/client/ts/mars.ts';
    
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
            
        
            head.appendChild(baseStyleSheet);

            head.appendChild(componentStyleSheet);

            const moonStyleSheet = document.createElement('link');
            moonStyleSheet.rel = 'stylesheet';
            moonStyleSheet.type = 'text/css';
            moonStyleSheet.href = '/src/client/css/moon.css';
            head.appendChild(moonStyleSheet);

            const mainMoon = document.createElement('main'); 
            mainMoon.id = 'main';
            const scriptMoon = document.createElement('script');
            scriptMoon.src = "/src/client/ts/moon.ts";

            body.appendChild(mainMoon);
            body.appendChild(scriptMoon);
            break;
        default:
            break;
    }
}


function showSunEasterEgg() {

}