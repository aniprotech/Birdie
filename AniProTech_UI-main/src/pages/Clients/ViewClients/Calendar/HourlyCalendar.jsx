import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { londonToday } from "../Visit/visit-demo";
import { positionVisits } from "./calendar-layout";
import "./hourly-calendar.css";
const names = { DRAFT: "Draft", SCHEDULED: "Scheduled", COMPLETED: "Completed", IN_PROGRESS: "In progress", CANCELLED: "Cancelled" };
const dayLabel = (d) => new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", weekday: "long", day: "numeric" }).format(new Date(d));
const nowMinutes = () => {
    const parts = Object.fromEntries(
        new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
            .formatToParts(new Date())
            .map((p) => [p.type, p.value]),
    );
    return Number(parts.hour) * 60 + Number(parts.minute);
};
export default function HourlyCalendar({ dates, visits, onSelect, selectedId }) {
    const scroll = useRef(null),
        [now, setNow] = useState(nowMinutes),
        week = dates[0];
    useEffect(() => {
        if (scroll.current) scroll.current.scrollTop = 6 * 48;
    }, [week]);
    useEffect(() => {
        const timer = setInterval(() => setNow(nowMinutes()), 60000);
        return () => clearInterval(timer);
    }, []);
    return (
        <>
            <div
                className="hc-legend"
                aria-label="Visit status legend"
            >
                {Object.entries(names).map(([key, name]) => (
                    <span key={key}>
                        <i className={"hc-" + key} />
                        {name}
                    </span>
                ))}
                <span>Scroll to view all 24 hours</span>
            </div>
            <div
                className="hc-scroll"
                ref={scroll}
                tabIndex={0}
                aria-label="Hourly weekly calendar"
            >
                <div className="hc-week">
                    <div className="hc-heading">
                        <span className="hc-corner">Time</span>
                        {dates.map((d) => (
                            <div
                                key={d}
                                className={d === londonToday() ? "hc-today" : ""}
                            >
                                {dayLabel(d)}
                            </div>
                        ))}
                    </div>
                    <div className="hc-body">
                        <div className="hc-times">
                            {Array.from({ length: 24 }, (_, h) => (
                                <span
                                    key={h}
                                    style={{ top: h * 48 }}
                                >
                                    {String(h).padStart(2, "0")}:00
                                </span>
                            ))}
                        </div>
                        {dates.map((d) => (
                            <div
                                key={d}
                                className="hc-day"
                                aria-label={dayLabel(d)}
                            >
                                {positionVisits(visits.filter((v) => v.date === d)).map((v) => (
                                    <button
                                        type="button"
                                        key={v.id}
                                        data-visit-id={v.id}
                                        className={`hc-event hc-${v.status}${selectedId === v.id ? "hc-selected" : ""}`}
                                        style={{
                                            top: v.start * 0.8,
                                            height: Math.max(12, (v.end - v.start) * 0.8 - 2),
                                            left: `calc(${(v.lane * 100) / v.columns}% + 2px)`,
                                            width: `calc(${100 / v.columns}% - 4px)`,
                                        }}
                                        aria-label={`${v.title}, ${d}, ${v.startTime} to ${v.endTime}, ${v.staffName || "Unassigned"}, ${names[v.status]}`}
                                        title={`${v.startTime} – ${v.endTime} · ${v.title}\n${v.staffName || "Unassigned"} · ${names[v.status]}`}
                                        onClick={() => onSelect(v)}
                                    >
                                        <span>{v.staffName || "Unassigned"}</span>
                                        {v.status === "COMPLETED" && (
                                            <Check
                                                size={13}
                                                aria-label="Completed"
                                            />
                                        )}
                                    </button>
                                ))}
                                {d === londonToday() && (
                                    <div
                                        className="hc-now"
                                        style={{ top: now * 0.8 }}
                                        aria-label="Current London time"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
