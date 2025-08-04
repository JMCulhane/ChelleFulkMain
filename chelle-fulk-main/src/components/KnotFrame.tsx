import { JSX } from "react";
import styles from './KnotFrame.module.scss';

const celticKnotWorkFrame:string = '/assets/Knotwork.png';

const KnotFrame: React.FC = (): JSX.Element => {
    return (
        <div className={styles.knotFrame}>
            <img src={celticKnotWorkFrame} alt="Celtic Knotwork Frame"/>
        </div>
    );
};

export default KnotFrame;