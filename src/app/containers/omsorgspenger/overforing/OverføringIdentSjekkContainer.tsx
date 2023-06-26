import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { setSkjema } from 'app/state/reducers/omsorgspengeroverførdager/overføringSignaturReducer';

import { JournalpostPanel } from '../../../components/journalpost-panel/JournalpostPanel';
import SkjemaContext from '../../../components/skjema/SkjemaContext';
import { ISignaturSkjema, validerSignaturSkjema } from '../../../models/forms/omsorgspenger/overføring/SignaturSkjema';
import { RootStateType } from '../../../state/RootState';
import OverføringIdentSjekk from './OverføringIdentSjekk';

interface ISignaturSkjemaContextProps {
    initialValues: ISignaturSkjema;
    gåTilNesteSteg: (skjemaParams: { ident: string }) => void;
}

const OverføringIdentSjekkContainer: React.FunctionComponent<ISignaturSkjemaContextProps> = ({
    initialValues,
    gåTilNesteSteg,
}) => {
    const dispatch = useDispatch();

    const journalpost = useSelector((state: RootStateType) => state.felles.journalpost!);

    return (
        <SkjemaContext
            onSubmitCallback={(values: ISignaturSkjema) => {
                dispatch(setSkjema(values));
                gåTilNesteSteg({ ident: values.identitetsnummer });
            }}
            initialValues={initialValues}
            validerSkjema={validerSignaturSkjema}
        >
            <>
                <JournalpostPanel />
                <OverføringIdentSjekk journalpostensRegistrertePersonident={journalpost.norskIdent} />
            </>
        </SkjemaContext>
    );
};

export default OverføringIdentSjekkContainer;
