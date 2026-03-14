import { RefObject, useEffect } from 'react';

const useOnClickOutside = <T extends HTMLElement>(ref: RefObject<T | null>, onClick: (event: MouseEvent) => void) => {
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target;

            if (!ref.current || !(target instanceof Node) || ref.current.contains(target)) {
                return;
            }

            onClick(event);
        };

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [ref, onClick]);
};

export default useOnClickOutside;
