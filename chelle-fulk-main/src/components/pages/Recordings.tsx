import React from 'react';
import LeftHuggingContainer from '../styling/LeftHuggingContainer';
import RightHuggingContainer from '../styling/RightHuggingContainer';
import { RecordingDTO } from '../../models/RecordingsDTO';

const getRecordings = (r: __WebpackModuleApi.RequireContext): string[] =>
  r.keys().map((key: string): string => r(key) as string);

const recordingImages: string[] = getRecordings(
  require.context('../../../public/assets/recordings', false, /\.(png|jpe?g|svg)$/)
);

const leftKnot = '/assets/knotwork/leftHuggingKnotwork.png';
const rightKnot = '/assets/knotwork/rightHuggingKnotwork.png';

const mockedRecordings: RecordingDTO[] = recordingImages.map((img, index) => ({
  image: img,
  title: `Mock Album Title ${index + 1}`,
  yearPublished: 2000 + index,
  performers: ['Alice - vocals', 'Bob - fiddle', 'Charlie - flute'],
  trackCount: 10 + index,
  link: 'Test'
}));

const Recordings: React.FC = () => {
  return (
    <div className="relative z-10 pt-10 space-y-10">
      {recordingImages.map((img, index) => {
        const isLeft = index % 2 === 0;

        const Container = isLeft ? LeftHuggingContainer : RightHuggingContainer;
        const knot = isLeft ? leftKnot : rightKnot;

        return (
          <Container key={index} image={img} knot={knot} />
        );
      })}
    </div>
  );
};

export default Recordings;
