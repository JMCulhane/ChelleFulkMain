import React from 'react';
import './HugContainer.scss';
import ScaleOnScroll from './ScaleOnScroll';
import { MusicalNoteIcon } from '@heroicons/react/24/outline';
import { RecordingDTO } from '../../models/RecordingsDTO';
import AudioSamples from '../recordings/AudioSamples';
import RecordingContent from '../recordings/RecordingContent';

interface Props {
  image: string;
  knot: string;
  recording: RecordingDTO;
  alignRightOffset?: number;
  deleteButton?: React.ReactNode;
}

const LeftHuggingContainer: React.FC<Props> = ({ image, knot, recording, alignRightOffset, deleteButton }) => {
  // Style adjustment to push samples rightwards aligning under right knot
  const samplesStyle = alignRightOffset
    ? { paddingRight: `${alignRightOffset}px` }
    : undefined;

  return (
    <ScaleOnScroll>
      <div className="shift-right">
        <div className="flex flex-row items-center gap-8">
          <div className="relative knot-frame">
            {deleteButton}
            <img src={knot} alt="Knotwork" className="knot-img" draggable={false} />
            <img src={image} alt={recording.title} className="left-nested-img" />
          </div>

          <div className="flex flex-row gap-8" style={samplesStyle}>
            <RecordingContent recording={recording} />

            {recording.samples.length > 0 && (
              <div className="mt-2 samples-frame">
                <p className="text-lg font-fell text-yellow-400 mb-2">Listen to samples:</p>
                <AudioSamples samples={recording.samples} />
              </div>
            )}
          </div>
        </div>
      </div>
    </ScaleOnScroll>
  );
};

export default LeftHuggingContainer;
