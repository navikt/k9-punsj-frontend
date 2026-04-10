import { RefObject, useEffect, useRef } from 'react';

const useOnClickOutside = <T extends HTMLElement>(ref: RefObject<T | null>, onClick: (event: MouseEvent) => void) => {
    const onClickRef = useRef(onClick);

    useEffect(() => {
        onClickRef.current = onClick;
    }, [onClick]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target;

            if (!ref.current || !(target instanceof Node) || ref.current.contains(target)) {
                return;
            }

            onClickRef.current(event);
        };

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [ref]);
};

export default useOnClickOutside;
