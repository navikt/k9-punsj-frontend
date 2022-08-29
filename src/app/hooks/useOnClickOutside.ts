import React, { MutableRefObject, useEffect } from 'react';

const useOnClickOutside = (ref: MutableRefObject<any>, onClick: () => void) => {
    const handleClickOutside = (event: any) => {
        if (ref.current && !ref.current.contains(event.target)) {
            onClick();
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
