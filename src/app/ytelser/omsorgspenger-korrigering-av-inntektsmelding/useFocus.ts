import { useEffect } from 'react';

const useFocus = (
    currentListLength: number,
    previousListLength: number,
    inputRef?: React.RefObject<HTMLInputElement>,
): void => {
    const focusInput = () => {
        if (inputRef?.current) {
            inputRef.current.focus();
        }
    };
    useEffect(() => {
        if (previousListLength < currentListLength) {
            focusInput();
        }
    }, [previousListLength, currentListLength]);
};

export default useFocus;
