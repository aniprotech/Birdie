export const downloadFileFromRelativePath = async (filePath, fileName) => {
    if (!filePath) return;

    const baseUrl = import.meta.env.VITE_APP_BASE_LIVE_URL;

    const fullUrl = `${baseUrl}/${filePath}`;

    try {
        const response = await fetch(fullUrl);
        if (!response.ok) throw new Error("File not found or download failed.");

        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = fileName || "document.pdf";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
        console.error("Error downloading file:", err);
        alert("Download failed.");
    }
};
