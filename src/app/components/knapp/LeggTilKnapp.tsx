import React from 'react';
import { FormattedMessage } from 'react-intl';

import { Button } from '@navikt/ds-react';

import PlussSVG from '../../assets/SVG/PlussSVG';
import './knapper.less';

interface ILeggTilKnappProps {
    onClick: VoidFunction;
    tekstId: string;
}

const LeggTilKnapp: React.FunctionComponent<ILeggTilKnappProps> = ({ onClick, tekstId }) => (
    <Button variant="tertiary" type="button" onClick={onClick} size="small" className="leggtilknapp">
        <PlussSVG />
        <span>
            <FormattedMessage id={tekstId} />
        </span>
    </Button>
);

export default LeggTilKnapp;
