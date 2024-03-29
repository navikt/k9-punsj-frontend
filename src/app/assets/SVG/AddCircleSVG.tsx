import React from 'react';

interface IAddCircleSVGProps {
    title: React.ReactNode;
}

const AddCircleSvg: React.FunctionComponent<IAddCircleSVGProps> = ({ title }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <title>{title}</title>
        <g stroke="none" strokeWidth="1" fill="#0067C5" fillRule="evenodd">
            <g fill="#06893A">
                <g>
                    <g>
                        <path
                            d="M12 0C18.6274 0 24 5.37258 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0ZM12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM13 6V11H18V13H13V18H11V13H6V11H11V6H13Z"
                            fill="#0067C5"
                        />
                    </g>
                </g>
            </g>
        </g>
    </svg>
);

export default AddCircleSvg;
