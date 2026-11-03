import { useState } from 'react';

/** Returnerer verdien før siste endring, eller undefined før første endring. */
function usePrevious<T>(value: T): T | undefined {
    const [history, setHistory] = useState<{ value: T; previous: T | undefined }>(() => ({
        value,
        previous: undefined,
    }));

    if (!Object.is(history.value, value)) {
        setHistory({ value, previous: history.value });
    }

    return history.previous;
}

export default usePrevious;
