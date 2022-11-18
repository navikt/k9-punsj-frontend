import React from 'react';
import { Panel } from '@navikt/ds-react';
import './formPanel.less';

const FormPanel: React.FunctionComponent = ({ children }) => (
    <Panel className="sakstype_punch_form" border>
        {children}
    </Panel>
);

export default FormPanel;
