import { FC } from "react";

interface TitleProps {
  text: string;
}

const Title: FC<TitleProps> = ({ text }: TitleProps) => {
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-6xl sm:text-7xl text-center font-fell text-yellow-400">
        {text}
      </h1>
    </div>
  );
};

export default Title;
