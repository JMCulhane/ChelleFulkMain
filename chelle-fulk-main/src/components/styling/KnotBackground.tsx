import React from 'react';
import './KnotBackground.scss';

const goldKnot = "/assets/knotwork/goldKnotWork1.png";

const KnotBackground: React.FC = () => {
  return (
    <div className="knot-container">
      <div className="knot-scroll">
        <img src={goldKnot} alt="Knotwork Decoration" className="knot-image" draggable={false} />
        <img src={goldKnot} alt="Knotwork Decoration" className="knot-image" draggable={false} />
      </div>
    </div>
  );
};

export default KnotBackground;
