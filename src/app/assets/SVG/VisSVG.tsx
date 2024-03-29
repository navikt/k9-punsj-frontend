import React from 'react';

interface IVisSVGProps {
    title: React.ReactNode;
}

const VisSvg: React.FunctionComponent<IVisSVGProps> = ({ title }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <title>{title}</title>
        <g stroke="none" strokeWidth="1" fill="#0067C5" fillRule="evenodd">
            <g fill="#06893A">
                <g>
                    <g>
                        <path
                            d="M12 5C16.4183 5 20.4183 7.33333 24 12C20.4183 16.6667 16.4183 19 12 19C7.58172 19 3.58172 16.6667 0 12C3.58172 7.33333 7.58172 5 12 5ZM17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12ZM12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                            fill="#0067C5"
                        />
                    </g>
                </g>
            </g>
        </g>
    </svg>
);

export default VisSvg;
