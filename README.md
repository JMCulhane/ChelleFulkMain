
# Main Website

This repository contains the redesign of Chelle Fulk's main website.

## Running the Application

1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Start the application with `npm run start`.

## imageResizer.js

In the root of the `chelle-fulk-main` folder, you'll find a file named `imageResizer.js`. This script was created to address an issue with the photoreel images: unformatted images caused the Carousel to pause or jerk unexpectedly, as images were being resized on the fly.

The `imageResizer.js` script formats all images to a consistent size, which prevents these issues. While this may introduce some distortion, it is minimal and results in a smoother user experience.

**How to use:**

1. Add the images you want to the `reel` folder under `public/assets`.
2. Run the script with `node imageResizer.js` (ensure Node.js is installed).

Your images will now be properly resized and ready for use in the Carousel via the reelBase folder under 'public/assets'.