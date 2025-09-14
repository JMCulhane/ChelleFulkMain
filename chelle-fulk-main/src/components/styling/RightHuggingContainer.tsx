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
  deleteButton?: React.ReactNode;
  playingId: string | null;
  setPlayingId: (id: string | null) => void;
  audioRefs: React.MutableRefObject<{ [id: string]: HTMLAudioElement | null }>;
};

const RightHuggingContainer: React.FC<Props> = ({ image, knot, recording, deleteButton, playingId, setPlayingId, audioRefs }) => {
  // Global audio control is now managed by parent

  return (
    <ScaleOnScroll>
      <div className="shift-right">
        <div className="flex flex-row items-center gap-8">
          <div className="flex flex-row gap-8">
            {recording.samples.length > 0 && (
              <div className="mt-2 samples-frame">
                <p className="text-lg font-fell text-yellow-400 mb-2">Listen to samples:</p>
                {/* Global audio control props must be provided by parent */}
                <AudioSamples
                  samples={recording.samples}
                  albumId={recording.title}
                  playingId={playingId}
                  setPlayingId={setPlayingId}
                  audioRefs={audioRefs}
                />
              </div>
            )}
          </div>
          <div>
            <RecordingContent recording={recording} />
          </div>
          <div className="relative knot-frame">
            {deleteButton}
            <img src={knot} alt="Knotwork" className="knot-img" draggable={false} />
            <img src={image} alt={recording.title} className="right-nested-img" />
          </div>
        </div>
      </div>
    </ScaleOnScroll>
  );
};

export default RightHuggingContainer;
