import {getFormattedDate} from './api';
//import { createSunBackButton } from './base';

interface CadJson {
    signature: {
      version: string;
      source: string;
    };
    count: number;
    fields: string[];
    data: Array<Array<string | number>>;
  }
  

const minDate = getFormattedDate();
const maxDate = '30';
const distMax = '0.01';
const cadApiUrl = `/nasa-cad-api?date-min=${minDate}&date-max=${maxDate}&dist-max=${distMax}`;

const neaContainer = document.getElementById('nea-container') as HTMLDivElement;
fetch('/nea.html')
                .then(response => response.text())
                .then(html => {
                    if(neaContainer){
                        neaContainer.innerHTML = html;
                        getCloseApproachData(cadApiUrl);
                    }
                })
                .catch(error => console.error('Error loading nea.html:', error));

console.log("start fetching neo stuff");
//TODO: Check if you can adapt the layout so you have a backbutton to the overview page again
//createSunBackButton(neaContainer);

async function getCloseApproachData(cadApiUrl: string){
    try{
        const res = await fetch(cadApiUrl);
        const cad = await res.json() as CadJson;
        console.log(cad.data);
        processCloseApproachData(cad);
    } catch (error){
        console.log("Error: " + error)
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
