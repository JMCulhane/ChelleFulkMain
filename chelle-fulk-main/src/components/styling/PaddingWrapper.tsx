import React from "react";

interface PaddingWrapperProps {
  children: React.ReactNode;
  className?: string;
  basePadding?: string;
  smPadding?: string;
  mdPadding?: string;
}

const PaddingWrapper: React.FC<PaddingWrapperProps> = ({
  children,
  className = "",
  basePadding = "p-4",
  smPadding = "sm:p-6",
  mdPadding = "md:p-8",
}) => {
  return (
    <div className={`${basePadding} ${smPadding} ${mdPadding} ${className}`}>
      {children}
    </div>
  );
};

export default PaddingWrapper;
