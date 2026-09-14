import React from "react";

const TaskPlanHeader = ({ clientName, onAddTask }) => {
    return (
        <div className="py-10">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="poppins-medium text-xl text-customTextGrey md:text-2xl">Manage {clientName}'s tasks</h2>
                    <p className="mt-2 text-sm text-customBlack1">Add tasks from a pre-set list to meet {clientName}'s care needs.</p>
                </div>
                <button
                    onClick={onAddTask}
                    className="flex items-center rounded bg-customDropdownBorder px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
                >
                    Add task
                </button>
            </div>
        </div>
    );
};

export default TaskPlanHeader;
