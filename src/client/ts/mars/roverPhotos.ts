import { createModal, openModal } from "./modal";
import { marsRoverPhotosTarget } from '../../../common/api';
import { MarsRoverPhotosRes } from '../../../common/api';
import { chosenRover } from "../base";


// Fetch rover photos based on the rover name provided
export async function getRoverPhotos(rover: string): Promise<MarsRoverPhotosRes> {
    try {
        const response = await fetch(marsRoverPhotosTarget.resolve({ rover: chosenRover }));

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching rover photos", error);
        throw error;
    }
}

export function displayRoverOptions() {
    const roversContainer = document.getElementById('rovers') as HTMLElement;
    if (roversContainer.style.display === 'flex') {
      roversContainer.style.display = 'none';
    } else {
      roversContainer.style.display = 'flex';
    }
  }

export async function renderRoverPhotos(): Promise<void> {
    const photoData = await getRoverPhotos();
    createModal(chosenRover.charAt(0).toUpperCase() + chosenRover.slice(1), photoData.photos.length > 1);

    openModal(photoData.photos, null, true, false);
}

// Call this function when Mars is clicked to show the rover options
export function onMarsClick(): void {
    renderRoverButtons();
}
