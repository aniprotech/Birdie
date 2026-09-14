import { Link as LinkIcon } from "lucide-react";
import { formatDisplayName, getCleanFileName } from "../../../../../utils/common";

const LabelValueRow = ({ label, value, isFile, isEnum }) => (
    <div className="poppins-medium grid grid-cols-2 items-center bg-white px-4 py-3.5 text-sm ">
        <div className="text-customDefaultTextColor">{label}</div>
        <div className="flex items-center gap-2 break-words text-customTextGrey1">
            {isFile && value ? (
                <>
                    <a
                        href={value}
                        download={getCleanFileName(value)} // force filename
                        className="underline"
                    >
                        {getCleanFileName(value) || "-"}
                    </a>
                    <LinkIcon className="h-4 w-4" />
                </>
            ) : isEnum ? (
                formatDisplayName(value)
            ) : (
                value || "-"
            )}
        </div>
    </div>
);

export default LabelValueRow;
