# Main Website
- This is the redesign of Chelle Fulk's main website.

- To run the application, simply clone the repo, run npm i, and then npm run start.

# imageResizer.js
- You'll notice in the base of this repository a file titled 'imageResizer.js'. When importing images for the photoreel, there was an issue in which the images were not being formatted properly, leading to a worse UX with the Carousel. The Carousel might stop slightly longer on an image and then jerk suddenly to the next. This was due to the next image in the Carousel being resized before appearing in the view. 

- The imageResizer.js file was created to account for this, formatting all images to a certain size at the cost of distortion. This decision was made because the 'distorted' images prevent the aforementioned bugs and, frankly, don't look distorted. When adding images to the Carousel, it is a good idea to run them through the resizer first. This is a two-step process:

1. Add the images you want to the 'reel' folder under the public/assets folder path.
2. Run the imageResizer.js with node imageResizer.js. (You will need to download node, if you haven't already).

- And there you go. Good to go on the resized images.