import {getFormattedDate} from '../../../common/utils';
import { CADRes as CadJson, FireballRes as FireBallJson} from '../../../common/api';
import { createSunBackButton, removeAllSpaces, getRandomInt } from '../base';

//Close approach parameters
const cadMinDate = getFormattedDate();
const cadMaxDate = '30';
const cadMinDistMax = '0.26'; //Distance to moon in unit 'au'
const cadApiUrl = `/nasa-cad-api?date-min=${cadMinDate}&date-max=${cadMaxDate}&min-dist-max=${cadMinDistMax}`;

//Fireball parameters
const fireballMinDate = '2010-01-01';
const fireballReqLocBool = true;
const fireballApiUrl = `/nasa-fireball-api?date-min=${fireballMinDate}&req-loc=${fireballReqLocBool}`;

//Bool dictionary for permanent cad info display
let cadInfoDict: {[key: string] : boolean} = {};
let cadInfoHover = false;


const neoContainer = document.getElementById('neo-container') as HTMLDivElement;
fetch('/neo.html')
                .then(response => response.text())
                .then(html => {
                    if(neoContainer){
                        neoContainer.innerHTML = html;
                        getCloseApproachData(cadApiUrl);
                        getFireballData(fireballApiUrl);
                        
                        //Add back to home page button
                        createSunBackButton(neoContainer);
                    }
                })
                .catch(error => console.error('Error loading neo.html:', error));

async function getCloseApproachData(cadApiUrl: string){
    try{
        const res = await fetch(cadApiUrl);
        const cad = await res.json() as CadJson;
        processCloseApproachData(cad);
    } catch (error){
        console.log("Error fetching close approach data: " + error)
    }
}

function processCloseApproachData(cadJson: CadJson){
    const neoContainer = document.getElementById('neo-container');
    const cadContainer = document.getElementById('cad-container');

    for (const elem of cadJson.data){
        const elemName = removeAllSpaces(elem[0]!);
        cadInfoDict[elemName] = false;
        //Create Asteroid image
        const cadElemImg = document.createElement('img');
        cadElemImg.classList.add('cad-elem-img'); 
        cadElemImg.id = `cad-elem-img-${elemName}`;
        cadElemImg.src = '/src/client/img/asteroid.png';

        const cadElemImgSelected = document.createElement('img');
        cadElemImgSelected.classList.add('cad-elem-img-selected');
        cadElemImgSelected.id = `cad-elem-img-selected-${elemName}`;
        cadElemImgSelected.src = '/src/client/img/asteroid_selected.png';

        addVariableOrbitAnimation(cadElemImg, cadElemImgSelected);

        cadElemImg.addEventListener('mouseover', () => showCadInfo(elemName));
        cadElemImg.addEventListener('click', () => showPermanentCadInfo(elemName));
        cadElemImg.addEventListener('mouseleave', () => hideCadInfo(elemName));
        neoContainer?.appendChild(cadElemImg);
        neoContainer?.appendChild(cadElemImgSelected);

        //Create Info Box
        const cadElemInfo = document.createElement('div');
        cadElemInfo.classList.add('cad-elem-info');
        cadElemInfo.id = `cad-elem-info-${elemName}`

        const objectName = document.createElement("h4");
        objectName.textContent = `Asteroid - ${elem[0]!}`;
        cadElemInfo?.appendChild(objectName)

        const objectDateText = document.createElement("p");
        objectDateText.innerHTML = `Closest Approach<br> date: ${elem[3]}`;
        cadElemInfo?.appendChild(objectDateText);

        const objectDistText = document.createElement("p");
        objectDistText.textContent = `Distance: ${Number(elem[5]).toFixed(4)}au`;
        cadElemInfo?.appendChild(objectDistText);

        const objectVelText = document.createElement("p");
        objectVelText.textContent = `Velocity: ${Number(elem[7]).toFixed(4)}km/s`;
        cadElemInfo?.appendChild(objectVelText);

        cadContainer?.appendChild(cadElemInfo);
    }
}

function showCadInfo(elemName: string){
    const cadElemInfo = document.getElementById(`cad-elem-info-${elemName}`);
    if(cadElemInfo && !cadInfoHover){
        hideCadInfo();
        cadElemInfo.style.display = 'flex';
    } else {
        console.log('Error showing the cad info box for: ' + elemName);
    }
}

function showPermanentCadInfo(elemName: string){
    showCadInfo(elemName);
    cadInfoDict[elemName] = !cadInfoDict[elemName];
    cadInfoHover = true;

    //show asteroid_selected image
    const elemSelectedImage = document.getElementById(`cad-elem-img-selected-${elemName}`);
    if(elemSelectedImage){
        elemSelectedImage.style.opacity = '100%';
        elemSelectedImage.style.zIndex = '2';
    }

    if(!cadInfoDict[elemName]){
        cadInfoHover = !cadInfoHover;
    }
}

function hideCadInfo(elemName?: string){
    const cadElemInfo = document.getElementById(`cad-elem-info-${elemName}`);
    if(elemName && !cadInfoDict[elemName] && cadElemInfo){
        cadElemInfo.style.display = 'none';
    } else if(!elemName){
        for(const [key, ] of Object.entries(cadInfoDict)){
            cadInfoDict[key] = false;
            const elem = document.getElementById(`cad-elem-info${key}`);
            if(elem){
                elem.style.display = 'none';
            }
        }
    } else if(!cadElemInfo) {
        console.log('Error hiding the cad info box for: ' + elemName);
    }
}

function addVariableOrbitAnimation(elem: HTMLImageElement, elemSelected: HTMLImageElement){
    const duration = getRandomInt(60, 181);
    const distance = getRandomInt(35, 50);
    const startingAngle = getRandomInt(0,360);

    const styleSheet = document.styleSheets[2];
    const keyframes = `
        @keyframes orbitAsteroid-${elem.id} {
            0% {
                transform: rotate(${startingAngle}deg) translateY(${distance}vh) rotate(45deg);
            }

            100% {
                transform: rotate(${startingAngle + 360}deg) translateY(${distance}vh) rotate(45deg);
            }
        }
    `;

    styleSheet?.insertRule(keyframes, styleSheet.cssRules.length);
    elem.style.animation = `orbitAsteroid-${elem.id} ${duration}s linear infinite`;
    elemSelected.style.animation = `orbitAsteroid-${elem.id} ${duration}s linear infinite`;
}

async function getFireballData(fireballApiUrl: string){
    try {
        const res = await fetch(fireballApiUrl);
        const fireballData = await res.json();
        console.log(fireballData);
        processFireballData(fireballData);
    } catch (error) {
        console.log("Error fetching fireball data: " + error)
    }
}

function processFireballData(fireballJson: FireBallJson){
    const fireballContainer = document.getElementById('fireball-container');

    for (const elem of fireballJson.data){
        const fireballElemBox = document.createElement('div');
        fireballElemBox.id = 'fireball-Elem-box';

        const objectDateText = document.createElement("p");
        objectDateText.textContent = "Peak brightness date: " + elem[0];
        fireballElemBox?.appendChild(objectDateText);

        const objectLatText = document.createElement("p");
        objectLatText.textContent = "Lat: " + elem[3] + "°" + elem[4];
        fireballElemBox?.appendChild(objectLatText);

        const objectLonText = document.createElement("p");
        objectLonText.textContent = "Lon: " + elem[5] + "°" + elem[6];
        fireballElemBox?.appendChild(objectLonText);

        fireballContainer?.appendChild(fireballElemBox);
    }
}