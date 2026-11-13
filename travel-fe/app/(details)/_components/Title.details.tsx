import React from "react";

interface Props {
  title: string;
}
const Title = ({ title }: Props) => {
  return (
    <h1 className="font-bold text-[2.5rem] text-dark max-sm:mb-0 md:-mb-4">
      {title}
    </h1>
  );
};

export default Title;
