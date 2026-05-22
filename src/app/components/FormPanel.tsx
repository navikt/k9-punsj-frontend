import React from 'react';
import { Box } from '@navikt/ds-react';

interface Props {
    children: React.ReactNode;
}

const FormPanel: React.FC<Props> = ({ children }) => (
    <Box
        padding="space-24"
        borderWidth="1"
        borderRadius="8"
        borderColor="neutral"
        className="flex-1 custom-scrollbar"
    >
        {children}
    </Box>
);

export default FormPanel;
