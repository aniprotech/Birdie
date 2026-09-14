import React from 'react';
import PropTypes from 'prop-types';

const Textarea = React.forwardRef(({ 
  className = "",
  ...props
}, ref) => {
  return (
    <textarea
      className={`
        flex min-h-[80px] w-full rounded-md border border-customBorder/40
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

Textarea.displayName = "Textarea";

Textarea.propTypes = {
  className: PropTypes.string
};

export default Textarea; 