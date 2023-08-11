import React from 'react';

interface IFeilCircleSVGProps {
    title: React.ReactNode;
}

const FeilCircleSvg: React.FunctionComponent<IFeilCircleSVGProps> = ({ title }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <title>{title}</title>
        <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
            <g transform="translate(-16.000000, -20.000000)">
                <g transform="translate(16.000000, 20.000000)">
                    <g strokeWidth="1" fillRule="evenodd" fill="#A13A28">
                        <path
                            d="M11.9989565,0 C5.39478261,0 0.0125217391,5.37182609 8.24610291e-16,11.976 C-0.00626086957,15.1815652 1.23547826,18.1972174 3.49773913,20.4688696 C5.76,22.7394783 8.77147826,23.9937391 11.9770435,24 L12,24 C18.6031304,24 23.9864348,18.6271304 24,12.021913 C24.0125217,5.40626087 18.6396522,0.0125217391 11.9989565,0 Z"
                            fillRule="nonzero"
                        />
                    </g>
                    <path
                        d="M12,10.6512393 L15.3719018,7.27933749 C15.7443518,6.9068875 16.3482125,6.9068875 16.7206625,7.27933749 C17.0931125,7.65178748 17.0931125,8.25564822 16.7206625,8.62809821 L13.3487607,12 L16.7206625,15.3719018 C17.0931125,15.7443518 17.0931125,16.3482125 16.7206625,16.7206625 C16.3482125,17.0931125 15.7443518,17.0931125 15.3719018,16.7206625 L12,13.3487607 L8.62809821,16.7206625 C8.25564822,17.0931125 7.65178748,17.0931125 7.27933749,16.7206625 C6.9068875,16.3482125 6.9068875,15.7443518 7.27933749,15.3719018 L10.6512393,12 L7.27933749,8.62809821 C6.9068875,8.25564822 6.9068875,7.65178748 7.27933749,7.27933749 C7.65178748,6.9068875 8.25564822,6.9068875 8.62809821,7.27933749 L12,10.6512393 Z"
                        fill="#FFFFFF"
                        fillRule="nonzero"
                    />
                </g>
            </g>
        </g>
    </svg>
);

export default FeilCircleSvg;
