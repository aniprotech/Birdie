import React from 'react';
import PropTypes from 'prop-types';

const Button = ({ 
  children, 
  variant = "default", 
  className = "", 
  onClick,
  type = "button",
  ...props 
}) => {
  const baseStyles = "px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    default: "bg-customNavy text-white hover:bg-customNavy/90 focus:ring-customNavy/50",
    outline: "border border-customNavy text-customNavy hover:bg-customNavy/10 focus:ring-customNavy/50",
    ghost: "text-customNavy hover:bg-customNavy/10 focus:ring-customNavy/50",
    link: "text-customNavy underline-offset-4 hover:underline focus:ring-customNavy/50"
  };

  const variantStyle = variants[variant] || variants.default;

  return (
    <button
      type={type}
      className={`${baseStyles} ${variantStyle} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'outline', 'ghost', 'link']),
  className: PropTypes.string,
  onClick: PropTypes.func,
  type: PropTypes.string
};

export default Button; 