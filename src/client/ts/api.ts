export const apiKey = 'DEMO_KEY'; // DEPRECATED, remove soon (moved to backend)

export function getFormattedDate(): string { // DEPRECATED, remove soon (moved to common)
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

