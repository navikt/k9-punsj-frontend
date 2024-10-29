import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Box, Heading } from '@navikt/ds-react';
import { BackgroundColorToken } from '@navikt/ds-react/esm/layout/utilities/types';

export interface IFeilmeldingPanel {
    children?: React.ReactNode;
    messageId?: string;
    background?: BackgroundColorToken;
}

const FeilmeldingPanel: React.FC<IFeilmeldingPanel> = ({ children, messageId, background }) => (
    <Box padding="4" background={background} className="text-center">
        <Heading size="small">
            {messageId && children === undefined && <FormattedMessage id={messageId} />}
            {children !== undefined && children}
        </Heading>
    </Box>
);

export default FeilmeldingPanel;
