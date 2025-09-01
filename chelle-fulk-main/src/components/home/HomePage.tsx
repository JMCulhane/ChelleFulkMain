import React from "react";
import useImagePreloader from "../../hooks/Files/useImagePreloader";
import Spinner from "../errors/Spinner";
import PhotoReel from "./PhotoReel";
import Foreword from "./Foreword";
import Schedule from "./Schedule";


// Collect all reel images once
const masterAlbum: string[] = require
  .context("../../../public/assets/reel", false, /\.(png|jpe?g|svg)$/)
  .keys()
  .map((key: string) =>
    require(`../../../public/assets/reel/${key.replace("./", "")}`)
  );

  let photoReel: string[] = [];

  const reelHeadLiner = '/assets/reelHeadliner/lashofs.jpg';
  const reelLength = 5;
  photoReel.push(reelHeadLiner);

  for(let i = 0; i<reelLength; i++) {
    const randomIndex = Math.floor(Math.random() * masterAlbum.length);

  // remove image from masterAlbum and add it to the reel
    const [selected] = masterAlbum.splice(randomIndex, 1);
    photoReel.push(selected);
  }


const HomePage: React.FC = () => {
  const imagesLoaded = useImagePreloader(photoReel);

  if (!imagesLoaded) {
    return <Spinner fullScreen size={192} />;
  }

  return (
    <>
      <PhotoReel reel={photoReel} />
      <Foreword />
      <Schedule />
    </>
  );
};

export default HomePage;
