export const inputClass = "block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm";
export const buttonClass = "rounded-lg bg-customNavy px-4 py-2 text-sm font-semibold text-white disabled:opacity-50";
export const londonToday = () =>
    new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
export const displayTime = (value) => new Date(value).toLocaleString("en-GB", { timeZone: "Europe/London" });
export const money = (pence) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(Number(pence) / 100);
export function downloadCsv(filename, rows) {
    const cell = (value) => {
        let s = String(value ?? "");
        if (/^[=+@\-\t\r]/.test(s)) s = "'" + s;
        return '"' + s.replaceAll('"', '""') + '"';
    };
    const blob = new Blob(["\ufeff" + rows.map((row) => row.map(cell).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
