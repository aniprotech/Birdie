import PropTypes from 'prop-types';
import ClientTable from "./ClientTable";
import { statusForClients } from "../../constants";

const ClientFilterControls = ({
    isActive,
    setIsActive,
    handleCreate,
    data,
    setData,
    mode,
    setMode,
    setActiveComponent,
    loading,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalCount,
    setSearchTerm,
    searchTerm
}) => {
    return (
        <>
            {/* Top Filters + Create Button */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                {/* Status Toggle */}
                <div className="flex max-w-full items-center gap-6 overflow-x-auto">
                    {statusForClients?.map((status, index) => (
                        <label 
                            key={index}
                            className="flex items-center gap-2 text-sm font-medium text-customTextGrey hover:cursor-pointer"
                        >
                            <input
                                type="checkbox"
                                className="h-4 w-4 cursor-pointer rounded border border-gray-300 checked:accent-cyan-600 focus:outline-none"
                                checked={isActive === status.value}
                                onChange={() => setIsActive(status.value)}
                            />
                            {status.label}
                        </label>
                    ))}
                </div>

                {/* Create Button */}
                <button
                    className="border border-customTextGrey px-4 py-2 text-sm font-semibold text-customTextGrey transition hover:bg-blue-50"
                    onClick={handleCreate}
                >
                    Create New Client
                </button>
            </div>

            {/* Client Table */}
            <ClientTable
                data={data}
                setData={setData}
                mode={mode}
                setMode={setMode}
                setActiveComponent={setActiveComponent}
                loading={loading}
                page={page}
                setPage={setPage}
                pageSize={pageSize}
                setPageSize={setPageSize}
                totalCount={totalCount}
                setSearchTerm={setSearchTerm}
                searchTerm={searchTerm}
            />
        </>
    );
};

ClientFilterControls.propTypes = {
    isActive: PropTypes.bool.isRequired,
    setIsActive: PropTypes.func.isRequired,
    handleCreate: PropTypes.func.isRequired,
    data: PropTypes.array.isRequired,
    setData: PropTypes.func.isRequired,
    mode: PropTypes.string.isRequired,
    setMode: PropTypes.func.isRequired,
    setActiveComponent: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    page: PropTypes.number.isRequired,
    setPage: PropTypes.func.isRequired,
    pageSize: PropTypes.number.isRequired,
    setPageSize: PropTypes.func.isRequired,
    totalCount: PropTypes.number.isRequired,
    setSearchTerm: PropTypes.func.isRequired,
    searchTerm: PropTypes.string.isRequired
};

export default ClientFilterControls;
