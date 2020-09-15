import React from 'react';

interface IKryssSVGProps {
  alt?: string;
  farge?: string;
}

const KryssSVG: React.FunctionComponent<IKryssSVGProps> = ({
  alt,
  farge = '#0067C5',
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="23"
    height="23"
    viewBox="0 0 23 23"
    fill="none"
  >
    {alt && <title>{alt}</title>}
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M22.5 11.5C22.5 17.574 17.574 22.5 11.5 22.5C5.424 22.5 0.5 17.574 0.5 11.5C0.5 5.424 5.424 0.5 11.5 0.5C17.574 0.5 22.5 5.424 22.5 11.5V11.5Z"
      stroke={farge}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15.7422 7.25781L7.2572 15.7418"
      stroke={farge}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15.7422 15.7422L7.2572 7.25818"
      stroke={farge}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default KryssSVG;
