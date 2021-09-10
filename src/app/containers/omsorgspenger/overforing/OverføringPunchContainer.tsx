import React from 'react';
import OverføringPunchSkjema from './OverføringPunchSkjema';
import { IOverføringPunchSkjema, validatePunch } from '../../../models/forms/omsorgspenger/overføring/PunchSkjema';
import SkjemaContext from '../../../components/skjema/SkjemaContext';
import { useDispatch, useSelector } from 'react-redux';
import { sendInnSkjema } from '../../../state/reducers/omsorgspengeroverførdager/overføringPunchReducer';
import { RootStateType } from '../../../state/RootState';
import { Sakstype } from '../../../models/enums';

interface IOverføringPunchContainer {
    initialValues: IOverføringPunchSkjema;
    gåTilForrigeSteg: () => void;
}

const OverføringPunchContainer: React.FunctionComponent<IOverføringPunchContainer> = ({
    initialValues,
    gåTilForrigeSteg,
}) => {
    const dispatch = useDispatch();
    const { innsendingsstatus, innsendingsfeil, journalpostId, ident } = useSelector((state: RootStateType) => {
        const overføringState = state[Sakstype.OMSORGSPENGER_OVERFØRING];
        const punchState = overføringState.punch;
        return {
            innsendingsstatus: punchState.innsendingsstatus,
            innsendingsfeil: punchState.innsendingsfeil,
            journalpostId: state.felles.journalpost!.journalpostId,
            ident: overføringState.signatur.skjema.identitetsnummer,
        };
    });

    if (!ident) {
        // Skjer hvis man går direkte til url'en
        gåTilForrigeSteg();
        return null;
    }

    return (
        <SkjemaContext
            onSubmitCallback={(skjema) => {
                dispatch(sendInnSkjema(skjema));
            }}
            initialValues={initialValues}
            validerSkjema={validatePunch}
        >
            <OverføringPunchSkjema
                gåTilForrigeSteg={gåTilForrigeSteg}
                innsendingsstatus={innsendingsstatus}
                innsendingsfeil={innsendingsfeil}
                journalpostId={journalpostId}
                ident={ident}
            />
        </SkjemaContext>
    );
};

export default OverføringPunchContainer;
