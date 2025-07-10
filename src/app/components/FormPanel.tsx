import React from 'react';
import { Box } from '@navikt/ds-react';

interface Props {
    children: React.ReactNode;
}

const FormPanel: React.FC<Props> = ({ children }) => (
    <Box
        padding="6"
        borderWidth="1"
        borderRadius="medium"
        borderColor="border-default"
        className="flex-1 custom-scrollbar"
    >
        {children}
    </Box>
);

export default FormPanel;
