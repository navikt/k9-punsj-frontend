import { CollapseFilled, ExpandFilled } from '@navikt/ds-icons';
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
                {isOpen ? (
                    <ExpandFilled className="brevContainer__chevron" fill="#0067C5" />
                ) : (
                    <CollapseFilled className="brevContainer__chevron" fill="#0067C5" />
                )}
            </button>
            {isOpen ? children : null}
        </div>
    );
};

export default BrevContainer;
