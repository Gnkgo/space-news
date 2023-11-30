import { CADRes, cadTarget } from '../../../common/api';
import { getFormattedDate } from '../../../common/utils';
//import { createSunBackButton } from './base';

const minDate = getFormattedDate();
const maxDate = '30';
const distMax = '0.01';

const neaContainer = document.getElementById('nea-container') as HTMLDivElement;
fetch('/nea.html')
                .then(response => response.text())
                .then(html => {
                    if(neaContainer){
                        neaContainer.innerHTML = html;
                        getCloseApproachData();
                    }
                })
                .catch(error => console.error('Error loading nea.html:', error));

console.log("start fetching neo stuff");
//TODO: Check if you can adapt the layout so you have a backbutton to the overview page again
//createSunBackButton(neaContainer);

async function getCloseApproachData(){
    try{
        const res = await fetch(cadTarget.resolve({ 'date-min': minDate, 'date-max': maxDate, 'min-dist-max': distMax }));
        const cad = await res.json() as CADRes;
        console.log(cad.data);
        processCloseApproachData(cad);
    } catch (error){
        console.log("Error: " + error)
    }
}

function processCloseApproachData(cadJson: CADRes){
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
