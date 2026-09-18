import { Link } from "react-router-dom";

const sections = {
    privacy: {
        title: "Caremonitor privacy notice",
        intro: "Caremonitor by Aniprotech helps authorised care providers schedule, document and review care services. This notice explains how the service handles information.",
        items: [
            ["Information processed", "Account and contact information, assigned client and care records, visit attendance, foreground location used during an active visit, photographs deliberately attached as care evidence, messages, audit history and device session information."],
            ["How information is used", "To authenticate users, provide assigned care information, verify attendance, maintain care and medication records, support safeguarding, notify authorised people, calculate approved service hours, secure the service and meet legal or contractual record-keeping duties."],
            ["Location, camera and microphone", "Location is requested for check-in, check-out, photo evidence and the active visit trail while Caremonitor is open. The camera is used only when a caregiver chooses to attach evidence. Speech recognition converts speech into editable text; Caremonitor does not store the audio recording."],
            ["Sharing", "Information is available only to authorised users within the relevant care organisation and its approved recipients. Service providers may process limited information to host the platform, deliver authentication email or operate required infrastructure. Caremonitor does not sell personal information or use it for advertising."],
            ["Security and retention", "Information is encrypted in transit. Mobile authentication tokens use the device keychain or keystore. Access is role-based and audited. Retention and deletion are managed by the care organisation according to its legal, safeguarding and contractual obligations."],
            ["Your choices and rights", "Contact the care organisation responsible for your record to request access, correction, restriction, export or deletion where applicable. Caremonitor includes governed privacy-request tools for authorised administrators."],
            ["Contact", "Privacy questions and app account requests can be sent to info@aniprotech.com."],
        ],
    },
    support: {
        title: "Caremonitor support",
        intro: "For account access, assigned visits, permissions or care-record questions, contact your care organisation first.",
        items: [
            ["Technical support", "Email info@aniprotech.com and include your organisation name, device type, app version and a description of the problem. Do not include sensitive client information in ordinary email."],
            ["Urgent care or safeguarding", "Do not use technical support for an emergency. Follow your organisation's emergency and safeguarding procedure and contact the appropriate emergency service."],
            ["Account deletion", "Ask your organisation administrator to deactivate your account. Privacy or deletion requests can also be sent to info@aniprotech.com and will be routed to the responsible organisation."],
        ],
    },
};

export default function PublicInfoPage({ kind }) {
    const page = sections[kind];
    return <main className="min-h-screen bg-[#071A33] px-5 py-12 text-[#0B2447]">
        <article className="mx-auto max-w-3xl rounded-2xl bg-white p-7 shadow-xl md:p-12">
            <p className="font-semibold text-[#00AEEB]">Caremonitor by Aniprotech</p>
            <h1 className="mt-2 text-3xl font-bold">{page.title}</h1>
            <p className="mt-4 leading-7 text-slate-600">{page.intro}</p>
            <p className="mt-2 text-sm text-slate-500">Effective 18 September 2026</p>
            <div className="mt-8 space-y-7">{page.items.map(([heading, body]) => <section key={heading}><h2 className="text-xl font-semibold">{heading}</h2><p className="mt-2 leading-7 text-slate-600">{body}</p></section>)}</div>
            <nav className="mt-10 flex gap-5 border-t pt-6 text-sm font-semibold text-[#007FAE]"><Link to="/privacy">Privacy</Link><Link to="/support">Support</Link><Link to="/login">Sign in</Link></nav>
        </article>
    </main>;
}
