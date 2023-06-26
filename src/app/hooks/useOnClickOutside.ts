import { MutableRefObject, useEffect } from 'react';

const useOnClickOutside = (ref: MutableRefObject<any>, onClick: (event: any) => void) => {
    const handleClickOutside = (event: any) => {
        if (ref?.current && !ref.current.contains(event.target)) {
            onClick(event);
        }
    };

    useEffect(() => {
        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);
};

export default useOnClickOutside;
