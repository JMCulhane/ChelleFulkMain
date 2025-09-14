import React from 'react';
import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid';
import { SampleDTO } from '../../models/RecordingsDTO';
import './AudioSamples.scss';

type Props = {
  samples: SampleDTO[];
  albumId: string;
  playingId: string | null;
  setPlayingId: (id: string | null) => void;
  audioRefs: React.MutableRefObject<{ [id: string]: HTMLAudioElement | null }>;
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const AudioSamples: React.FC<Props> = ({ samples, albumId, playingId, setPlayingId, audioRefs }) => {
  if (samples.length === 0) return null;
  const limitedSamples = samples.slice(0, 4);

  const handlePlayPause = (index: number) => {
    const id = `${albumId}-${index}`;
    if (playingId === id) {
      audioRefs.current[id]?.pause();
      setPlayingId(null);
    } else {
      if (playingId && audioRefs.current[playingId]) {
        audioRefs.current[playingId]?.pause();
      }
      audioRefs.current[id]?.play();
      setPlayingId(id);
    }
  };

  const handleEnded = (index: number) => {
    const id = `${albumId}-${index}`;
    if (playingId === id) setPlayingId(null);
  };

  return (
    <div className="scroll-container space-y-2">
      {limitedSamples.map((sample, index) => {
        const id = `${albumId}-${index}`;
        return (
          <div key={id} className="flex items-center gap-3 p-2 bg-black/20 rounded-md hover:bg-black/30 transition-colors">
            <button
              onClick={() => handlePlayPause(index)}
              className="flex items-center justify-center w-8 h-8 bg-yellow-400/20 rounded-full hover:bg-yellow-400/40 transition-colors flex-shrink-0"
              aria-label={playingId === id ? 'Pause sample' : 'Play sample'}
            >
              {playingId === id ? (
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
                  ref={el => { audioRefs.current[id] = el; }}
                  src={sample.audioUrl}
                  onEnded={() => handleEnded(index)}
                  style={{ display: 'none' }}
                />
              )
            ) : (
              <div className="text-xs text-neutral-300">Sample unavailable</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AudioSamples;