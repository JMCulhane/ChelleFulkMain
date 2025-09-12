import React, { useRef, useEffect, useState, useReducer } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { TrashIcon } from '@heroicons/react/24/solid';
import LeftHuggingContainer from '../styling/LeftHuggingContainer';
import RightHuggingContainer from '../styling/RightHuggingContainer';
import { RecordingDTO } from '../../models/RecordingsDTO';
import { getRecordings } from '../../services/apis/recordingService';
import Spinner from '../errors/Spinner';
import PaddingWrapper from '../styling/PaddingWrapper';
import RecordingForm, { initialState as recordingInitialState, reducer, ValidationErrors as RecordingValidationErrors } from '../forms/RecordingForm';


const leftKnot = '/assets/knotwork/leftHuggingKnotwork.png';
const rightKnot = '/assets/knotwork/rightHuggingKnotwork.png';

const Recordings: React.FC = () => {
  const leftKnotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rightKnotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, dispatch] = useReducer(reducer, recordingInitialState);
  const [errors, setErrors] = useState<RecordingValidationErrors>({});
  const { credentials } = useAdminAuth();
  const [recordings, setRecordings] = useState<RecordingDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <>
    <PaddingWrapper mdPadding="md:pt-12 md:p-8">
      <div className="px-6 pt-8 flex items-center justify-between">
        <h1 className="text-4xl font-fell border-b border-yellow-600 tracking-wider text-yellow-300">
          Recordings
        </h1>
      </div>
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
            const deleteButton = credentials ? (
              <button
                className="absolute top-2 left-2 z-10"
                title="Delete Recording"
                onClick={e => {
                  e.stopPropagation();
                  // TODO: Implement delete logic
                  alert('Delete recording ' + recording.title);
                }}
              >
                <TrashIcon className="h-5 w-5 text-yellow-400 mt-1" />
              </button>
            ) : null;

            if (isLeft) {
              return (
                <div key={index} ref={el => { leftKnotRefs.current[index] = el; }} className="relative">
                  <LeftHuggingContainer
                    image={recording.image}
                    knot={leftKnot}
                    recording={recording}
                    deleteButton={deleteButton}
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
                    deleteButton={deleteButton}
                  />
                </div>
              );
            }
          })
        )}
      </div>

      <div className="flex justify-center pt-20">
        {credentials && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded shadow-lg transition"
            aria-label="Add New Recording"
          >
            + Add New Recording
          </button>
        )}
      </div>

      {/* RecordingForm modal */}
      {isModalOpen && (
        <RecordingForm
          onClose={() => setIsModalOpen(false)}
          onCancel={() => {
            dispatch({ type: 'RESET' });
            setErrors({});
            setIsModalOpen(false);
          }}
          form={form}
          dispatch={dispatch}
          errors={errors}
          setErrors={setErrors}
        />
      )}
    </>
  );
}

export default Recordings;