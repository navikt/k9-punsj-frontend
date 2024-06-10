import React from 'react';
import { Alert } from '@navikt/ds-react';

const ErrorFallback = () => (
    <div className="flex justify-center items-center h-screen">
        <Alert variant="error" size="medium">
            Det har oppstått en feil i systemet. Vennligst prøv igjen senere, eller kontakt oss hvis problemet vedvarer.
        </Alert>
    </div>
);
export default ErrorFallback;
