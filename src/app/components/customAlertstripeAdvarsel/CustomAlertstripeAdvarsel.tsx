import * as React from 'react';

import './customAlertstripeAdvarsel.less';

interface CustomAlertstripeAdvarselProps {
    children: React.ReactNode;
}

const CustomAlertstripeAdvarsel: React.FC<CustomAlertstripeAdvarselProps> = ({ children }) => (
    <div className="customAlertstripe">
        <span className="customAlertstripe__ikon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M12.2044 0L11.9905 0.00208659C8.77651 0.0584246 5.75142 1.35733 3.47348 3.65989C1.17884 5.97913 -0.0535213 9.01513 0.00178374 12.2097C0.116568 18.8211 5.2975 24 11.7964 24L12.0082 23.9979C18.7345 23.8821 24.1137 18.4048 23.9979 11.7913C23.8831 5.17997 18.7022 0 12.2044 0Z"
                    fill="#A32A17"
                />
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12.0272 18.8046C12.0182 18.8046 12.0092 18.8046 12.0002 18.8046C11.1827 18.8046 10.5137 18.1506 10.5003 17.3316C10.4853 16.5037 11.1452 15.8197 11.9732 15.8062C11.9822 15.8062 11.9912 15.8047 12.0002 15.8047C12.8176 15.8047 13.4851 16.4602 13.5001 17.2791C13.5151 18.1071 12.8536 18.7896 12.0272 18.8046Z"
                    fill="white"
                />
                <path
                    d="M12 4.80371C12.5523 4.80371 13 5.25143 13 5.80372V12.8038C13 13.3561 12.5523 13.8038 12 13.8038C11.4477 13.8038 11 13.3561 11 12.8038V5.80372C11 5.25143 11.4477 4.80371 12 4.80371Z"
                    fill="white"
                />
            </svg>
        </span>
        <div className="typo-normal customAlertstripe__content">{children}</div>
    </div>
);

export default CustomAlertstripeAdvarsel;
