// from Date object to GG/MM/YYYY
export function parseDate(date) {
    if (!date) return;
    if (!(date instanceof Date)) date = new Date(date);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth()+1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}