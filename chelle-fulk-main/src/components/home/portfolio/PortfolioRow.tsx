import React from "react";

const images = [
  "/assets/portfolio/AC5_2910-adc (1).jpg",
  "/assets/portfolio/P1036264.jpg",
  "/assets/portfolio/20210613_161623338_iOS.jpg",
  "/assets/portfolio/AC5_1665.jpg"
];

const PortfolioRow: React.FC = () => (
  <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
    {images.map((src, i) => (
      <img key={i} src={src} alt={`Portfolio ${i + 1}`} style={{ width: '22%', borderRadius: '8px', objectFit: 'cover' }} />
    ))}
  </div>
);

export default PortfolioRow;
