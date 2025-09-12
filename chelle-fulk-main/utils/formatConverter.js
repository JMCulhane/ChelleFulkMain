const ffmpegPath = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
const fs = require('fs');
const path = require('path');



function convertWmaToMp3(
  outputDir = path.join(__dirname, '../public/assets/recordings/2doBeatles'),
  sourceDir = path.join(__dirname, '../public/assets/recordings/filesToFormat')
) {
  fs.readdirSync(sourceDir).forEach(file => {
    if (path.extname(file).toLowerCase() === '.aiff') {
      const inputPath = path.join(sourceDir, file);
      const outputFile = path.basename(file, '.aiff') + '.mp3';
      const outputPath = path.join(outputDir, outputFile);

      ffmpeg(inputPath)
        .toFormat('mp3')
        .on('end', () => console.log(`Converted: ${file} -> ${outputFile}`))
        .on('error', err => console.error(`Error converting ${file}:`, err))
        .save(outputPath);
    }
  });
}


module.exports = { convertWmaToMp3 };

// Run the converter with default directories when script is executed directly
if (require.main === module) {
  convertWmaToMp3();
}
