import React from "react";
import useImagePreloader from "../../../hooks/Files/useImagePreloader";
import Spinner from "../../errors/Spinner";

// Hybrid layout: first row is a wide image (AC5_1665.jpg) and a tall image (AC5_2910-adc (1).jpg), second row is a grid of two other images
const images = [
  "/assets/portfolio/AC5_1665.jpg", // wide
  "/assets/portfolio/AC5_2910-adc (1).jpg", // tall
  "/assets/portfolio/P1180223.jpg", // extra
  "/assets/portfolio/AC5_3080-adc.jpg" // extra
];

const PortfolioRowGridHybrid: React.FC = () => {

  const imagesLoaded = useImagePreloader(images);
  
  if (!imagesLoaded) {
    return <Spinner fullScreen size={192} />;
  }

  return(
  <div style={{ marginTop: '2rem', width: '100%', paddingLeft: '4rem', paddingRight: '4rem' }}>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', height: '160px' }}>
      <img src={images[2]} alt="Portfolio grid 1" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
      <img src={images[3]} alt="Portfolio grid 2" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
    </div>
  </div>
  )
};

export default PortfolioRowGridHybrid;
