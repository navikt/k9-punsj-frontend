import { useEffect, useRef } from 'react';

function usePrevious<T>(value: T): T {
    const ref: any = useRef<T>(undefined);
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

export default usePrevious;
