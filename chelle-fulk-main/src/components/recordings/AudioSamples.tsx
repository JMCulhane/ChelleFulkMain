import React, { useRef, useState } from 'react';
import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid';
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
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);

  const handlePlayPause = (index: number) => {
    if (playingIndex === index) {
      audioRefs.current[index]?.pause();
      setPlayingIndex(null);
    } else {
      if (playingIndex !== null && audioRefs.current[playingIndex]) {
        audioRefs.current[playingIndex]?.pause();
      }
      audioRefs.current[index]?.play();
      setPlayingIndex(index);
    }
  };

  const handleEnded = (index: number) => {
    if (playingIndex === index) setPlayingIndex(null);
  };

  if (samples.length === 0) return null;

  // Limit to four samples
  const limitedSamples = samples.slice(0, 4);

  return (
    <div className="scroll-container space-y-2">
      {limitedSamples.map((sample, index) => (
        <div
          key={index}
          className="flex items-center gap-3 p-2 bg-black/20 rounded-md hover:bg-black/30 transition-colors"
        >
          <button
            onClick={() => handlePlayPause(index)}
            className="flex items-center justify-center w-8 h-8 bg-yellow-400/20 rounded-full hover:bg-yellow-400/40 transition-colors flex-shrink-0"
            aria-label={playingIndex === index ? 'Pause sample' : 'Play sample'}
          >
            {playingIndex === index ? (
              <PauseIcon className="h-5 w-5 text-yellow-400" />
            ) : (
              <PlayIcon className="h-5 w-5 text-yellow-400" />
            )}
          </button>
          <span className="text-sm flex-grow">{sample.trackName}</span>
          {sample.audioUrl ? (
            sample.audioUrl.includes('embed.music.apple.com') ? (
              <iframe
                allow="autoplay *; encrypted-media *;"
                frameBorder="0"
                height="40"
                style={{ width: '100%', maxWidth: 200, borderRadius: 8 }}
                src={sample.audioUrl}
                title={sample.trackName}
              />
            ) : (
              <audio
                ref={el => { audioRefs.current[index] = el; }}
                src={sample.audioUrl}
                onEnded={() => handleEnded(index)}
                style={{ display: 'none' }}
              />
            )
          ) : (
            <div className="text-xs text-neutral-300">Sample unavailable</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AudioSamples;