import React from 'react';

interface IBinSVGProps {
    title: React.ReactNode;
}

const BinSvg: React.FunctionComponent<IBinSVGProps> = ({ title }) => (
    <svg width="24" height="24" viewBox="0 0 22 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <title>{title}</title>
        <g stroke="none" strokeWidth="1" fill="#C30000" fillRule="evenodd">
            <g fill="#06893A">
                <g>
                    <g>
                        <path
                            d="M12 0C14.4189 0 16.4366 1.71767 16.8999 3.99981L23 4V6H21V20C21 22.2091 19.2091 24 17 24H7C4.79086 24 3 22.2091 3 20V6H1V4L7.10006 3.99981C7.5634 1.71767 9.58111 0 12 0ZM9.17004 4H9.66856H9.70601H10.2674H13.7327H14.2598H14.3079H14.829L14.7533 3.80669C14.6245 3.50979 14.449 3.23782 14.2362 3C13.7661 2.47481 13.1137 2.11621 12.3786 2.02365L12.1763 2.00509L12 2C11.1115 2 10.3133 2.38625 9.76394 3C9.54865 3.24054 9.3716 3.51603 9.24235 3.8169L9.17004 4ZM5 6H19V20L18.9945 20.1493C18.9182 21.1841 18.0544 22 17 22H7L6.85074 21.9945C5.81588 21.9182 5 21.0544 5 20V6ZM10 9V19H8V9H10ZM16 9V19H14V9H16Z"
                            fill="#C30000"
                        />
                    </g>
                </g>
            </g>
        </g>
    </svg>
);

export default BinSvg;
