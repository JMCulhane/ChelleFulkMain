
import React from "react";

interface SpinnerProps {
  size?: number; // px size for width/height
  fullScreen?: boolean; // center in viewport
  centered?: boolean; // center in parent
  className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 48, fullScreen = false, centered = false, className = "" }) => {
  const spinnerStyle = {
    width: size,
    height: size,
    minWidth: size,
    minHeight: size,
  };
  const spinner = (
    <div
      className={`animate-spin rounded-full border-8 border-black border-t-yellow-400 ${className}`.trim()}
      style={spinnerStyle}
    />
  );
  if (fullScreen) {
    return (
      <div className="flex items-center justify-center h-screen">
        {spinner}
      </div>
    );
  }
  if (centered) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[10rem]">
        {spinner}
      </div>
    );
  }
  return spinner;
};

export default Spinner;
