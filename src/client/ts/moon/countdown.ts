export function updateCountdown(differenceInMilliseconds: number, isCurrentDate: boolean) : string {

    if (!isCurrentDate) return "";

    if (differenceInMilliseconds > 0) {
        const days = Math.floor(differenceInMilliseconds / (1000 * 60 * 60 * 24));
        const hours = Math.floor((differenceInMilliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((differenceInMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((differenceInMilliseconds % (1000 * 60)) / 1000);
        return`Time until Full Moon: ${days}d ${hours}h ${minutes}m ${seconds}s`;


    } else {
        return "TODAY IS THE DAY! IT IS FULL MOON! SLEEP WELL";
    }
}
