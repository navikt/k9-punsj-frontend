import React from 'react';

interface ICheckCircleSVGProps {
    title: React.ReactNode;
}

const CheckCircleSvg: React.FunctionComponent<ICheckCircleSVGProps> = ({ title }) => (
    <svg width="45" height="45" viewBox="0 0 45 45" fill="none" xmlns="http://www.w3.org/2000/svg">
        <title>{title}</title>
        <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
            <g fill="#06893A">
                <g>
                    <g>
                        <path
                            d="M22.5 0C10.0931 0 0 10.095 0 22.5C0 34.905 10.0931 45 22.5 45C34.905 45 45 34.905 45 22.5C45 10.095 34.905 0 22.5 0ZM32.5144 16.6238L18.4519 29.7488C18.2719 29.9156 18.0413 30 17.8125 30C17.5706 30 17.3325 29.9081 17.1488 29.7262L12.4612 25.0387C12.0956 24.6731 12.0956 24.0787 12.4612 23.7131C12.8269 23.3475 13.4212 23.3475 13.7869 23.7131L17.8331 27.7594L31.2337 15.2531C31.6106 14.9006 32.205 14.9175 32.5594 15.2963C32.9137 15.675 32.8931 16.2694 32.5144 16.6238Z"
                            fill="#06893A"
                        />
                    </g>
                </g>
            </g>
        </g>
    </svg>
);

export default CheckCircleSvg;
