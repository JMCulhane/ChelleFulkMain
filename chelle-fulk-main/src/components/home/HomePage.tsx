import React, { useEffect } from "react";
import useImagePreloader from "../../hooks/Files/useImagePreloader";
import Spinner from "../errors/Spinner";
import PhotoReel from "./PhotoReel";
import Foreword from "./Foreword";
import Schedule from "./Schedule";
import Portfolio from "./Portfolio";
import { useLocation } from "react-router-dom";
import { waitForElement } from "../../services/utils/waitForElement";

// Collect all reel images once
const masterAlbum: string[] = require
  .context("../../../public/assets/reel", false, /\.(png|jpe?g|svg)$/)
  .keys()
  .map((key: string) =>
    require(`../../../public/assets/reel/${key.replace("./", "")}`)
  );

  let photoReel: string[] = [];

  // Use process.env.PUBLIC_URL to ensure proper path resolution in production
  const reelHeadLiner = `${process.env.PUBLIC_URL}/assets/reelHeadliner/P1310083.jpg`;
  const reelLength = 5;
  photoReel.push(reelHeadLiner);

  for(let i = 0; i<reelLength; i++) {
    const randomIndex = Math.floor(Math.random() * masterAlbum.length);
    // remove image from masterAlbum and add it to the reel
    const [selected] = masterAlbum.splice(randomIndex, 1);
    photoReel.push(selected);
  }

const HomePage: React.FC = () => {

const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollTo) {
      const scrollToElement = async () => {
        try {
          const el = await waitForElement(location.state.scrollTo);
          const yOffset = -80; // adjust for fixed header
          const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
        } catch (err) {
          console.warn(err);
        }
      };

      scrollToElement();
    }
  }, [location.state]);

  const imagesLoaded = useImagePreloader(photoReel);

  if (!imagesLoaded) {
    return <Spinner fullScreen size={192} />;
  }

  return (
    <>
      <PhotoReel reel={photoReel} />
      <Foreword />
      {/* Wrap Schedule in a section with id='schedule' for scroll targeting */}
      <section id="schedule">
        <Schedule />
      </section>
      <Portfolio />
    </>
  );
};

export default HomePage;
