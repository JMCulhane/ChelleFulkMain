import React, { useRef, useEffect, useState, useReducer } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/solid';
import LeftHuggingContainer from '../styling/LeftHuggingContainer';
import RightHuggingContainer from '../styling/RightHuggingContainer';
import { RecordingDTO } from '../../models/RecordingsDTO';
import { getRecordings, deleteRecording } from '../../services/apis/recordingService';
import Spinner from '../errors/Spinner';
import PaddingWrapper from '../styling/PaddingWrapper';
import RecordingForm, { initialState as recordingInitialState, reducer, ValidationErrors as RecordingValidationErrors } from '../forms/RecordingForm';


const leftKnot = '/assets/knotwork/leftHuggingKnotwork.png';
const rightKnot = '/assets/knotwork/rightHuggingKnotwork.png';

const Recordings: React.FC = () => {
  const leftKnotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rightKnotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, dispatch] = useReducer(reducer, recordingInitialState);
  const [errors, setErrors] = useState<RecordingValidationErrors>({});
  const { credentials } = useAdminAuth();
  const [recordings, setRecordings] = useState<RecordingDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteProtectionEnabled, setDeleteProtectionEnabled] = useState(true);
  const [recordingToDelete, setRecordingToDelete] = useState<RecordingDTO | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [editId, setEditId] = useState<number | string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getRecordings()
      .then(data => {
        if (!cancelled) setRecordings(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        if (!cancelled) setError(err.message || 'Failed to load recordings');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Global audio state and refs for cross-album control
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRefs = useRef<{ [id: string]: HTMLAudioElement | null }>({});

  return (
    <>
    <PaddingWrapper mdPadding="md:pt-12 md:p-8">
      <div className="px-6 pt-8 flex items-center justify-between">
        <h1 className="text-4xl font-fell mb-6 border-b border-yellow-600 pb-2 tracking-wider text-yellow-300">
          Recordings
        </h1>
        {credentials && (
          <button
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-fell font-bold px-6 py-2 rounded shadow"
            onClick={() => {
              setEditMode(false);
              dispatch({ type: 'RESET' });
              setErrors({});
              setIsModalOpen(true);
            }}
          >
            Add New Recording
          </button>
        )}
      </div>

      {/* Admin Delete Protection Toggle */}
      {credentials && (
        <div className="px-6 pb-2 flex items-center gap-4">
          <label className="flex items-center cursor-pointer select-none">
            <span className="mr-2 text-yellow-300 font-semibold">Delete Protection</span>
            <input
              type="checkbox"
              checked={deleteProtectionEnabled}
              onChange={() => setDeleteProtectionEnabled(v => !v)}
              className="form-checkbox h-5 w-5 text-yellow-400 border-yellow-600 focus:ring-yellow-500"
            />
            <span className="ml-2 text-sm text-gray-300">{deleteProtectionEnabled ? 'ON' : 'OFF'}</span>
          </label>
        </div>
      )}

      {/* Delete Error Message */}
      {deleteError && (
        <div className="px-6 pb-2">
          <div className="bg-red-700 text-white rounded px-4 py-2 mb-4">
            {deleteError}
          </div>
        </div>
      )}
    </PaddingWrapper>
      <div className="relative z-10">
        {loading ? (
          <div className="flex justify-center items-center min-h-[20vh]">
            <Spinner size={64} />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center py-8">{error}</div>
        ) : (
          recordings.map((recording, index) => {
            const isLeft = index % 2 === 0;
            const adminButtons = credentials ? (
              <>
                {/* Edit Button */}
                <button
                  className="absolute top-2 right-2 z-10 bg-yellow-400 hover:bg-yellow-500 rounded-full p-2 transition-colors"
                  title="Edit Recording"
                  onClick={e => {
                    e.stopPropagation();
                    setEditMode(true);
                    setEditId(recording.id);
                    // Populate form with recording data
                    dispatch({ type: 'RESET' });
                    dispatch({ type: 'SET_FIELD', field: 'title', value: recording.title });
                    dispatch({ type: 'SET_FIELD', field: 'image', value: recording.image });
                    if (recording.yearPublished) dispatch({ type: 'SET_FIELD', field: 'yearPublished', value: recording.yearPublished });
                    dispatch({ type: 'SET_FIELD', field: 'description', value: recording.description });
                    dispatch({ type: 'SET_FIELD', field: 'trackCount', value: recording.trackCount });
                    dispatch({ type: 'SET_FIELD', field: 'link', value: recording.link });
                    // Set performers
                    recording.performers.forEach((performer, idx) => {
                      if (idx === 0) dispatch({ type: 'SET_PERFORMER', index: 0, value: performer });
                      else {
                        dispatch({ type: 'ADD_PERFORMER' });
                        dispatch({ type: 'SET_PERFORMER', index: idx, value: performer });
                      }
                    });
                    // Set samples
                    recording.samples.forEach((sample, idx) => {
                      if (idx === 0) {
                        dispatch({ type: 'SET_SAMPLE_FIELD', index: 0, field: 'trackName', value: sample.trackName });
                        dispatch({ type: 'SET_SAMPLE_FIELD', index: 0, field: 'audioUrl', value: sample.audioUrl });
                      } else {
                        dispatch({ type: 'ADD_SAMPLE' });
                        dispatch({ type: 'SET_SAMPLE_FIELD', index: idx, field: 'trackName', value: sample.trackName });
                        dispatch({ type: 'SET_SAMPLE_FIELD', index: idx, field: 'audioUrl', value: sample.audioUrl });
                      }
                    });
                    setErrors({});
                    setIsModalOpen(true);
                  }}
                  tabIndex={-1}
                >
                  <PencilIcon className="h-4 w-4 text-black" />
                </button>
                {/* Delete Button */}
                <button
                  className="absolute top-2 left-2 z-10"
                  title="Delete Recording"
                  onClick={async e => {
                    e.stopPropagation();
                    if (deleteProtectionEnabled) {
                      setRecordingToDelete(recording);
                    } else {
                      setDeleting(true);
                      try {
                        await deleteRecording(recording.id, credentials?.token);
                        setRecordings(recordings => recordings.filter(r => r.id !== recording.id));
                        setDeleteError(null);
                      } catch (err: any) {
                        setDeleteError('Failed to delete recording: ' + (err.message || 'Unknown error'));
                      } finally {
                        setDeleting(false);
                      }
                    }
                  }}
                  tabIndex={-1}
                >
                  <TrashIcon className="h-5 w-5 text-yellow-400 mt-1" />
                </button>
              </>
            ) : null;

            if (isLeft) {
              return (
                <div key={index} ref={el => { leftKnotRefs.current[index] = el; }} className="relative">
                  <LeftHuggingContainer
                    image={recording.image}
                    knot={leftKnot}
                    recording={recording}
                    deleteButton={adminButtons}
                    playingId={playingId}
                    setPlayingId={setPlayingId}
                    audioRefs={audioRefs}
                  />
                </div>
              );
            } else {
              return (
                <div key={index} ref={el => { rightKnotRefs.current[index] = el; }} className="relative">
                  <RightHuggingContainer
                    image={recording.image}
                    knot={rightKnot}
                    recording={recording}
                    deleteButton={adminButtons}
                    playingId={playingId}
                    setPlayingId={setPlayingId}
                    audioRefs={audioRefs}
                  />
                </div>
              );
            }
          })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteProtectionEnabled && recordingToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-gray-900 rounded-lg shadow-lg p-8 max-w-md w-full text-center border border-yellow-400">
            <h2 className="text-xl text-yellow-300 mb-4 font-semibold">Confirm Delete</h2>
            <p className="text-white mb-6">Are you sure you want to delete <span className="font-bold">{recordingToDelete.title}</span>?</p>
            <div className="flex justify-center gap-6">
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-bold"
                disabled={deleting}
                onClick={async () => {
                  setDeleting(true);
                  try {
                    await deleteRecording(recordingToDelete.id, credentials?.token);
                    setRecordings(recordings => recordings.filter(r => r.id !== recordingToDelete.id));
                    setDeleteError(null);
                    setRecordingToDelete(null);
                  } catch (err: any) {
                    setDeleteError('Failed to delete recording: ' + (err.message || 'Unknown error'));
                  } finally {
                    setDeleting(false);
                  }
                }}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button
                className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded font-bold border border-yellow-600"
                disabled={deleting}
                onClick={() => setRecordingToDelete(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RecordingForm modal */}
      {isModalOpen && (
        <RecordingForm
          onClose={async () => {
            setIsModalOpen(false);
            setEditMode(false);
            setEditId(null);
            // Refresh recordings after successful add/update
            try {
              const backendRecordings = await getRecordings();
              setRecordings(Array.isArray(backendRecordings) ? backendRecordings : []);
            } catch (err) {
              console.error('Failed to refresh recordings:', err);
            }
          }}
          onCancel={() => {
            dispatch({ type: 'RESET' });
            setErrors({});
            setIsModalOpen(false);
            setEditMode(false);
            setEditId(null);
          }}
          form={form}
          dispatch={dispatch}
          errors={errors}
          setErrors={setErrors}
          editMode={editMode}
          editId={editId ?? undefined}
        />
      )}
    </>
  );
}

export default Recordings;