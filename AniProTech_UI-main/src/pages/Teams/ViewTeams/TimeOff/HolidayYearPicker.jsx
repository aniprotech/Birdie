import { useEffect, useRef, useState } from "react";
function yearRange(year, settings) {
    const month = settings?.month || 1,
        day = settings?.day || 1;
    const start = new Date(Date.UTC(year, month - 1, day)),
        end = new Date(Date.UTC(year + 1, month - 1, day) - 86400000);
    const format = (d) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(d);
    return format(start) + " – " + format(end);
}
export default function HolidayYearPicker({ year, onChange, settings, today, disabled }) {
    const current =
        Number(today.slice(0, 4)) -
        (today.slice(5) < String(settings?.month || 1).padStart(2, "0") + "-" + String(settings?.day || 1).padStart(2, "0") ? 1 : 0);
    const [open, setOpen] = useState(false),
        [older, setOlder] = useState(0),
        root = useRef(null),
        trigger = useRef(null);
    const years = [...new Set([year, ...Array.from({ length: 6 + older }, (_, i) => current + 1 - i)])]
        .filter((y) => y >= 1990 && y <= 2200)
        .sort((a, b) => b - a);
    useEffect(() => {
        if (!open) return;
        const close = (e) => {
            if (!root.current?.contains(e.target)) setOpen(false);
        };
        document.addEventListener("pointerdown", close);
        return () => document.removeEventListener("pointerdown", close);
    }, [open]);
    useEffect(() => {
        if (open) root.current?.querySelector('[aria-current="true"]')?.focus();
    }, [open]);
    const choose = (y) => {
        onChange(y);
        setOpen(false);
        trigger.current?.focus();
    };
    return (
        <div
            className="to-year-picker"
            ref={root}
            onKeyDown={(e) => {
                if (e.key === "Escape") {
                    setOpen(false);
                    trigger.current?.focus();
                }
                if (open && ["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) {
                    const buttons = [...root.current.querySelectorAll(".to-year-options button")];
                    const index = buttons.indexOf(document.activeElement);
                    const next =
                        e.key === "Home"
                            ? 0
                            : e.key === "End"
                              ? buttons.length - 1
                              : (index + (e.key === "ArrowDown" ? 1 : -1) + buttons.length) % buttons.length;
                    e.preventDefault();
                    buttons[next]?.focus();
                }
            }}
        >
            <button
                ref={trigger}
                type="button"
                aria-label="Holiday year"
                aria-expanded={open}
                aria-controls="holiday-year-options"
                disabled={disabled}
                onClick={() => setOpen((x) => !x)}
            >
                {yearRange(year, settings)} <span aria-hidden="true">▾</span>
            </button>
            {open && (
                <div
                    id="holiday-year-options"
                    className="to-year-menu"
                >
                    <div
                        className="to-year-options"
                        role="group"
                        aria-label="Choose holiday year"
                    >
                        {years.map((y) => (
                            <button
                                type="button"
                                key={y}
                                aria-current={y === year ? "true" : undefined}
                                onClick={() => choose(y)}
                            >
                                {yearRange(y, settings)}
                                {y === year && <span aria-hidden="true"> ✓</span>}
                            </button>
                        ))}
                    </div>
                    <div className="to-year-footer">
                        <button
                            type="button"
                            onClick={() => choose(current)}
                        >
                            Current holiday year
                        </button>
                        <button
                            type="button"
                            disabled={years.at(-1) <= 1990}
                            onClick={() => setOlder((x) => x + 5)}
                        >
                            Show older years
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

