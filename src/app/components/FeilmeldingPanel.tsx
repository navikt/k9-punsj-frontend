import React from 'react';
import { FormattedMessage } from 'react-intl';

import { Heading, Panel } from '@navikt/ds-react';

import './feilmeldingPanel.less';

export interface IFeilmeldingPanel {
    messageId: string;
}

const FeilmeldingPanel: React.FunctionComponent<IFeilmeldingPanel> = ({ messageId }) => (
    <Panel className="container">
        <Heading size="small">
            <FormattedMessage id={messageId} />
        </Heading>
    </Panel>
);

export default FeilmeldingPanel;
