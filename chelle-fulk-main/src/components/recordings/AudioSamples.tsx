import React, { useState } from 'react';
import { PlayIcon, PauseIcon } from '@heroicons/react/24/outline';
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
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

  const handlePlayPause = (audioUrl: string) => {
    const audioElements = document.querySelectorAll('audio');
    
    if (currentlyPlaying === audioUrl) {
      const currentAudio = document.querySelector(`audio[src="${audioUrl}"]`) as HTMLAudioElement;
      currentAudio?.pause();
      setCurrentlyPlaying(null);
    } else {
      audioElements.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
      
      const newAudio = document.querySelector(`audio[src="${audioUrl}"]`) as HTMLAudioElement;
      newAudio?.play();
      setCurrentlyPlaying(audioUrl);
    }
  };

  if (samples.length === 0) return null;

  return (
    <div className="scroll-container space-y-2">
      {samples.map((sample, index) => (
        <div 
          key={index} 
          className="flex items-center gap-3 p-2 bg-black/20 rounded-md hover:bg-black/30 transition-colors"
        >
          <button
            onClick={() => handlePlayPause(sample.audioUrl)}
            className="flex items-center justify-center w-8 h-8 bg-yellow-400/20 rounded-full hover:bg-yellow-400/40 transition-colors flex-shrink-0"
          >
            {currentlyPlaying === sample.audioUrl ? (
              <PauseIcon className="h-4 w-4 text-yellow-400" />
            ) : (
              <PlayIcon className="h-4 w-4 text-yellow-400 ml-0.5" />
            )}
          </button>
          <span className="text-sm flex-grow">{sample.trackName}</span>
          {sample.duration && (
            <span className="text-xs text-gray-400">
              {formatTime(sample.duration)}
            </span>
          )}
          <audio
            src={sample.audioUrl}
            onEnded={() => setCurrentlyPlaying(null)}
            onPause={() => setCurrentlyPlaying(null)}
          />
        </div>
      ))}
    </div>
  );
};

export default AudioSamples;
