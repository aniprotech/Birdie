import { Link } from "react-router-dom";
import SeoMeta from "../../components/Common/SeoMeta";

const siteUrl = "https://caremonitor.aniprotech.com";
const description = "Caremonitor by Aniprotech helps care providers coordinate visits, verify attendance, manage care records, eMAR, safeguarding, staff and reporting.";
const publicAddress = {
    streetAddress: import.meta.env.VITE_PUBLIC_STREET_ADDRESS,
    addressLocality: import.meta.env.VITE_PUBLIC_CITY,
    addressRegion: import.meta.env.VITE_PUBLIC_REGION,
    postalCode: import.meta.env.VITE_PUBLIC_POSTCODE,
    addressCountry: import.meta.env.VITE_PUBLIC_COUNTRY_CODE,
};
const hasPublicAddress = Object.values(publicAddress).some(Boolean);
const publicPhone = import.meta.env.VITE_PUBLIC_PHONE;
const sameAs = (import.meta.env.VITE_PUBLIC_SOCIAL_URLS || "").split(",").map((value) => value.trim()).filter(Boolean);
const organization = {
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: "Aniprotech",
    url: siteUrl,
    logo: `${siteUrl}/brand-logo.png`,
    email: "info@aniprotech.com",
    contactPoint: { "@type": "ContactPoint", email: "info@aniprotech.com", ...(publicPhone ? { telephone: publicPhone } : {}), contactType: "customer support", availableLanguage: ["English"] },
    ...(hasPublicAddress ? { address: { "@type": "PostalAddress", ...Object.fromEntries(Object.entries(publicAddress).filter(([, value]) => value)) } } : {}),
    ...(sameAs.length ? { sameAs } : {}),
};
const schema = {
    "@context": "https://schema.org",
    "@graph": [
        organization,
        {
            "@type": "SoftwareApplication",
            "@id": `${siteUrl}/#software`,
            name: "Caremonitor by Aniprotech",
            url: siteUrl,
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web, Android, iOS",
            description,
            publisher: { "@id": `${siteUrl}/#organization` },
            offers: { "@type": "Offer", category: "Business care management software" },
        },
        {
            "@type": "WebSite",
            "@id": `${siteUrl}/#website`,
            name: "Caremonitor by Aniprotech",
            url: siteUrl,
            publisher: { "@id": `${siteUrl}/#organization` },
            inLanguage: "en",
        },
    ],
};

const features = [
    ["Verified visits", "Mobile check-in, check-out, location evidence and actual visit timing for operational and billing review."],
    ["Care records and eMAR", "Assigned care tasks, medication outcomes, notes, incidents, observations and photo evidence in one governed record."],
    ["Workforce operations", "Client management, rosters, teams, inbox, finance, reporting and quality governance for authorised organisations."],
    ["Human-reviewed assistance", "Rules-assisted note summaries and risk signals that remain subject to qualified human review."],
];

export default function PublicHomePage() {
    return <main className="min-h-screen bg-[#071A33] text-white">
        <SeoMeta title="Caremonitor by Aniprotech | Care management software" description={description} path="/" schema={schema} />
        <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
            <img src="/brand-logo.png" alt="Caremonitor by Aniprotech" className="w-44 rounded-lg" />
            <Link to="/login" className="rounded-lg bg-[#00AEEB] px-5 py-3 font-semibold text-[#071A33]">Sign in</Link>
        </header>
        <section className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-[1.2fr_0.8fr] md:py-24">
            <div>
                <p className="font-semibold uppercase tracking-[0.2em] text-[#00D4FF]">Connected care operations</p>
                <h1 className="mt-5 text-4xl font-bold leading-tight md:text-6xl">Safer visits, clearer records and accountable care delivery.</h1>
                <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-200">{description}</p>
                <div className="mt-8 flex flex-wrap gap-4">
                    <Link to="/login" className="rounded-lg bg-[#00AEEB] px-6 py-3 font-semibold text-[#071A33]">Open Caremonitor</Link>
                    <Link to="/support" className="rounded-lg border border-cyan-300 px-6 py-3 font-semibold">Contact support</Link>
                </div>
            </div>
            <div className="rounded-3xl border border-cyan-300/30 bg-white/10 p-7 shadow-2xl backdrop-blur">
                <h2 className="text-2xl font-semibold">Designed for authorised care teams</h2>
                <ul className="mt-5 space-y-4 text-slate-200">
                    <li>Role-based access and organisation separation</li>
                    <li>Auditable care and attendance records</li>
                    <li>Android, iOS and secure web workflows</li>
                    <li>Privacy, retention and governance controls</li>
                </ul>
            </div>
        </section>
        <section className="bg-slate-50 py-16 text-[#0B2447]">
            <div className="mx-auto max-w-6xl px-5">
                <h2 className="text-3xl font-bold">One operational view of care</h2>
                <div className="mt-8 grid gap-6 md:grid-cols-2">
                    {features.map(([title, body]) => <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h3 className="text-xl font-semibold">{title}</h3><p className="mt-2 leading-7 text-slate-600">{body}</p></article>)}
                </div>
            </div>
        </section>
        <footer className="mx-auto flex max-w-6xl flex-wrap gap-x-6 gap-y-3 px-5 py-9 text-sm text-slate-300">
            <span>© {new Date().getFullYear()} Aniprotech</span>
            <Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link><Link to="/account-deletion">Account deletion</Link><Link to="/support">Support</Link>
        </footer>
    </main>;
}
