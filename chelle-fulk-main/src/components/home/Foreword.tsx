import { JSX } from "react";
import styles from './Foreword.module.scss';
import Title from "../styling/Title";
import ScaleOnScroll from "../styling/ScaleOnScroll";

const keebler: string = "/assets/keebler.jpg";
const violin: string = "/assets/violin.webp";
const title: string = "Chelle Fulk";

const Foreword: React.FC = (): JSX.Element => {
  return (
    <div className="min-h-[60vh] pt-8 w-screen">
      <Title text={title} />
      <ScaleOnScroll>
        <div className="flex flex-col md:flex-row pt-2 mt-12 gap-y-6 md:gap-y-0">
          <div className="flex-1 flex justify-center">
            <img
              src={violin}
              className="max-h-64 object-contain md:-mt-6 md:ml-20"
            />
          </div>
          <div className="flex-[2] flex justify-center px-4">
            <p className="text-center max-w-xl text-white">
              Chelle Fulk, owner and Chief Visionary at Music by Anthem, is a versatile violinist, violist, and vocalist. Her talent and professionalism can be found on stage or in the studio with Celtic, jazz, pop and rock bands, classical string trios and quartets, ballroom dance ensembles and more. Besides playing fiddle and electric violin with her own Celtic band, Keltish, she performs with the Anthem Electric String Quartet, Christylez Bacon, the Wytold Ensemble, Coyote Run, the DanceTet, and several folk-dance groups. When not performing, she loves epic hiking and biking adventures all over the world. Sometimes the fiddle comes along for the ride.
            </p>
          </div>
          <div className="flex-1 flex justify-center">
            <img className={`${styles.clipDiagonal}`} src={keebler} />
          </div>
        </div>
      </ScaleOnScroll>
    </div>
  );
};

export default Foreword;
