import React, { useRef, useState, useEffect } from "react";
import NotificationSidebar from "../../../../components/Common/NotificationSidebar";
import ClientFeedDetails from "./FeedDetails";
import useScrollToTop from "../../../../hooks/useScrollToTop";
import { useClickOutside } from "../../../../hooks/use-click-outside";
import { Filter } from "lucide-react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { filterItems, noteOptions, renderActiveNotification } from "../../../../data/clients/clientFeedData";

const ClientCarerFeedIndex = () => {
    // --- state ---
    const [activeNotification, setActiveNotification] = useState("All");
    const [selectedNoteType, setSelectedNoteType] = useState(null);
    const [showDropdownDesktop, setShowDropdownDesktop] = useState(false);
    const [showDropdownMobile, setShowDropdownMobile] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

    const dropdownRef = useRef(null);
    const sidebarRef = useRef(null);
    const { id } = useParams();
    const navigate = useNavigate();
    const NoteComponent = selectedNoteType?.component || ClientFeedDetails;

    // sidebar badge counts
    const [notificationCounts] = useState(() => {
        const counts = {};
        filterItems?.forEach((i) => (counts[i.label] = i.count || 0));
        return counts;
    });

    useScrollToTop();

    // close dropdowns/sidebar on outside click
    useClickOutside([dropdownRef, sidebarRef], () => {
        setShowDropdownDesktop(false);
        setShowDropdownMobile(false);
        setMobileSidebarOpen(false);
    });

    // handle resize => mobile/desktop switch
    useEffect(() => {
        const onResize = () => {
            const desk = window.innerWidth >= 1024;
            setIsDesktop(desk);
            if (desk) {
                setMobileSidebarOpen(false);
                setShowDropdownMobile(false);
            } else {
                setShowDropdownDesktop(false);
            }
        };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    return (
        <div className="flex h-screen flex-col overflow-hidden bg-white lg:flex-row">
            {/* Mobile Topbar */}
            {!isDesktop && (
                <div className="flex items-center justify-between border-b bg-white p-4 lg:hidden">
                    {/* Filters toggle */}
                    <button
                        onClick={() => {
                            setShowDropdownMobile(false);
                            setMobileSidebarOpen((prev) => !prev);
                        }}
                        className={`flex items-center gap-2 rounded border px-4 py-2 text-xs md:text-sm ${mobileSidebarOpen ? "bg-gray-100" : "bg-white"}`}
                    >
                        <Filter className="h-4 w-4" /> Filters
                    </button>

                    {/* Mobile Add New */}
                    <div
                        ref={dropdownRef}
                        className="relative"
                    >
                        <button
                            onClick={() => {
                                setMobileSidebarOpen(false);
                                setShowDropdownMobile((prev) => !prev);
                                // setSelectedNoteType(null); // reset any existing
                            }}
                            className="flex items-center gap-1 rounded border border-customNavy bg-white px-4 py-2 text-xs hover:bg-gray-50 md:text-sm"
                        >
                            Add New <span>＋</span>
                        </button>
                        {showDropdownMobile && (
                            <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded border bg-white shadow">
                                <div className="divide-y divide-gray-200">
                                    {noteOptions?.slice(0, 2).map((opt, i) => (
                                        <div
                                            key={i}
                                            onClick={() => {
                                                setSelectedNoteType(opt);
                                                setShowDropdownMobile(false);
                                                setMobileSidebarOpen(false);
                                                navigate(`/admin/clients/${id}/client-feed/${opt.to}`);
                                            }}
                                            className="flex cursor-pointer items-center gap-2 px-4 py-2 hover:bg-gray-100"
                                        >
                                            {opt.icon}
                                            <span className="text-sm">{opt.label}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t px-4 py-2 text-xs font-semibold text-gray-500">Note types</div>
                                <div className="pb-2">
                                    {noteOptions?.slice(2).map((opt, i) => (
                                        <div
                                            key={i}
                                            onClick={() => {
                                                setSelectedNoteType(opt);
                                                setShowDropdownMobile(false);
                                                setMobileSidebarOpen(false);
                                                navigate(`/admin/clients/${id}/client-feed/${opt.to}`);
                                            }}
                                            className="flex cursor-pointer items-center gap-2 px-4 py-2 hover:bg-gray-100"
                                        >
                                            {opt.icon}
                                            <span className="text-sm">{opt.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Sidebar */}
            {(isDesktop || (!isDesktop && mobileSidebarOpen)) && (
                <div
                    ref={sidebarRef}
                    className={`w-full overflow-y-auto border-r lg:w-56 ${!isDesktop && !mobileSidebarOpen ? "hidden" : "block"}`}
                >
                    <NotificationSidebar
                        activeItem={activeNotification}
                        setActiveItem={(label) => {
                            setActiveNotification(label);
                            setSelectedNoteType(null);
                            setMobileSidebarOpen(false);
                            setShowDropdownMobile(false);
                        }}
                        notificationCounts={notificationCounts}
                    />
                </div>
            )}

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
                {/* Feed Panel */}
                <div
                    className={`w-full overflow-y-auto border-r bg-customCarerFeedBg lg:w-1/2 ${
                        !isDesktop && (showDropdownMobile || selectedNoteType) ? "hidden" : ""
                    }`}
                >
                    {isDesktop && (
                        <div
                            ref={dropdownRef}
                            className="relative flex justify-end border-b bg-white px-4 py-3.5"
                        >
                            <button
                                onClick={() => {
                                    setShowDropdownDesktop((prev) => !prev);
                                    // setSelectedNoteType(null);
                                }}
                                className="flex items-center gap-1 rounded border border-customNavy bg-white px-4 py-1.5 text-sm hover:bg-gray-50"
                            >
                                Add New <span>＋</span>
                            </button>
                            {showDropdownDesktop && (
                                <div className="absolute right-4 top-12 z-40 mt-2 w-60 overflow-hidden rounded border bg-white shadow">
                                    <div className="divide-y divide-gray-200">
                                        {noteOptions.slice(0, 2).map((opt, i) => (
                                            <div
                                                key={i}
                                                onClick={() => {
                                                    setSelectedNoteType(opt);
                                                    setShowDropdownDesktop(false);
                                                    navigate(`/admin/clients/${id}/client-feed/${opt.to}`);
                                                }}
                                                className="flex cursor-pointer items-center gap-2 px-4 py-2 hover:bg-gray-100"
                                            >
                                                {opt.icon}
                                                <span className="text-sm">{opt.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="border-t px-4 py-2 text-xs font-semibold text-gray-500">Note types</div>
                                    <div className="pb-2">
                                        {noteOptions.slice(2).map((opt, i) => (
                                            <div
                                                key={i}
                                                onClick={() => {
                                                    setSelectedNoteType(opt);
                                                    setShowDropdownDesktop(false);
                                                    navigate(`/admin/clients/${id}/client-feed/${opt.to}`);
                                                }}
                                                className="flex cursor-pointer items-center gap-2 px-4 py-2 hover:bg-gray-100"
                                            >
                                                {opt.icon}
                                                <span className="text-sm">{opt.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <div className="flex h-[90vh] items-center justify-center">{renderActiveNotification(activeNotification)}</div>
                </div>

                {/* Right Pane */}
                <div className="flex flex-1 flex-col overflow-y-auto">
                    {/* Right Content */}
                    <div className={`w-full overflow-y-auto ${!isDesktop && !selectedNoteType ? "hidden" : ""}`}>
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientCarerFeedIndex;
