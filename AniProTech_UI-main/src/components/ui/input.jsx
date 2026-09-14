import React from 'react';
import PropTypes from 'prop-types';

const Input = React.forwardRef(({ 
  className = "",
  type = "text",
  ...props
}, ref) => {
  return (
    <input
      type={type}
      className={`
        flex h-10 w-full rounded-md border border-customBorder/40
        bg-background px-3 py-2 text-sm 
        placeholder:text-customTextGrey
        focus-visible:outline-none focus-visible:ring-2 
        focus-visible:ring-customDropdownBorder/20
        disabled:cursor-not-allowed disabled:opacity-50
        ${className}
      `}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = "Input";

Input.propTypes = {
  className: PropTypes.string,
  type: PropTypes.string
};

export default Input; 