import PropTypes from "prop-types";

const StickyNav = ({ sections, activeComponent }) => {
    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            const headerOffset = 120;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth",
            });
        }
    };

    // Find the current tab label
    const findTabLabel = () => {
        const TABS = [
            { label: "Personal Identity", value: "ClientsInfoSection" },
            { label: "Clinical Details", value: "EditClinicalDetails" },
            { label: "Key Contacts", value: "EditClientKeyContact" },
            { label: "Future Planning", value: "EditFuturePlanning" },
            { label: "Agency Admin", value: "EditClientAgencyAdmin" },
        ];
        const currentTab = TABS?.find((tab) => tab.value === activeComponent);
        return currentTab ? currentTab.label : "";
    };

    return (
        <div className="sticky top-24 ml-4 hidden max-h-[calc(100vh-120px)] w-64 self-start overflow-y-auto rounded-md border border-gray-200 bg-white lg:block">
            <div className="p-3">
                <h3 className="mb-3 border-b pb-2 text-sm font-medium text-gray-900">{findTabLabel()}</h3>
                <nav className="space-y-1">
                    {sections.map(({ id, label }) => (
                        <button
                            key={id}
                            onClick={() => scrollToSection(id)}
                            className="w-full rounded-md px-3 py-2 text-left text-sm text-gray-600 transition-colors duration-150 hover:bg-gray-50"
                        >
                            {label}
                        </button>
                    ))}
                </nav>
            </div>
        </div>
    );
};

StickyNav.propTypes = {
    sections: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
        }),
    ).isRequired,
    activeComponent: PropTypes.string.isRequired,
};

export default StickyNav;
