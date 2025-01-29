import React, { useState } from 'react';

import { Checkbox } from '@navikt/ds-react';
import { FormattedMessage } from 'react-intl';

interface Props {
    children?: React.ReactNode;
}

const BrevContainer: React.FC<Props> = ({ children }) => {
    const [visBrev, setVisBrev] = useState(false);

    return (
        <div className="mt-6 mb-4">
            <Checkbox onChange={() => setVisBrev(!visBrev)} checked={visBrev}>
                <FormattedMessage id="brevContainer.checkbox.tittel" />
            </Checkbox>

            {visBrev && children}
        </div>
    );
};

export default BrevContainer;
