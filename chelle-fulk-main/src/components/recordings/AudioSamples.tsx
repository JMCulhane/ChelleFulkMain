import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { SampleDTO } from '../../models/RecordingsDTO';
import './AudioSamples.scss';

interface Props {
  samples: SampleDTO[];
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const AudioSamples: React.FC<Props> = ({ samples }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  if (samples.length === 0) return null;

  return (
    <div className="scroll-container space-y-2">
      {samples.map((sample, index) => (
        <div
          key={index}
          className="flex flex-col gap-1 p-2 bg-black/20 rounded-md hover:bg-black/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleToggle(index)}
              className="flex items-center justify-center w-8 h-8 bg-yellow-400/20 rounded-full hover:bg-yellow-400/40 transition-colors flex-shrink-0"
              aria-label={openIndex === index ? 'Collapse sample' : 'Expand sample'}
            >
              {openIndex === index ? (
                <ChevronUpIcon className="h-4 w-4 text-yellow-400" />
              ) : (
                <ChevronDownIcon className="h-4 w-4 text-yellow-400 ml-0.5" />
              )}
            </button>
            <span className="text-sm flex-grow">{sample.trackName}</span>
          </div>
          {/* Show embedded player when expanded */}
          {openIndex === index && (
            <div className="w-full flex justify-center mt-2">
              {sample.audioUrl ? (
                sample.audioUrl.includes('embed.music.apple.com') ? (
                  <iframe
                    allow="autoplay *; encrypted-media *;"
                    frameBorder="0"
                    height="150"
                    style={{ width: '100%', maxWidth: 400, borderRadius: 8 }}
                    src={sample.audioUrl}
                    title={sample.trackName}
                  />
                ) : (
                  <audio
                    src={sample.audioUrl}
                    controls
                    className="w-full"
                  />
                )
              ) : (
                <div className="text-xs text-neutral-300">Sample details unavailable.</div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AudioSamples;
