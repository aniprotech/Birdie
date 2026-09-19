import { useEffect } from "react";

const siteUrl = "https://caremonitor.aniprotech.com";
const defaultImage = `${siteUrl}/brand-logo.png`;

function setMeta(selector, attributes) {
    let element = document.head.querySelector(selector);
    if (!element) {
        element = document.createElement("meta");
        document.head.appendChild(element);
    }
    Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
}

export default function SeoMeta({ title, description, path = "/", index = true, schema }) {
    useEffect(() => {
        const canonicalUrl = new URL(path, siteUrl).toString();
        document.title = title;
        setMeta('meta[name="description"]', { name: "description", content: description });
        setMeta('meta[name="robots"]', { name: "robots", content: index ? "index, follow, max-image-preview:large" : "noindex, nofollow, noarchive" });
        setMeta('meta[property="og:title"]', { property: "og:title", content: title });
        setMeta('meta[property="og:description"]', { property: "og:description", content: description });
        setMeta('meta[property="og:type"]', { property: "og:type", content: "website" });
        setMeta('meta[property="og:url"]', { property: "og:url", content: canonicalUrl });
        setMeta('meta[property="og:image"]', { property: "og:image", content: defaultImage });
        setMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
        setMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
        setMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });

        let canonical = document.head.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement("link");
            canonical.rel = "canonical";
            document.head.appendChild(canonical);
        }
        canonical.href = canonicalUrl;

        const id = "caremonitor-structured-data";
        document.getElementById(id)?.remove();
        if (schema) {
            const script = document.createElement("script");
            script.id = id;
            script.type = "application/ld+json";
            script.textContent = JSON.stringify(schema);
            document.head.appendChild(script);
        }
    }, [title, description, path, index, schema]);
    return null;
}

