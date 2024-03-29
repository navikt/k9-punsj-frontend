import React from 'react';

interface ICheckSVGProps {
    title: React.ReactNode;
    className?: string;
}

const CheckSvg: React.FunctionComponent<ICheckSVGProps> = ({ title, className }) => (
    <svg width="28px" height="28px" viewBox="0 0 28 28" className={className} version="1.1">
        <title>{title}</title>
        <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
            <g fill="#06893A">
                <g>
                    <g>
                        <path d="M14,0 C6.28016667,0 0,6.28133333 0,14 C0,21.7186667 6.28016667,28 14,28 C21.7186667,28 28,21.7186667 28,14 C28,6.28133333 21.7186667,0 14,0 Z M20.2311667,10.3436667 L11.4811667,18.5103333 C11.3691667,18.6141667 11.2256667,18.6666667 11.0833333,18.6666667 C10.9328333,18.6666667 10.7846667,18.6095 10.6703333,18.4963333 L7.75366667,15.5796667 C7.52616667,15.3521667 7.52616667,14.9823333 7.75366667,14.7548333 C7.98116667,14.5273333 8.351,14.5273333 8.5785,14.7548333 L11.0961667,17.2725 L19.4343333,9.49083333 C19.6688333,9.2715 20.0386667,9.282 20.2591667,9.51766667 C20.4796667,9.75333333 20.4668333,10.1231667 20.2311667,10.3436667 Z" />
                    </g>
                </g>
            </g>
        </g>
    </svg>
);

export default CheckSvg;
