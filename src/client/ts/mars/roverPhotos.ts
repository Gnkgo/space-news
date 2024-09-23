import { createModal, openModal } from "./modal";
import { marsRoverPhotosTarget } from '../../../common/api';
import { MarsRoverPhotosRes } from '../../../common/api';
import { getRandomInt } from "../base";

const rovers = ["curiosity", "opportunity", "spirit"];

// Fetch rover photos based on the rover name provided
export async function getRoverPhotos(rover: string): Promise<MarsRoverPhotosRes> {
    try {
        const response = await fetch(marsRoverPhotosTarget.resolve({ rover }));
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching rover photos", error);
        throw error;
    }
}

// Render rover buttons for user to choose from
export function renderRoverButtons(): void {
    const container = document.createElement("div");

    // Create a button for each rover
    rovers.forEach((rover) => {
        const button = document.createElement("button");
        button.textContent = rover.charAt(0).toUpperCase() + rover.slice(1);
        button.addEventListener("click", async () => {
            await renderRoverPhotos(rover);
        });
        container.appendChild(button);
    });

    // Attach the button container to the DOM
    document.body.appendChild(container);
}

// Fetch and display photos for the selected rover
export async function renderRoverPhotos(rover: string): Promise<void> {
    const photoData = await getRoverPhotos(rover);

    // Create and open modal with photos
    createModal(rover.charAt(0).toUpperCase() + rover.slice(1), photoData.photos.length > 1);
    openModal(photoData.photos, null, true, false);
}

// Call this function when Mars is clicked to show the rover options
export function onMarsClick(): void {
    renderRoverButtons();
}
