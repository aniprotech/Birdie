import { Link, useParams } from "react-router-dom";
import { differenceInYears, format, parseISO } from "date-fns";
const pretty = (v) =>
    v == null || v === ""
        ? "Not recorded"
        : String(v)
              .replaceAll("_", " ")
              .toLowerCase()
              .replace(/^./, (c) => c.toUpperCase());
export default function BaseInfoSection({ data = {}, sectionId }) {
    const { id } = useParams();
    const a = data.addresses?.find((a) => a.isPrimary) || data.addresses?.[0];
    const address = a ? [a.addressLine1, a.addressLine2, a.city, a.county, a.postalCode, a.country].filter(Boolean).join(", ") : "";
    const photo = data.profileImagePath;
    const apiOrigin = (import.meta.env.VITE_APP_BASE_LIVE_URL || "https://backend.aniprotech.com").replace(/\/$/, "");
    const image = photo ? (/^https?:/.test(photo) ? photo : `${apiOrigin}/${photo.replace(/^\//, "")}`) : null;
    let dob = data.dateOfBirth || "Not recorded";
    try {
        if (data.dateOfBirth)
            dob = `${format(parseISO(data.dateOfBirth), "dd MMMM yyyy")} (${differenceInYears(new Date(), parseISO(data.dateOfBirth))} years old)`;
    } catch {
        /* Display the saved date if a legacy date cannot be formatted. */
    }
    const groups = {
        details: {
            title: "Personal details",
            rows: [
                [
                    "Profile picture",
                    image ? (
                        <img
                            alt="Client profile"
                            src={image}
                            className="h-24 w-24 rounded-full object-cover"
                        />
                    ) : (
                        "Not uploaded"
                    ),
                ],
                ["Title", pretty(data.title)],
                ["First name", data.firstName],
                ["Middle name", data.middleName],
                ["Last name", data.lastName],
                ["Preferred name", data.preferredName],
                ["Pronouns", { HE_HIM: "He/Him", SHE_HER: "She/Her", THEY_THEM: "They/Them" }[data.referredAs]],
                ["Date of birth", dob],
            ],
        },
        contact: {
            title: "Contact details",
            rows: [
                ["Email address", data.email],
                ["Primary phone number", data.primaryPhone ? `${data.primaryPhoneCode || ""} ${data.primaryPhone}` : null],
                ["Primary phone type", pretty(data.primaryPhoneType)],
                ["Secondary phone number", data.secondaryPhone ? `${data.secondaryPhoneCode || ""} ${data.secondaryPhone}` : null],
                ["Secondary phone type", pretty(data.secondaryPhoneType)],
            ],
        },
        address: {
            title: "Primary address",
            rows: [
                ["Address", address],
                [
                    "Secure check-in zone",
                    a?.secureCheckin === true || a?.secureCheckin === "true" ? `${a.checkinRadius || 200} metres (configured)` : "Not configured",
                ],
                ["Access details", a?.accessDetails],
                [
                    "Map",
                    address ? (
                        <a
                            className="text-blue-800 underline"
                            target="_blank"
                            rel="noreferrer"
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.latitude != null && a.longitude != null ? `${a.latitude},${a.longitude}` : address)}`}
                        >
                            Show map
                        </a>
                    ) : (
                        "Add an address to show the map"
                    ),
                ],
            ],
        },
        highlights: { title: "Highlights and past history", rows: [["Life story and important information", data.highlights]] },
    };
    const group = groups[sectionId];
    if (!group) return null;
    return (
        <section
            id={sectionId}
            className="mx-auto mt-6 max-w-4xl scroll-mt-24 rounded-xl border bg-white p-6"
        >
            <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-semibold">{group.title}</h2>
                <Link
                    className="text-blue-900 underline"
                    to={`/admin/clients/${id}/basic-info/edit`}
                >
                    Edit
                </Link>
            </div>
            <dl>
                {group.rows.map(([name, value]) => (
                    <div
                        key={name}
                        className="grid gap-3 border-b py-4 last:border-0 sm:grid-cols-2"
                    >
                        <dt className="font-medium">{name}</dt>
                        <dd className="whitespace-pre-wrap break-words leading-relaxed">{value || "Not recorded"}</dd>
                    </div>
                ))}
            </dl>
            {sectionId === "address" && data.addresses?.length > 1 && (
                <div className="border-t pt-4">
                    <h3 className="font-medium">Additional addresses</h3>
                    {data.addresses
                        .filter((x) => x.id !== a?.id)
                        .map((x, i) => (
                            <p
                                key={x.id || i}
                                className="mt-3"
                            >
                                {[x.addressLine1, x.addressLine2, x.city, x.county, x.postalCode, x.country].filter(Boolean).join(", ")}
                            </p>
                        ))}
                </div>
            )}
        </section>
    );
}
