import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setJournalposterFraAapenSoknad } from 'app/state/reducers/FellesReducer';
import { RootStateType } from 'app/state/RootState';
import { Dispatch } from 'redux';

interface JournalposterSyncProps {
    journalposter: string[] | Set<string>;
}

const JournalposterSync: React.FC<JournalposterSyncProps> = ({ journalposter }) => {
    const dispatch = useDispatch<Dispatch<any>>();
    const currentJournalposter = useSelector((state: RootStateType) => state.felles.journalposterIAapenSoknad);
    const journalposterArray = Array.isArray(journalposter) ? journalposter : Array.from(journalposter);

    useEffect(() => {
        const haveSameElements = (arr1: string[], arr2: string[]) => {
            if (arr1.length !== arr2.length) return false;
            const set = new Set(arr2);
            return arr1.every((item) => set.has(item));
        };

        if (!haveSameElements(journalposterArray, currentJournalposter || [])) {
            dispatch(setJournalposterFraAapenSoknad(journalposterArray));
        }

        return () => {
            if (currentJournalposter?.length) {
                dispatch(setJournalposterFraAapenSoknad([]));
            }
        };
    }, [JSON.stringify(journalposterArray), JSON.stringify(currentJournalposter)]);

    return null;
};

export default JournalposterSync;
