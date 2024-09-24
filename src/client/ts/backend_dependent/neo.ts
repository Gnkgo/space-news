import { getFormattedDate, getDateMinusMonth as getDateMinusMonth } from '../../../common/utils';
import { CADRes as CadJson, FireballRes as FireBallJson } from '../../../common/api';
import { createSunBackButton, removeAllSpaces, getRandomInt, formatDate } from '../base';
import asteroid_selected from '../../img/asteroid_selected.png';
import earth from '../../img/earth.png';
import asteroid from '../../img/asteroid.png';
import { cadTarget } from '../../../common/api';
import { fireballTarget } from '../../../common/api';
import { createFooter } from '../base';
//Close approach parameters

//const cadApiUrl = `/nasa-cad-api?date-min=${cadMinDate}&date-max=${cadMaxDate}&min-dist-max=${cadMinDistMax}`;
////console.log(cadApiUrl);
//Fireball parameters
const fireballMinDate = '2010-01-01';
const fireballReqLocBool = true;
//const fireballApiUrl = `/nasa-fireball-api?date-min=${fireballMinDate}&req-loc=${fireballReqLocBool}`;

//Bool dictionary for permanent cad info display
let cadInfoDict: { [key: string]: boolean } = {};
let cadAsteroidSelected = false;

async function getNeoData(): Promise<CadJson> {
    try {
        const response = await fetch(cadTarget.resolve({
            'date-min': getDateMinusMonth(),
            'date-max': getFormattedDate(),
            'dist-max': "0.0026"
        }));

        //console.log(response, "response, getNeoData");

        // Log the full response body to inspect its structure
        const data = await response.json();
        //console.log(data, "Full response data, getNeoData");

        return data as CadJson;
    } catch (error) {
        console.error("Error fetching close approach data", error);
        throw error;
    }
}



const neoContainer = document.getElementById('neo-container') as HTMLDivElement;

//console.log(neoContainer, "neoContainer");
const cadContainer = document.createElement('div');
cadContainer.id = 'cad-container';
const fireballContainer = document.createElement('div');
fireballContainer.id = 'fireball-container';
const neo = document.createElement('img');
neo.id = 'neo';
neo.src = earth;


// Append cadContainer to neoContainer or wherever you want it to be
if (neoContainer) {
    createFooter(neoContainer);

    neoContainer.appendChild(cadContainer);
    neoContainer.appendChild(neo);
    neoContainer.appendChild(fireballContainer);
    getCloseApproachData();
    getFireballData();

    // Add back to the home page button
    createSunBackButton(neoContainer);

}
async function getCloseApproachData() {
    try {
        //const res = await fetch(cadApiUrl);
        let res = await getNeoData();
        //console.log(res, "res, getcloseapproachdata");
        //const cad = await res.json();
        ////console.log(cad, "cad")
        processCloseApproachData(res);
    } catch (error) {
        //console.log("Error fetching close approach data: " + error)
    }
}


let auDistance = 0.0026;
let velocity = 0.0003;


function processCloseApproachData(cadJson: CadJson) {
    const neoContainer = document.getElementById('neo-container');
    const cadContainer = document.getElementById('cad-container');
    //console.log(cadJson, "cadJson")
    for (const elem of cadJson.data) {
        const elemName = removeAllSpaces(elem[0]!);
        cadInfoDict[elemName] = false;

        //Create Asteroid image
        const cadElemImg = document.createElement('img');
        cadElemImg.classList.add('cad-elem-img');
        cadElemImg.id = `cad-elem-img-${elemName}`;
        cadElemImg.src = asteroid;

        //create selected_asteroid image
        const cadElemImgSelected = document.createElement('img');
        cadElemImgSelected.classList.add('cad-elem-img-selected');
        cadElemImgSelected.id = `cad-elem-img-selected-${elemName}`;
        cadElemImgSelected.src = asteroid_selected;

        const auDistance = Number(elem[5]); // AU Distance for this asteroid
        const velocity = Number(elem[7]);   // Velocity for this asteroid

        // Pass auDistance and velocity as arguments to the function
        addVariableOrbitAnimation(cadElemImg, cadElemImgSelected, auDistance, velocity);


        //add eventlistener to asteroid image
        cadElemImg.addEventListener('mouseover', () => showCadInfo(elemName));
        cadElemImg.addEventListener('click', () => showPermanentCadInfo(elemName));
        cadElemImg.addEventListener('mouseleave', () => hideCadInfo(elemName));

        //add eventlistener to selected_astroid image
        cadElemImgSelected.addEventListener('click', () => showPermanentCadInfo(elemName));

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
        objectVelText.textContent = `Velocity: ${Number(elem[7]).toFixed(3)}km/s`;
        cadElemInfo?.appendChild(objectVelText);

        cadContainer?.appendChild(cadElemInfo);
    }
}

function showCadInfo(elemName: string, switchCadInfo?: boolean) {
    const cadElemInfo = document.getElementById(`cad-elem-info-${elemName}`);
    //console.log(cadElemInfo, "cadElemInfo");
    if (cadElemInfo && (!cadAsteroidSelected || switchCadInfo) && screen.width > 660) {
        hideCadInfo();
        cadElemInfo.style.display = 'flex';
    } else if (!cadElemInfo) {
        console.log('Error showing the cad info box for: ' + elemName);
    }
}

function showPermanentCadInfo(elemName: string) {
    const elemSelectedImage = document.getElementById(`cad-elem-img-selected-${elemName}`);

    if (cadInfoDict[elemName]) {
        //The selected Asteroid has been clicked again
        //hide info box
        const cadElemInfo = document.getElementById(`cad-elem-info-${elemName}`);
        if (cadElemInfo) {
            cadElemInfo.style.display = 'none';
        }
        //hide asteroid_selected image
        if (elemSelectedImage) {
            elemSelectedImage.style.opacity = '0%';
            elemSelectedImage.style.zIndex = '0';
        }
        cadAsteroidSelected = false;
    } else {
        //Display the info box & if neccessary hide previous info boxes
        showCadInfo(elemName, true);
        cadInfoDict[elemName] = true;
        cadAsteroidSelected = true;

        //Display the selecetd asteroid image
        if (elemSelectedImage) {
            elemSelectedImage.style.opacity = '100%';
            elemSelectedImage.style.zIndex = '2';
        }

    }
}

function hideCadInfo(elemName?: string) {
    const cadElemInfo = document.getElementById(`cad-elem-info-${elemName}`);
    if (elemName && !cadInfoDict[elemName] && cadElemInfo) {
        cadElemInfo.style.display = 'none';
    } else if (!elemName) {
        for (const [key,] of Object.entries(cadInfoDict)) {
            cadInfoDict[key] = false;
            //hide info boxes
            const elem = document.getElementById(`cad-elem-info-${key}`);
            if (elem) {
                elem.style.display = 'none';
            }
            //hide selected asteroid images
            const elemSelected = document.getElementById(`cad-elem-img-selected-${key}`)
            if (elemSelected) {
                elemSelected.style.opacity = '0%';
                elemSelected.style.zIndex = '0';
            }
        }
    } else if (!cadElemInfo) {
        //console.log('Error hiding the cad info box for: ' + elemName);
    }
}

function addVariableOrbitAnimation(elem: HTMLImageElement, elemSelected: HTMLImageElement, auDistance: number, velocity: number): void {
    const velocityMin = 5;
    const velocityMax = 30;
    const durationMin = 50;
    const durationMax = 181;

    const duration = durationMax + ((velocity - velocityMin) / (velocityMax - velocityMin)) * (durationMin - durationMax);

    const auMin = 0.0003;
    const auMax = 0.0026;

    let distanceMin: number, distanceMax: number;

    function calculateDistance(): number {
        if (window.innerWidth < 660) {
            distanceMin = 20;
            distanceMax = 30;
        } else {
            distanceMin = 36;
            distanceMax = 48;
        }

        const distance = distanceMin + ((auDistance - auMin) / (auMax - auMin)) * (distanceMax - distanceMin);
        return distance;
    }

    let distance = calculateDistance();
    const startingAngle = getRandomInt(0, 360);

    // Access the first stylesheet safely
    const styleSheet = document.styleSheets[0];

    // Check if the styleSheet is available
    if (styleSheet) {
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

        // Insert the keyframes rule if the stylesheet is defined
        styleSheet.insertRule(keyframes, styleSheet.cssRules.length);

        elem.style.animation = `orbitAsteroid-${elem.id} ${duration}s linear infinite`;
        elemSelected.style.animation = `orbitAsteroid-${elem.id} ${duration}s linear infinite`;
    } else {
        console.error("No stylesheet found in the document.");
    }

    window.addEventListener('resize', () => {
        distance = calculateDistance(); // Recalculate the distance
        console.log(distance, "distance");
        console.log(duration, "duration");
        if (styleSheet) {
            // Update keyframes with new distance
            const newKeyframes = `
                @keyframes orbitAsteroid-${elem.id} {
                    0% {
                        transform: rotate(${startingAngle}deg) translateY(${distance}vh) rotate(45deg);
                    }
                    100% {
                        transform: rotate(${startingAngle + 360}deg) translateY(${distance}vh) rotate(45deg);
                    }
                }
            `;

            // Remove the old keyframe rule
            const index = Array.from(styleSheet.cssRules).findIndex((rule) => {
                // Check if the rule is a CSSKeyframesRule and if it has the correct name
                return (rule instanceof CSSKeyframesRule) && rule.name === `orbitAsteroid-${elem.id}`;
            });

            if (index !== -1) {
                styleSheet.deleteRule(index);
            }

            // Add new keyframe with updated distance
            styleSheet.insertRule(newKeyframes, styleSheet.cssRules.length);

            // Re-apply the animation with the updated distance
            elem.style.animation = `orbitAsteroid-${elem.id} ${duration}s linear infinite`;
            elemSelected.style.animation = `orbitAsteroid-${elem.id} ${duration}s linear infinite`;
        } else {
            console.error("No stylesheet found in the document.");
        }
    });
}



async function getFireballData() {
    try {
        const res = await fetch(fireballTarget.resolve({ 'date-min': getDateMinusMonth(), 'req-loc': true }));
        //console.log(res, "res, fireballapi");

        const fireballData = await res.json();
        //console.log(fireballData, "fireballData");
        processFireballData(fireballData);
    } catch (error) {
        //console.log("Error fetching fireball data: " + error)
    }
}

function processFireballData(fireballJson: FireBallJson) {
    const fireballContainer = document.getElementById('fireball-container');

    for (const elem of fireballJson.data) {
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