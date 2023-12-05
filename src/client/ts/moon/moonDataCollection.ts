import { MoonRes as MoonData, moonTarget } from '../../../common/api';


const location = 'zurich';

export async function getMoonData(date: string): Promise<MoonData> {
    try {
        const response = await fetch(moonTarget.resolve({date: date, location: location}));
        const data = await response.json() as MoonData;
        return data;
    } catch (error) {
        console.error("Error fetching weather data", error);
        throw error;
    }
}
