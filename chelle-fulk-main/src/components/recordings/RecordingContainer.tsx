import React from "react";
import "../styling/HugContainer.scss";

interface RecordingContainerProps {
  image: React.ReactNode;
  recording: React.ReactNode;
  imageSide?: "left" | "right"; // default: left
}

export const RecordingContainer: React.FC<RecordingContainerProps> = ({
  image,
  recording,
  imageSide = "left",
}) => {
  return (
    <div className="recording-container">
      {imageSide === "left" ? (
        <>
          <div className="knot-frame">{image}</div>
          <div className="samples-frame">{recording}</div>
        </>
      ) : (
        <>
          <div className="samples-frame">{recording}</div>
          <div className="knot-frame">{image}</div>
        </>
      )}
    </div>
  );
};
