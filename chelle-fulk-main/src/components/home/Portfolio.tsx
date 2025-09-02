import React from "react";
import PortfolioRow from "./portfolio/PortfolioRow";
import PortfolioRowGridHybrid from "./portfolio/PortfolioRowGridHybrid";
import ScaleOnScroll from "../styling/ScaleOnScroll";

const Portfolio: React.FC = () => (
  <div style={{ marginTop: '3rem', paddingTop: '2rem' }}>
    <ScaleOnScroll>
      <PortfolioRow />
    </ScaleOnScroll>
    <ScaleOnScroll>
      <PortfolioRowGridHybrid />
    </ScaleOnScroll>
  </div>
);

export default Portfolio;
