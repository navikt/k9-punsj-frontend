import { useEffect, useRef } from 'react';

 @typescript-eslint/no-explicit-any

function usePrevious<T>(value: T): T {
     @typescript-eslint/no-explicit-any
    const ref: any = useRef<T>();
    useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

export default usePrevious;
