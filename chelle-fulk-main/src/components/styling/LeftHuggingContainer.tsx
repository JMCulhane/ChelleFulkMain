import React from 'react';
import './HugContainer.scss';
import ScaleOnScroll from './ScaleOnScroll';
import PaddingWrapper from './PaddingWrapper';
import { MusicalNoteIcon } from '@heroicons/react/24/outline';

interface Props {
  image: string;
  knot: string;
}

const LeftHuggingContainer: React.FC<Props> = ({ image, knot }) => (
  // <PaddingWrapper>
  <ScaleOnScroll>
    <div className="shift-right">
      <div className="flex flex-row items-center gap-8">
        <div className="relative knot-frame">
          <img src={knot} alt="Knotwork" className="knot-img" draggable={false} />
          <img src={image} alt="Nested Visual" className="left-nested-img" />
        </div>

        <div className="flex flex-col justify-center text-white font-fell max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl px-4">
          <p className="text-3xl text-yellow-400">2 Do Beatles (2006)</p>
          <p className="text-xl mt-1">
            Chelle's instrumental Beatles Tribute Album. Violins, guitar, bass, percussion.
          </p>

          <div className="mt-3 space-y-1">
            <p className="flex items-start gap-2">
              <MusicalNoteIcon className="h-5 w-5 text-yellow-400 mt-1" />
              <span>
                Chelle Fulk: Violin, Viola, Zeta 5-String Fiddle<br />
                Robert Raines: Guitars, Bass, Percussion
              </span>
            </p>
          </div>

          <div className="mt-4">
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

export default LeftHuggingContainer;
