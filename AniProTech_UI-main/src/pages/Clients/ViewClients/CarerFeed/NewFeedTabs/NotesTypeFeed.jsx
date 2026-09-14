import { Newspaper } from "lucide-react";
import React, { useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { useNavigate, useParams } from "react-router-dom";

const ClientNotesTypeFeed = ({
    noteLabel = "Complaint",
    titleLabel = "Title",
    titleDescription = "complaint",
    detailsLabel = "Further details",
    detailsDescription = "Include dates, times and witnesses where possible",
    onCancel,
    onSave,
    to,
}) => {
    const [title, setTitle] = useState("");
    const [details, setDetails] = useState("");
    const maxLength = 50;

    const { id } = useParams();
    const navigate = useNavigate();

    const modules = {
        toolbar: [[{ header: [1, 2, 3, 4, 5, 6, false] }], ["bold", "italic"], [{ list: "ordered" }, { list: "bullet" }]],
    };

    const titleProgress = (title.length / maxLength) * 100;
    const isTitleValid = title.trim().length > 0;

    return (
        <div className="flex h-dvh flex-col bg-white">
            {/* Scrollable content area */}
            <div className="px-6 py-4">
                {/* Note Label */}
                <span className="mb-6 inline-flex items-center rounded-full border border-customNavy/50 bg-customCarerFeedBg px-3 py-1 text-sm font-semibold text-customTextGrey">
                    <Newspaper
                        size={15}
                        className="mr-1"
                    />{" "}
                    {noteLabel}
                </span>

                {/* Title Input */}
                <label className="mb-1 block text-base font-semibold text-customTextGrey">
                    {titleLabel} <span className="text-customRed">*</span>
                </label>
                <p className="mt-2 text-sm text-customGrey">{`Describe the subject of the ${titleDescription}`}</p>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value.slice(0, maxLength))}
                    maxLength={maxLength}
                    className="mb-1 w-full rounded border border-gray-300 px-3 py-2.5 text-sm focus:outline-none"
                    placeholder="Enter title"
                />
                {/* Progress Bar */}
                <div className="mb-1 mt-0.5 h-1 w-full rounded-full bg-gray-200">
                    <div
                        className="h-full rounded-full bg-customDropdownBorder transition-all duration-300"
                        style={{ width: `${titleProgress}%` }}
                    />
                </div>
                <p className="mb-5 text-right text-xs text-customGrey">
                    {title.length}/{maxLength}
                </p>

                {/* Details Editor */}
                <label className="mb-1 block text-base font-semibold text-customTextGrey">
                    {detailsLabel} <span className="text-sm text-customGrey">(optional)</span>
                </label>
                <p className="mb-2 text-sm text-customGrey">{detailsDescription}</p>

                <div className="mb-6 rounded-md">
                    <ReactQuill
                        value={details}
                        onChange={setDetails}
                        placeholder="Start typing your note..."
                        modules={modules}
                        className="custom-quill-editor focus:outline-none"
                    />
                </div>
            </div>

            {/* Sticky Footer Buttons */}
            <div className="border-t bg-white px-6 py-4">
                <div className="flex items-center gap-5 text-sm font-semibold">
                    <button
                        onClick={() => {
                            navigate(`/admin/teams/${id}/carer-feed`);
                        }}
                        className="rounded border border-gray-300 px-4 py-1.5 text-customTextGrey hover:bg-customBgGrey"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={!isTitleValid}
                        onClick={() => onSave({ title, details })}
                        className={`rounded px-4 py-1.5 text-white ${
                            isTitleValid ? "bg-customDropdownBorder hover:bg-customDropdownBorder/80" : "cursor-not-allowed bg-gray-300"
                        }`}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClientNotesTypeFeed;
