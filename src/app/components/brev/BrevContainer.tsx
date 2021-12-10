import React, { useState } from 'react';
import './brevContainer.less';
import ChevronIcon from './ChevronIcon';
import SendIcon from './SendIcon';

const BrevContainer: React.FC = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="brevContainer">
            <button className="brevContainer__button" type="button" onClick={() => setIsOpen(!isOpen)}>
                <SendIcon />
                Send brev til arbeidsgiver eller søker
                <ChevronIcon className={`brevContainer__chevron ${isOpen ? 'brevContainer__chevron--open' : ''}`} />
            </button>
            {isOpen ? children : null}
        </div>
    );
};

export default BrevContainer;
