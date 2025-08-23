import React from 'react';
import { MusicalNoteIcon } from '@heroicons/react/24/outline';
import { RecordingDTO } from '../../models/RecordingsDTO';

interface Props {
  recording: RecordingDTO;
}

const RecordingsContent: React.FC<Props> = ({ recording }) => {
  return (
  <div className="w-[45vw] mx-auto flex flex-col justify-center text-white font-fell px-4">
      <p className="text-3xl text-yellow-400">
        {recording.title} ({recording.yearPublished})
      </p>
      <p className="text-xl mt-1">
        {recording.description}
      </p>

      <div className="mt-3 space-y-1">
        <p className="flex items-start gap-2">
          <MusicalNoteIcon className="h-5 w-5 text-yellow-400 mt-1" />
          <span>
            {recording.performers.map((performer, index) => (
              <React.Fragment key={index}>
                {performer}
                {index < recording.performers.length - 1 && <br />}
              </React.Fragment>
            ))}
          </span>
        </p>
      </div>

      <div className="mt-6">
        <a
          href={recording.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-yellow-400/80 rounded-md px-4 py-2 text-white text-lg hover:bg-yellow-400 transition-colors"
        >
          Buy Album
        </a>
      </div>
    </div>
  );
};

export default RecordingsContent;
