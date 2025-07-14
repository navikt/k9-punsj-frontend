import React from 'react';
import { Tag } from '@navikt/ds-react';
import { FormattedMessage } from 'react-intl';

interface Props {
    lagret: boolean;
    lagrer: boolean;
    error: boolean;
}

const MellomlagringEtikett: React.FC<Props> = ({ lagret, lagrer, error }) => {
    const className = 'absolute top-[60px] left-4 z-5';

    if (lagret) {
        return (
            <Tag variant="success" className={className}>
                <FormattedMessage id="skjema.updateSoknadSuccess" />
            </Tag>
        );
    }

    if (lagrer) {
        return (
            <Tag variant="warning" className={className}>
                <FormattedMessage id="skjema.isAwaitingUpdateResponse" />
            </Tag>
        );
    }

    if (error) {
        return (
            <Tag variant="error" className={className}>
                <FormattedMessage id="skjema.updateSoknadError" />
            </Tag>
        );
    }

    return null;
};

export default MellomlagringEtikett;
