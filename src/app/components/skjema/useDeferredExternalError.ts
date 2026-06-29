import { useState } from 'react';

export const useDeferredExternalError = <T,>(error: T, showAfterSubmit: boolean) => {
    const [hasBeenBlurred, setHasBeenBlurred] = useState(false);

    return {
        deferredError: showAfterSubmit || hasBeenBlurred ? error : undefined,
        markBlurred: () => setHasBeenBlurred(true),
    };
};
