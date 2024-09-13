import React from 'react';
import { Box } from '@navikt/ds-react';

import './formPanel.less';

interface Props {
    children: React.ReactNode;
}

const FormPanel: React.FunctionComponent<Props> = ({ children }) => (
    <Box padding="4" borderWidth="1" borderRadius="small" className="sakstype_punch_form">
        {children}
    </Box>
);

export default FormPanel;
