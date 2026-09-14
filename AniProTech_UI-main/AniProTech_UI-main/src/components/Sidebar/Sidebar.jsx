import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { createContext, useEffect, useState } from "react";
import { getInitials } from "../../utils/common";
import { useLocation } from "react-router-dom";

export const SidebarContext = createContext();

export default function Sidebar({ children, data }) {
    const location = useLocation();
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia("(min-width: 1024px)");

        const isCarerFeedPage = /^\/admin\/teams\/[^/]+\/carer-feed/.test(location.pathname);
        const isCalendarPage = /^\/admin\/teams\/[^/]+\/calendar/.test(location.pathname);
        const isClientCarerFeedPage = /^\/admin\/clients\/[^/]+\/client-feed/.test(location.pathname);

        if (isCarerFeedPage || isCalendarPage || isClientCarerFeedPage) {
            setExpanded(false);
        } else {
            setExpanded(mediaQuery.matches);
        }

        const handler = (e) => {
            if (!isCarerFeedPage || !isCalendarPage || !isClientCarerFeedPage) {
                setExpanded(e.matches);
            }
        };

        mediaQuery.addEventListener("change", handler);

        return () => mediaQuery.removeEventListener("change", handler);
    }, [location]);

    return (
        <aside
            className={`sticky top-0 z-10 flex h-screen flex-col self-start border-r bg-white shadow-sm transition-all duration-300 ${
                expanded ? "w-64" : "w-20"
            }`}
        >
            <nav className="flex h-full flex-col">
                {/* Top Toggle Button */}
                <div className="flex items-center justify-center border-b px-3 py-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm text-customTextGrey">
                        {getInitials(data?.firstName, data?.lastName)}
                    </div>
                    <div
                        className={`flex items-center justify-between overflow-hidden transition-all duration-300 ${
                            expanded ? "ml-3 w-40 max-w-full" : "w-0"
                        }`}
                        title={`${data?.firstName ? data?.firstName + " " + data?.lastName : "-"} ${data?.email ? "| " + data?.email : ""}`}
                    >
                        <div className="w-full max-w-full leading-4">
                            <h4 className="truncate whitespace-nowrap text-sm font-semibold">
                                {data?.firstName ? `${data?.firstName} ${data?.lastName}` : "-"}
                            </h4>
                            <span className="block truncate whitespace-nowrap text-xs text-gray-600">{data?.email || ""}</span>
                        </div>
                    </div>
                </div>

                {/* Sidebar Items */}
                <SidebarContext.Provider value={{ expanded }}>
                    <ul className="custom-scrollbar my-3 flex-1 space-y-2 overflow-y-auto overflow-x-hidden px-3">{children}</ul>
                </SidebarContext.Provider>

                {/* Footer Toggle */}
                <div className="flex items-center justify-between border-t p-4 pb-2">
                    {expanded && <p className="hidden lg:block" />}
                    <button
                        onClick={() => setExpanded((curr) => !curr)}
                        className="rounded-lg bg-gray-100 p-1.5 hover:bg-customHoverGrey"
                        aria-label={expanded ? "Collapse Sidebar" : "Expand Sidebar"}
                    >
                        {expanded ? <ChevronsLeft /> : <ChevronsRight />}
                    </button>
                </div>
            </nav>
        </aside>
    );
}
