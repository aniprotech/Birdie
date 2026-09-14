import React, { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { format } from "date-fns";
import { showError } from "../../utils/toaster";
import { getCleanFileName } from "../../utils/common";

const FileUploadField = ({ label = "", name, file, setFile, accept = "application/pdf,image/*", maxSizeMB = 12, error,description }) => {
    const inputRef = useRef();
    const [isDragging, setIsDragging] = useState(false);

    const handleFile = (selectedFile) => {
        if (selectedFile && selectedFile.size / (1024 * 1024) <= maxSizeMB) {
            setFile(selectedFile);
        } else {
            showError(`File must be less than ${maxSizeMB}MB`);
        }
    };

    const handleFileChange = (e) => {
        handleFile(e.target.files[0]);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        handleFile(droppedFile);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const removeFile = () => {
        setFile(null);
        inputRef.current.value = null;
    };

    return (
        <div className="space-y-2">
            {label && <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>}

            {!file && (
                <div
                    className={`flex cursor-pointer flex-col items-center justify-center space-y-2 rounded-md border border-dashed p-6 text-center transition-colors ${
                        isDragging ? "border-blue-500 bg-blue-50" : "border-gray-800"
                    }`}
                    onClick={() => inputRef.current.click()}
                    onDragOver={handleDragOver}
                    onDragEnter={() => setIsDragging(true)}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                >
                    <div className="rounded-full bg-gray-100 p-2">
                        <Upload className="h-4 w-4 text-gray-500" />
                    </div>

                    <button
                        type="button"
                        className="poppins-medium rounded border border-customNavy px-3 py-1 text-sm text-customNavy"
                    >
                        Upload file
                    </button>

                    <p className="text-sm text-gray-500">Or drop files to upload</p>
                    <p className="text-xs text-gray-400">Max size {maxSizeMB}MB</p>

                    <input
                        type="file"
                        name={name}
                        accept={accept}
                        onChange={handleFileChange}
                        ref={inputRef}
                        className="hidden"
                    />
                    {description && <p className="text-xs text-gray-500 italic">Note* : {description}</p>}
                </div>
            )}
            {error && <p className="text-xs text-red-500">{error}</p>}

            {file && (
                <div className="flex items-start justify-between rounded-md border bg-white p-4 shadow-sm">
                    <div>
                        <p className="break-all text-sm font-medium text-gray-800">{file?.name ? file.name : getCleanFileName(file)}</p>
                        <p className="mt-1 text-xs text-gray-500">Uploaded {format(new Date(), "PPP")}</p>
                    </div>
                    <button
                        type="button"
                        onClick={removeFile}
                        className="text-sm text-red-600 hover:underline"
                    >
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
};

export default FileUploadField;
