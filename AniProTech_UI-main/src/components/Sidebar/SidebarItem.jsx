import { useState, useRef, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { SidebarContext } from "./Sidebar";
import DownloadInfoModal from "../DownloadInfoModal";

export function SidebarItem({ icon, text, alert, to }) {
    const { expanded } = useContext(SidebarContext);
    const isDownloadInfo = text === "Download Info";
    const location = useLocation();
    const isActive = location.pathname === to || location.pathname.startsWith(to);
    const itemRef = useRef(null);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0, visible: false });
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleMouseEnter = () => {
        if (itemRef.current) {
            const rect = itemRef.current.getBoundingClientRect();
            setTooltipPosition({
                top: rect.top + rect.height / 2,
                left: rect.right + 8,
                visible: true,
            });
        }
    };

    const handleMouseLeave = () => {
        setTooltipPosition((prev) => ({ ...prev, visible: false }));
    };

    const handleClick = (e) => {
        if (isDownloadInfo) {
            e.preventDefault();
            setIsModalOpen(true);
        }
    };

    return (
        <>
            {isDownloadInfo ? (
                <button
                    onClick={handleClick}
                    className="poppins-medium group relative mb-5 flex w-full cursor-pointer items-center rounded-md border border-customBorder px-4 py-3 text-sm font-semibold text-customDefaultTextColor transition-all hover:bg-gray-50"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    ref={itemRef}
                    aria-label={text}
                >
                    <div className="shrink-0 text-customDefaultTextColor">{icon}</div>
                    <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${expanded ? "w-auto opacity-100" : "w-0 opacity-0"}`}>
                        {text}
                    </span>
                </button>
            ) : (
                <Link
                    to={to}
                    className={`poppins-medium group relative flex cursor-pointer items-center text-sm transition-all ${
                        isActive
                            ? "rounded-md border-l-4 border-customNavy bg-customCarerFeedBg px-3 py-3 text-customNavy"
                            : "text-customDefaultTextColor rounded-md border-l-4 border-transparent px-3 py-3 hover:rounded-l-md hover:border-customNavy hover:bg-customCarerFeedBg"
                    }`}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    ref={itemRef}
                    aria-label={text}
                >
                    <div className={`shrink-0 ${isActive ? "text-customNavy" : "text-customDefaultTextColor"}`}>{icon}</div>
                    <span className={`ml-3 whitespace-nowrap transition-all duration-300 ${expanded ? "w-auto opacity-100" : "w-0 opacity-0"}`}>
                        {text}
                    </span>
                    {alert && <div className={`absolute right-2 h-2 w-2 rounded-full bg-indigo-500 ${expanded ? "" : "top-2"}`} />}
                </Link>
            )}

            {!expanded && tooltipPosition.visible && (
                <div
                    className="pointer-events-none fixed z-[9999] whitespace-nowrap rounded-md bg-gray-800 px-3 py-1 text-sm text-white shadow-md transition-opacity duration-200"
                    style={{
                        top: `${tooltipPosition.top}px`,
                        left: `${tooltipPosition.left}px`,
                        transform: "translateY(-50%)",
                        opacity: 1,
                    }}
                >
                    {text}
                </div>
            )}

            {isDownloadInfo && (
                <DownloadInfoModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    clientName="David"
                    onDownload={() => {
                        // Handle PDF download logic
                        setIsModalOpen(false);
                    }}
                />
            )}
        </>
    );
}
