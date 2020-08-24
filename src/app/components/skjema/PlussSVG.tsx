import React from 'react';

interface IPlussSVGProps {
  alt: string;
}

const PlussSVG: React.FunctionComponent<IPlussSVGProps> = ({ alt }) => (
  <svg
    width="23"
    height="23"
    viewBox="0 0 23 23"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M22.5 11.5C22.5 17.574 17.575 22.5 11.5 22.5C5.425 22.5 0.5 17.574 0.5 11.5C0.5 5.424 5.425 0.5 11.5 0.5C17.575 0.5 22.5 5.424 22.5 11.5V11.5Z"
      stroke="#0067C5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11.5 5.5V17.5"
      stroke="#0067C5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17.5 11.5H5.5"
      stroke="#0067C5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default PlussSVG;
