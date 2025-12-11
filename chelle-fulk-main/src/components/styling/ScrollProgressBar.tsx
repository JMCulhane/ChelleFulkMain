import React, { useEffect, useRef, useState } from "react";
import Foreword from "../home/Foreword";
import Schedule from "../home/Schedule";
import Portfolio from "../home/Portfolio";

const sectionsData = [
  { id: "section1", marker: "Summary", top: "10%" },
  { id: "section2", marker: "Schedule", top: "45%" },
  { id: "section3", marker: "Portfolio", top: "80%" },
];



const ScrollProgressBar: React.FC = () => {
  const [active, setActive] = useState(sectionsData[0].id);
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      let current = "";
      sectionRefs.current.forEach((section, idx) => {
        if (!section) return;
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= sectionTop - sectionHeight / 3) {
          current = sectionsData[idx].id;
        }
      });
      if (current) setActive(current);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMarkerClick = (id: string, idx: number) => {
    sectionRefs.current[idx]?.scrollIntoView({ behavior: "smooth" });
  };

  // Calculate gold circle position as a percentage of scroll progress between first and last section
  const [circleTop, setCircleTop] = useState(sectionsData[0].top);

  useEffect(() => {
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollY = window.scrollY;
      // Get the top positions in px for each section
      const sectionTops = sectionRefs.current.map(ref => ref ? ref.offsetTop : 0);
      // If not all refs are set, fallback to default
      if (sectionTops.length !== sectionsData.length) return;
      // Calculate the min and max scroll positions for the bar
      const min = sectionTops[0];
      const max = sectionTops[sectionTops.length - 1];
      // Clamp scrollY between min and max
      const clampedY = Math.max(min, Math.min(scrollY, max));
      // Calculate progress (0 to 1)
      const progress = (clampedY - min) / (max - min);
      // Interpolate between first and last top percent
      const firstTop = parseFloat(sectionsData[0].top);
      const lastTop = parseFloat(sectionsData[sectionsData.length - 1].top);
      const topPercent = firstTop + (lastTop - firstTop) * progress;
      setCircleTop(`${topPercent}%`);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [showVertical, setShowVertical] = useState(false);

  useEffect(() => {
    const handleScrollBarSwitch = () => {
        if (sectionRefs.current[0]) {
        const firstSectionTop = sectionRefs.current[0].offsetTop;
        if (window.scrollY >= firstSectionTop - 10) {
          setShowVertical(true);
        } else {
          setShowVertical(false);
        }
      }
    };
    window.addEventListener("scroll", handleScrollBarSwitch, { passive: true });
    handleScrollBarSwitch();
    return () => window.removeEventListener("scroll", handleScrollBarSwitch);
  }, []);

  return (
    <div className="font-sans">
      {/* Horizontal bar before first section */}
      {/* Animated transition for marker buttons */}
      <div className="relative w-full" style={{ height: showVertical ? '100vh' : 'auto' }}>
        {sectionsData.map((section, idx) => {
          const transition = 'all 0.6s cubic-bezier(0.4,0,0.2,1)';
            const horizontalLeft = 0; // flush left
          const verticalLeft = 80; // px from left for vertical bar
          const horizontalTop = 40; // px from top for horizontal bar
          const verticalTops = ["10%", "35%", "60%"];
          const isVertical = showVertical;
          const left = isVertical ? verticalLeft : horizontalLeft + idx * 180;
          const top = isVertical ? verticalTops[idx] : horizontalTop;
          return (
            <button
              key={section.id}
              type="button"
              className={`fixed z-30 px-6 py-3 border-2 flex items-center justify-center text-lg font-bold font-fell transition-colors duration-300
                ${active === section.id ? "bg-black border-yellow-400 text-yellow-400 shadow-lg" : "bg-black border-white text-white"}
                hover:bg-yellow-400 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400`}
              style={{
                left,
                top,
                transition,
                transform: isVertical ? 'translateX(0) translateY(0)' : 'translateY(0)',
              }}
              onClick={() => handleMarkerClick(section.id, idx)}
            >
              {section.marker}
            </button>
          );
        })}
        {/* Vertical line only when vertical */}
        {showVertical && (
          <div className="fixed top-0 left-20 h-full w-1 bg-black z-10" />
        )}
      </div>
      {/* Main Content */}
      <main className="ml-40 w-full">
        <section id="section1" ref={el => { sectionRefs.current[0] = el; }} className="flex justify-center items-center text-3xl">
          <Foreword />
        </section>
        <section id="section2" ref={el => { sectionRefs.current[1] = el; }} className="flex justify-center items-center text-3xl">
          <Schedule />
        </section>
        <section id="section3" ref={el => { sectionRefs.current[2] = el; }} className="flex justify-center items-center text-3xl">
          <Portfolio />
        </section>
      </main>
    </div>
  );
};

export default ScrollProgressBar;
