import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import SkjemaContext from '../../../components/skjema/SkjemaContext';
import { Sakstype } from '../../../models/enums';
import { IOverføringPunchSkjema, validatePunch } from '../../../models/forms/omsorgspenger/overføring/PunchSkjema';
import { RootStateType } from '../../../state/RootState';
import { sendInnSkjema } from '../../../state/reducers/omsorgspengeroverførdager/overføringPunchReducer';
import OverføringPunchSkjema from './OverføringPunchSkjema';

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
