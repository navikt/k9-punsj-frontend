import React, { useState } from 'react';
import './brevContainer.less';
import SendIcon from './SendIcon';

const BrevContainer: React.FC = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="brevContainer">
            <button className="brevContainer__button" type="button" onClick={() => setIsOpen(!isOpen)}>
                <SendIcon />
                Send brev til arbeidsgiver eller søker
                <svg
                    className={`brevContainer__chevron ${isOpen ? 'brevContainer__chevron--open' : ''}`}
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M2.74775 11.701C2.34793 12.0997 1.69969 12.0997 1.29987 11.701C0.900044 11.3024 0.900044 10.6561 1.29987 10.2574L7.27606 4.29898C7.67588 3.90034 8.32412 3.90034 8.72394 4.29898L14.7001 10.2574C15.1 10.6561 15.1 11.3024 14.7001 11.701C14.3003 12.0997 13.6521 12.0997 13.2522 11.701L8 6.46436L2.74775 11.701Z"
                        fill="#0067C5"
                    />
                </svg>
            </button>
            {isOpen ? children : null}
        </div>
    );
};

export default BrevContainer;
