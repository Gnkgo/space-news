export function getFormattedDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function getDateMinusWeek(): string {
    const today = new Date();
    today.setDate(today.getDate() - 7); // Subtract 7 days
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based, so add 1
    const day = String(today.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;  // Return in YYYY-MM-DD format
}