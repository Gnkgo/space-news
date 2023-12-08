import { MoonRes as MoonData, moonTarget } from '../../../common/api';

export async function getMoonData(date: string, location: number[]): Promise<MoonData> {
    try {
        const response = await fetch(moonTarget.resolve({date: date, lat: location[0]!, lon: location[1]!}));
        const data = await response.json() as MoonData;
        return data;
    } catch (error) {
        console.error("Error fetching weather data", error);
        throw error;
    }
}