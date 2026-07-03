import React from 'react';

import { Heading } from '@navikt/ds-react';
import { FormattedMessage } from 'react-intl';

interface Props {
    titleId: string;
}

const PunchFormTitle: React.FC<Props> = ({ titleId }) => (
    <Heading size="medium" level="2">
        <FormattedMessage id={titleId} />
    </Heading>
);

export default PunchFormTitle;
