import React, { useRef, useLayoutEffect, useState, useReducer } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { TrashIcon } from '@heroicons/react/24/solid';
import LeftHuggingContainer from '../styling/LeftHuggingContainer';
import RightHuggingContainer from '../styling/RightHuggingContainer';
import { RecordingDTO } from '../../models/RecordingsDTO';
import PaddingWrapper from '../styling/PaddingWrapper';
import RecordingForm, { initialState as recordingInitialState, reducer, ValidationErrors as RecordingValidationErrors } from '../forms/RecordingForm';

const getRecordings = (r: __WebpackModuleApi.RequireContext): string[] =>
  r.keys().map((key: string): string => r(key) as string);

const recordingImages: string[] = getRecordings(
  require.context('../../../public/assets/recordings', false, /\.(png|jpe?g|svg)$/)
);

const leftKnot = '/assets/knotwork/leftHuggingKnotwork.png';
const rightKnot = '/assets/knotwork/rightHuggingKnotwork.png';

const mockedRecordings: RecordingDTO[] = [
  {
    image: recordingImages[0] || '/assets/recordings/default.jpg',
    title: '2 Do Beatles',
    description: "Chelle's instrumental Beatles Tribute Album.",
    yearPublished: 2006,
    performers: ['Chelle Fulk: Violin, Viola, Zeta 5-String Fiddle', 'Robert Raines: Guitars, Bass, Percussion'],
    trackCount: 12,
    link: 'Test',
    samples: [
      { trackName: 'Yesterday', audioUrl: '/assets/audio/2-do-beatles-yesterday.mp3', duration: 30 },
      { trackName: 'Hey Jude', audioUrl: '/assets/audio/2-do-beatles-hey-jude.mp3', duration: 45 },
      { trackName: 'Let It Be', audioUrl: '/assets/audio/2-do-beatles-let-it-be.mp3' },
      { trackName: 'Let It Be', audioUrl: '/assets/audio/2-do-beatles-let-it-be.mp3' },
      { trackName: 'Let It Be', audioUrl: '/assets/audio/2-do-beatles-let-it-be.mp3' },
      { trackName: 'Let It Be', audioUrl: '/assets/audio/2-do-beatles-let-it-be.mp3' },
      { trackName: 'Let It Be', audioUrl: '/assets/audio/2-do-beatles-let-it-be.mp3' }
    ]
  },
  ...recordingImages.slice(1).map((img, index) => ({
    image: img,
    title: `Album Title ${index + 2}`,
    description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
`,
    yearPublished: 2007 + index,
    performers: ['Various Artists'],
    trackCount: 10 + index,
    link: 'Test',
    samples: [
      { trackName: `Sample Track 1`, audioUrl: `/assets/audio/sample-${index + 2}-track1.mp3`, duration: 30 },
      { trackName: `Sample Track 2`, audioUrl: `/assets/audio/sample-${index + 2}-track2.mp3`, duration: 45 }
    ]
  }))
];

const Recordings: React.FC = () => {
  const leftKnotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rightKnotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, dispatch] = useReducer(reducer, recordingInitialState);
  const [errors, setErrors] = useState<RecordingValidationErrors>({});
  const { credentials } = useAdminAuth();

  return (
    <>
    <div className="relative z-10 pt-10 space-y-10">
      {mockedRecordings.map((recording, index) => {
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
      })}
    </div>

    <div className="flex justify-center pt-20">
      {/* Note the pt-20 padding provided above. This is implemented because the left and right hugging containers use classes involving transform. Transform css functions DO NOT AFFECT the document flow. So, even though the elements they affect visually appear elsewhere in the UI, the elements themselves are not updated within the document flow.
      
      The short of this is to say that sibling classes or elements of elements affected by transform classes will need some additional styling to appear in the appropriate visual locations. */}

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
};

export default Recordings;