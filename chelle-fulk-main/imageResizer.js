// Folders
// reel is the folder from which pictures will be pulled in prod.
// reelTest is the folder where new images for testing sizing functionalities will be put.
// reelHeadliner is the folder which stores the main, starting image in the carousel.
// reelBase and headShotsBase are where images will be pulled from for resizing.

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

// Input and output directories (multiple)

const DIRS_CONFIG = [
  {
    input: path.join(__dirname, "public/assets/reelBase"),
    cropPosition: "center", // default crop
  },
  {
    input: path.join(__dirname, "public/assets/headShotsBase"),
    cropPosition: "top", // crop from top, shaves from bottom
  },
];
const OUTPUT_DIR = path.join(__dirname, "public/assets/reelTest");


// Target dimensions (force all images to this size)
const TARGET_WIDTH = 1784;  // change to whatever you want
const TARGET_HEIGHT = 1080; // change to whatever you want




(async () => {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  for (const { input: INPUT_DIR, cropPosition } of DIRS_CONFIG) {
    const files = fs.readdirSync(INPUT_DIR).filter((f) => /\.(jpe?g|png)$/i.test(f));
    for (const file of files) {
      const inputPath = path.join(INPUT_DIR, file);
      const outputPath = path.join(OUTPUT_DIR, file);
      await sharp(inputPath)
        .resize(TARGET_WIDTH, TARGET_HEIGHT, {
          fit: "cover",
          position: cropPosition,
        })
        .toFile(outputPath);
      console.log(`Resized ${file} from ${INPUT_DIR} -> ${TARGET_WIDTH}x${TARGET_HEIGHT} (position: ${cropPosition})`);
    }
    console.log(`All images in ${INPUT_DIR} resized to same dimensions with forced aspect ratio (position: ${cropPosition}).`);
  }
})();
