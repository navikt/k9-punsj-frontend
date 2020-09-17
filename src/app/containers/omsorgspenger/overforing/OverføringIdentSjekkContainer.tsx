import React from 'react';
import OverføringIdentSjekk from './OverføringIdentSjekk';
import {
  ISignaturSkjema,
  validerSignaturSkjema,
} from '../../../models/forms/omsorgspenger/overføring/SignaturSkjema';
import SkjemaContext from '../../../components/skjema/SkjemaContext';
import { useDispatch, useSelector } from 'react-redux';
import { setSkjema } from 'app/state/reducers/omsorgspengeroverførdager/overføringSignaturReducer';
import { RootStateType } from '../../../state/RootState';
import {JournalpostPanel} from "../../../components/journalpost-panel/JournalpostPanel";

interface ISignaturSkjemaContextProps {
  initialValues: ISignaturSkjema;
  gåTilNesteSteg: (skjemaParams: { ident: string }) => void;
}

const OverføringIdentSjekkContainer: React.FunctionComponent<ISignaturSkjemaContextProps> = ({
  initialValues,
  gåTilNesteSteg,
}) => {
  const dispatch = useDispatch();

  const journalpost = useSelector(
      (state: RootStateType) => state.punchState.journalpost!
  )

    return (
        <SkjemaContext
            onSubmitCallback={(values: ISignaturSkjema) => {
                dispatch(setSkjema(values));
                gåTilNesteSteg({ident: values.identitetsnummer});
            }}
            initialValues={initialValues}
            validerSkjema={validerSignaturSkjema}
        >
            <div>
                <JournalpostPanel journalpost={journalpost}/>
                <OverføringIdentSjekk
                    journalpostensRegistrertePersonident={
                        journalpost.norskIdent
                    }
                />
            </div>

        </SkjemaContext>
    );
};

export default OverføringIdentSjekkContainer;
