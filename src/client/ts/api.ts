export const apiKey = 'ZuW891bZkaap2ZJ9L1tJHldstVbEZfWZef1WpSHX'; // DEPRECATED, remove soon

export function getFormattedDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

