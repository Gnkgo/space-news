import {getFormattedDate} from '../../../common/utils';
import { CADRes as CadJson, FireballRes as FireBallJson} from '../../../common/api';
import { createSunBackButton } from '../base';

//Close approach parameters
const cadMinDate = getFormattedDate();
const cadMaxDate = '30';
const cadMinDistMax = '0.0026'; //Distance to moon in unit 'au'
const cadApiUrl = `/nasa-cad-api?date-min=${cadMinDate}&date-max=${cadMaxDate}&min-dist-max=${cadMinDistMax}`;

//Fireball parameters
const fireballMinDate = '2010-01-01';
const fireballReqLocBool = true;
const fireballApiUrl = `/nasa-fireball-api?date-min=${fireballMinDate}&req-loc=${fireballReqLocBool}`;

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
    const cadContainer = document.getElementById('cad-container');

    for (const elem of cadJson.data){
        const cadElemBox = document.createElement('div');
        cadElemBox.id = 'cad-Elem-box';

        const objectName = document.createElement("h3");
        objectName.textContent = elem[0]?.toString() || 'N/A';
        cadElemBox?.appendChild(objectName)

        const objectDateText = document.createElement("p");
        objectDateText.textContent = "Closest approach date: " + elem[3];
        cadElemBox?.appendChild(objectDateText);

        const objectDistText = document.createElement("p");
        objectDistText.textContent = "Distance: " + Number(elem[5]).toFixed(4) + "au";
        cadElemBox?.appendChild(objectDistText);

        const objectVelText = document.createElement("p");
        objectVelText.textContent = "Velocity: " + Number(elem[7]).toFixed(4) + "km/s";
        cadElemBox?.appendChild(objectVelText);

        cadContainer?.appendChild(cadElemBox);
    }
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