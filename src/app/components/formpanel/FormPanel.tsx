import React from 'react';

import { Panel } from '@navikt/ds-react';

import './formPanel.less';

interface Props {
    children: React.ReactNode;
}

const FormPanel: React.FunctionComponent<Props> = ({ children }) => (
    <Panel className="sakstype_punch_form" border>
        {children}
    </Panel>
);

export default FormPanel;
