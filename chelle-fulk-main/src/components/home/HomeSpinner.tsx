import React from "react";

const Spinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-48 w-48 border-8 border-black border-t-yellow-400"></div>
    </div>
  );
};

export default Spinner;
