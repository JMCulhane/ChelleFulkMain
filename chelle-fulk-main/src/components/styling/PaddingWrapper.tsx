import React from "react";

interface PaddingWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const PaddingWrapper: React.FC<PaddingWrapperProps> = ({ children, className = "" }) => {
  return (
    <div className={`p-4 sm:p-6 md:p-8 ${className}`}>
      {children}
    </div>
  );
};

export default PaddingWrapper;
