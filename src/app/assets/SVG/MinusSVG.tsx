import React from 'react';

interface IMinusSVG {
    alt: string;
}

const MinusSVG: React.FunctionComponent<IMinusSVG> = ({ alt }) => (
    <svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
        <title>{alt}</title>
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M22.5 11.5C22.5 17.574 17.574 22.5 11.5 22.5C5.424 22.5 0.5 17.574 0.5 11.5C0.5 5.424 5.424 0.5 11.5 0.5C17.574 0.5 22.5 5.424 22.5 11.5V11.5Z"
            stroke="#0067C5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path d="M17.5 11.5H5.5" stroke="#0067C5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export default MinusSVG;
