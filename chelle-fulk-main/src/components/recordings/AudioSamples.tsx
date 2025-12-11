import React, { useState } from 'react';
import { PlayIcon, PauseIcon, TrashIcon } from '@heroicons/react/24/solid';
import { SampleDTO } from '../../models/RecordingsDTO';
import { deleteSample } from '../../services/apis/recordingService';
import './AudioSamples.scss';

type Props = {
  samples: SampleDTO[];
  albumId: string;
  recordingId: number;
  playingId: string | null;
  setPlayingId: (id: string | null) => void;
  audioRefs: React.MutableRefObject<{ [id: string]: HTMLAudioElement | null }>;
  isAdmin?: boolean;
  adminToken?: string;
  deleteProtectionEnabled?: boolean;
  onSampleDeleted?: (sampleId: number) => void;
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const AudioSamples: React.FC<Props> = ({ samples, albumId, recordingId, playingId, setPlayingId, audioRefs, isAdmin, adminToken, deleteProtectionEnabled = true, onSampleDeleted }) => {
  const [sampleToDelete, setSampleToDelete] = useState<SampleDTO | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (samples.length === 0) return null;

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

  const handleDeleteSample = async (sample: SampleDTO) => {
    if (!sample.id) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteSample(recordingId, sample.id, adminToken);
      onSampleDeleted?.(sample.id);
      setSampleToDelete(null);
    } catch (err: any) {
      setDeleteError('Failed to delete sample: ' + (err.message || 'Unknown error'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
    <div className="scroll-container space-y-2">
      {deleteError && (
        <div className="bg-red-700 text-white rounded px-3 py-2 text-sm mb-2">
          {deleteError}
        </div>
      )}
      {samples.map((sample, index) => {
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
            {isAdmin && sample.id && (
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  if (deleteProtectionEnabled) {
                    setSampleToDelete(sample);
                  } else {
                    await handleDeleteSample(sample);
                  }
                }}
                className="flex items-center justify-center w-6 h-6 hover:bg-yellow-600/30 rounded transition-colors flex-shrink-0"
                aria-label="Delete sample"
                disabled={deleting}
              >
                <TrashIcon className="h-4 w-4 text-yellow-400 hover:text-yellow-300" />
              </button>
            )}
          </div>
        );
      })}
    </div>

    {/* Delete Confirmation Modal */}
    {deleteProtectionEnabled && sampleToDelete && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
        <div className="bg-gray-900 rounded-lg shadow-lg p-8 max-w-md w-full text-center border border-yellow-400">
          <h2 className="text-xl text-yellow-300 mb-4 font-semibold">Confirm Delete</h2>
          <p className="text-white mb-6">Are you sure you want to delete sample <span className="font-bold">{sampleToDelete.trackName}</span>?</p>
          <div className="flex justify-center gap-6">
            <button
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-bold"
              disabled={deleting}
              onClick={() => handleDeleteSample(sampleToDelete)}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
            <button
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded font-bold"
              onClick={() => setSampleToDelete(null)}
              disabled={deleting}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default AudioSamples;