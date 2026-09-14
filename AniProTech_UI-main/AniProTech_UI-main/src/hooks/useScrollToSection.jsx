import { useCallback } from "react";

const useScrollToSection = () => {
    return useCallback((sectionId) => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, []);
};

export default useScrollToSection;
