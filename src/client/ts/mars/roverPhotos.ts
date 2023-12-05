import { createModal, openModal } from "./modal";
import { marsRoverPhotosTarget } from '../../../common/api';
import {  MarsRoverPhotosRes } from '../../../common/api';

const rovers = ["curiosity", "opportunity", "spirit"];
let randomRover = rovers[Math.floor(Math.random() * rovers.length)];

export async function getRoverPhotos(): Promise<MarsRoverPhotosRes> {
    try {
        if (randomRover == undefined) randomRover = "opportunity";
        const response = await fetch(marsRoverPhotosTarget.resolve({ rover: randomRover }));
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching rover photos", error);
        throw error;
    }
}

export async function renderRoverPhotos(): Promise<void> {
    const photoData = await getRoverPhotos();
    let photo: any;
    if (photoData.photos.length > 0) {
        photo = photoData.photos[Math.floor(Math.random() * photoData.photos.length)];
    }
    createModal();
    openModal(photo);
}



