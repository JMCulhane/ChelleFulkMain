import React from 'react';
import './HugContainer.scss';
import ScaleOnScroll from './ScaleOnScroll';
import PaddingWrapper from './PaddingWrapper';
import { MusicalNoteIcon } from '@heroicons/react/24/outline';

interface Props {
  image: string;
  knot: string;
}

const RightHuggingContainer: React.FC<Props> = ({ image, knot }) => (
  // <PaddingWrapper>
    <ScaleOnScroll>
      <div className="shift-left">
        <div className="flex flex-row-reverse items-center gap-8">
          <div className="relative knot-frame">
            <img src={knot} alt="Knotwork" className="knot-img" draggable={false} />
            <img src={image} alt="Nested Visual" className="right-nested-img" />
          </div>

          <div className="flex flex-col justify-center text-white font-fell max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl px-4">
          <p className="text-3xl text-yellow-400">2 Do Beatles</p>
          <p className="text-xl mt-1">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis a tristique tellus. Nulla facilisi. Vivamus et imperdiet tortor, sit amet feugiat lectus. Morbi laoreet erat vestibulum nibh vestibulum, vitae vestibulum orci aliquet. In vitae diam finibus, dapibus arcu quis, gravida neque. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nulla vulputate ipsum ac condimentum lobortis.
          </p>

            <div className="mt-3 space-y-1">
              <p className="flex justify-end items-center gap-2 text-right">
                <MusicalNoteIcon className="h-5 w-5 text-yellow-400" />
                Chelle Fulk & Robert Raines
              </p>
            </div>

            <div className="mt-4 self-end">
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-yellow-400/80 rounded-md px-4 py-2 text-white text-lg hover:bg-yellow-400"
              >
                Buy
              </a>
            </div>
          </div>
        </div>
      </div>
    </ScaleOnScroll>
  // </PaddingWrapper>
);

export default RightHuggingContainer;
