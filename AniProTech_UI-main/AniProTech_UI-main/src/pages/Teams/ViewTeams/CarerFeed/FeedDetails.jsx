import React from "react";
import useScrollToTop from "../../../../hooks/useScrollToTop";

const FeedDetails = () => {
    useScrollToTop();
    return <div className="text-sm flex items-center justify-center h-screen">Select a card to see details.</div>;
};

export default FeedDetails;
