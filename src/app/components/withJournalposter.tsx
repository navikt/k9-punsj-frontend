import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { setJournalposterFraAapenSoknad } from 'app/state/reducers/FellesReducer';
import { RootStateType } from 'app/state/RootState';

export interface WithJournalposterProps {
    updateJournalposter: (journalposter: string[] | Set<string>) => void;
    cleanupJournalposter: () => void;
}

// HOC to provide journalpost functionality
export function withJournalposter(WrappedComponent: React.ComponentType<any>) {
    // This is the component that withJournalposter returns.
    // It's a functional component, so we can use hooks here.
    return function WithJournalposterComponent(props: any) {
        // Now useSelector and useDispatch are called in the right place
        const journalposterIAapenSoknad = useSelector((state: RootStateType) => state.felles.journalposterIAapenSoknad);
        const dispatch = useDispatch();

        const updateJournalposter = (journalposter: string[] | Set<string>) => {
            const journalposterArray = Array.isArray(journalposter) ? journalposter : Array.from(journalposter);
            const newSet = new Set(journalposterArray);
            const currentSet = new Set(journalposterIAapenSoknad);

            const haveSameElements =
                newSet.size === currentSet.size && [...newSet].every((element) => currentSet.has(element));

            if (!haveSameElements) {
                dispatch(setJournalposterFraAapenSoknad(journalposterArray));
            }
        };

        const cleanupJournalposter = () => {
            dispatch(setJournalposterFraAapenSoknad([]));
        };

        // We're spreading the additional props last so they can override any conflicting props
        return (
            <WrappedComponent
                {...props}
                updateJournalposter={updateJournalposter}
                cleanupJournalposter={cleanupJournalposter}
            />
        );
    };
}
