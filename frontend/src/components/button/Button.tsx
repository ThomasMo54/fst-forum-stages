import React from 'react';
import { Link } from 'react-router-dom';
import './Button.css';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'link';
type ButtonSize = 'normal' | 'small';

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;

  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;

  to?: string;
  href?: string;
}

const Button: React.FC<ButtonProps> = ({
 children,
 variant = 'primary',
 size = 'normal',
 className = '',
 onClick,
 type = 'button',
 disabled = false,
 to,
 href,
 ...rest
}) => {

  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = size === 'small' ? 'btn-small' : '';
  const combinedClasses = `${baseClass} ${variantClass} ${sizeClass} ${className}`.trim();

  if (to) {
    return (
      <Link to={to} className={combinedClasses} {...rest}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={combinedClasses} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={combinedClasses}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;