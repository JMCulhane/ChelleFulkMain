const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

// Input and output directories
const INPUT_DIR = path.join(__dirname, "public/assets/reel");
const OUTPUT_DIR = path.join(__dirname, "public/assets/reelBase");

// Target dimensions (force all images to this size)
const TARGET_WIDTH = 1920;  // change to whatever you want
const TARGET_HEIGHT = 1080; // change to whatever you want

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const files = fs.readdirSync(INPUT_DIR).filter((f) => /\.(jpe?g|png)$/i.test(f));

(async () => {
  for (const file of files) {
    const inputPath = path.join(INPUT_DIR, file);
    const outputPath = path.join(OUTPUT_DIR, file);

    await sharp(inputPath)
      .resize(TARGET_WIDTH, TARGET_HEIGHT, {
        fit: "fill",  // force the image to fill the box, ignoring original aspect ratio
      })
      .toFile(outputPath);

    console.log(`Resized ${file} -> ${TARGET_WIDTH}x${TARGET_HEIGHT}`);
  }

  console.log("All images resized to same dimensions with forced aspect ratio.");
})();
