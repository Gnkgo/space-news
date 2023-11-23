import {getFormattedDate} from './api';

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

console.log("start fetching neo stuff");
getCloseApproachData(cadApiUrl);

async function getCloseApproachData(cadApiUrl: string){
    try{
        const res = await fetch(cadApiUrl);
        const cad = await res.json() as CadJson;
        processCloseApproachData(cad);
    } catch (error){
        console.log("Error: " + error)
    }
}

function processCloseApproachData(cadJson: CadJson){
    const cadContainer = document.getElementById('cad-container');
    for (const elem of cadJson.data){
        const objectName = document.createElement("h2");
        objectName.textContent = elem[0]?.toString() || "n/A";
        cadContainer?.appendChild(objectName)

        const objectText = document.createElement("p");
        objectText.textContent = "Close approach on the: " + elem[3] +" in a distance of: " + elem[5] + "au with a velocity of: " + elem[7] + "km/s";
        cadContainer?.appendChild(objectText);
        console.log("The Object: " + elem[0] + " will approach the earth on the: " + elem[3] + " in a distance of: " + elem[5] + "au with a velocity of: " + elem[7] + "km/s");
    }
}
