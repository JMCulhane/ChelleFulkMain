import React from 'react';
import './HugContainer.scss';
import ScaleOnScroll from './ScaleOnScroll';
import { RecordingDTO } from '../../models/RecordingsDTO';
import AudioSamples from '../recordings/AudioSamples';
import RecordingContent from '../recordings/RecordingContent';

type Props = {
  image: string;
  knot: string;
  recording: RecordingDTO;
  alignLeftOffset?: number;
};

const RightHuggingContainer: React.FC<Props> = ({ image, knot, recording }) => {
  return (
    <ScaleOnScroll>
      <div className="shift-left">
        <div className="flex flex-row-reverse items-center gap-8">
          <div className="relative knot-frame">
            <img src={knot} alt="Knotwork" className="knot-img" draggable={false} />
            <img src={image} alt={recording.title} className="right-nested-img" />
          </div>

          <div className="flex flex-row gap-8">
            {recording.samples.length > 0 && (
              <div className="mt-2 samples-frame">
                <p className="text-lg font-fell text-yellow-400 mb-2">Listen to samples:</p>
                <AudioSamples samples={recording.samples} />
              </div>
            )}
            <RecordingContent recording={recording} />
          </div>
        </div>
      </div>
    </ScaleOnScroll>
  );
};

export default RightHuggingContainer;
