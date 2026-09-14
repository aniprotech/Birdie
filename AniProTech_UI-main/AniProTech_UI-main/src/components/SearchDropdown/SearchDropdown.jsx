import { Fragment, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Listbox, Transition } from "@headlessui/react";
import { Search } from "lucide-react";
import InnerLoader from "../Loader/InnerLoader";

const SearchDropdown = ({
    options,
    loading,
    query,
    onQueryChange,
    onOptionSelect,
    placeholder = "Search...",
    renderOption,
    showSupportText = true,
}) => {
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onQueryChange("");
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onQueryChange]);

    return (
        <Listbox onChange={onOptionSelect}>
            <div
                className="relative"
                ref={dropdownRef}
            >
                <div className="relative w-full">
                    <div className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm focus-within:ring-2 focus-within:ring-customBlue">
                        <Search className="ml-5 h-6 w-6 text-gray-400" />
                        <input
                            type="text"
                            className="w-full border-none bg-transparent p-2.5 text-sm focus:outline-none focus:ring-0"
                            placeholder={placeholder}
                            value={query}
                            onChange={(e) => onQueryChange(e.target.value)}
                        />
                    </div>
                </div>

                <Transition
                    as={Fragment}
                    show={query.length > 0}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <Listbox.Options
                        static
                        className="absolute z-10 mt-2 w-full overflow-hidden rounded-md bg-white text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                    >
                        {loading ? (
                            <div className="flex justify-center py-4">
                                <InnerLoader loading={loading} style={true} />
                            </div>
                        ) : (   
                            <>
                                <div className="max-h-60 overflow-auto py-1">
                                    {options.length === 0 ? (
                                        <div className="border-t border-gray-100 p-4">
                                            <h3 className="mb-1 text-base font-medium text-gray-900">
                                                Can&apos;t find what you&apos;re looking for?
                                            </h3>
                                            <p className="text-sm text-gray-600">Contact Birdie support</p>
                                        </div>
                                    ) : (
                                        options.map((option, index) => (
                                            <Listbox.Option
                                                key={option.id || index}
                                                value={option}
                                                className={({ active }) =>
                                                    `cursor-pointer select-none rounded-md px-4 py-4 ${
                                                        active ? "bg-customBlue/10 text-customBlue" : "text-gray-900"
                                                    }`
                                                }
                                            >
                                                {renderOption ? (
                                                    renderOption(option)
                                                ) : (
                                                    <span className="block truncate">{option.name || option.label}</span>
                                                )}
                                            </Listbox.Option>
                                        ))
                                    )}
                                </div>
                                {showSupportText && (
                                    <div className="border-t border-gray-100 p-4">
                                        <h3 className="mb-1 text-base font-medium text-gray-900">Can&apos;t find what you&apos;re looking for?</h3>
                                        <p className="text-sm text-gray-600">Contact Birdie support</p>
                                    </div>
                                )}
                            </>
                        )}
                    </Listbox.Options>
                </Transition>
            </div>
        </Listbox>
    );
};

SearchDropdown.propTypes = {
    options: PropTypes.arrayOf(PropTypes.object).isRequired,
    loading: PropTypes.bool.isRequired,
    query: PropTypes.string.isRequired,
    onQueryChange: PropTypes.func.isRequired,
    onOptionSelect: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    renderOption: PropTypes.func,
    showSupportText: PropTypes.bool,
};

export default SearchDropdown;
