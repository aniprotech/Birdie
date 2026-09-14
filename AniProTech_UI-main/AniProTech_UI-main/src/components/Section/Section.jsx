import { SquarePen } from "lucide-react";
import { useNavigationHelpers } from "../../hooks/useNavigationHelpers";
import LabelValueRow from "../../pages/Teams/ViewTeams/Onboarding/Edit/LabelValueRow";

const Section = ({ title, rows, data }) => {
    const { navigate, id } = useNavigationHelpers();
   
    return (
        <div className="mb-6">
            <div className="mb-4 flex items-center justify-between text-base md:text-xl">
                <h2 className="py-2 text-xl poppins-medium text-customTextColor">{title}</h2>
                <button
                    className="text-customTextNavy border border-customTextNavy px-3 py-1 rounded flex items-center text-base font-medium hover:underline "
                    onClick={() => {
                        navigate(`/admin/teams/${id}/onboarding/edit`, {
                            state: { data },
                        });
                    }}
                >
                    <SquarePen className="mr-1 h-4 w-4" />
                    Edit
                </button>
            </div>

            <div className="divide-y divide-customBorder border border-customBorder rounded-md overflow-hidden">
                {rows.map((row, index) => (
                    <LabelValueRow key={index} {...row} />
                ))}
            </div>
        </div>
    );
};

export default Section;
