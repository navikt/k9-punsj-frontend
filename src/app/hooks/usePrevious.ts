import { useEffect, useRef } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any

function usePrevious<T>(value: T): T {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ref: any = useRef<T>();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

export default usePrevious;
