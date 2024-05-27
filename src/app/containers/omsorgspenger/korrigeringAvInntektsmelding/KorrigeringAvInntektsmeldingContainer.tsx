import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { IFordelingState, IJournalpost, IPSBSoknad } from 'app/models/types';
import { IIdentState } from 'app/models/types/IdentState';
import { RootStateType } from 'app/state/RootState';
import { createOMSKorrigering } from 'app/state/actions/OMSPunchFormActions';

import KorrigeringAvInntektsmeldingForm from './KorrigeringAvInntektsmeldingForm';

export interface KorrigeringAvInntektsmeldingContainerProps {
    journalpost?: IJournalpost;
    identState: IIdentState;
    fordelingState: IFordelingState;
}

const KorrigeringAvInntektsmelding: React.FC<KorrigeringAvInntektsmeldingContainerProps> = ({
    identState,
    journalpost,
    fordelingState,
}) => {
    const { søkerId } = identState;
    const { fagsak } = fordelingState;
    const k9saksnummer = fagsak?.fagsakId;
    const [soknad, setSoknad] = useState<Partial<IPSBSoknad>>({});
    console.log('TEST');
    useEffect(() => {
        createOMSKorrigering(
            søkerId,
            journalpost?.journalpostId || '',
            (response, data) => {
                setSoknad(data);
            },
            k9saksnummer,
        );
    }, [søkerId, journalpost]);
    const journalposterFraSoknad = soknad?.journalposter || [];
    const journalposter = Array.from(journalposterFraSoknad);
    return (
        <KorrigeringAvInntektsmeldingForm
            søkerId={søkerId}
            søknadId={soknad?.soeknadId || ''}
            journalposter={journalposter}
        />
    );
};

const mapStateToProps = (state: RootStateType) => ({
    journalpost: state.felles.journalpost,
    identState: state.identState,
    forbidden: state.felles.journalpostForbidden,
    punchFormState: state.PLEIEPENGER_SYKT_BARN.punchFormState,
    fordelingState: state.fordelingState,
});

const KorrigeringAvInntektsmeldingContainer = connect(mapStateToProps)(KorrigeringAvInntektsmelding);
export default KorrigeringAvInntektsmeldingContainer;
