import React from 'react';
import { FormattedMessage } from 'react-intl';

import { Button } from '@navikt/ds-react';

import './knapper.less';

interface ISokKnappProps {
    onClick: VoidFunction;
    tekstId: string;
    disabled: boolean;
}

const SokKnapp: React.FunctionComponent<ISokKnappProps> = ({ onClick, tekstId, disabled }) => (
    <Button onClick={() => onClick()} size="small" className="sokknapp" disabled={disabled}>
        <FormattedMessage id={tekstId} />
    </Button>
);

export default SokKnapp;
