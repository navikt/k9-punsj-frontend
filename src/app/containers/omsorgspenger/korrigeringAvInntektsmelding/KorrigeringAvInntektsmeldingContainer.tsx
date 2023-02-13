import React, { useEffect, useState } from 'react';
import { createOMSKorrigering } from 'app/state/actions/OMSPunchFormActions';
import { IJournalpost, IPSBSoknad } from 'app/models/types';
import { RootStateType } from 'app/state/RootState';
import { IIdentState } from 'app/models/types/IdentState';
import { connect } from 'react-redux';
import { SplitView } from '../../../components/SplitView';
import KorrigeringAvInntektsmeldingForm from './KorrigeringAvInntektsmeldingForm';

export interface KorrigeringAvInntektsmeldingContainerProps {
    journalpost?: IJournalpost;
    identState: IIdentState;
}

const KorrigeringAvInntektsmelding: React.FC<KorrigeringAvInntektsmeldingContainerProps> = ({
    identState,
    journalpost,
}) => {
    const { søkerId } = identState;
    const [soknad, setSoknad] = useState<Partial<IPSBSoknad>>({});
    useEffect(() => {
        createOMSKorrigering(søkerId, journalpost?.journalpostId || '', (response, data) => {
            setSoknad(data);
        });
    }, [søkerId, journalpost]);
    const journalposterFraSoknad = soknad?.journalposter || [];

    return (
        <SplitView soknad={soknad}>
            <KorrigeringAvInntektsmeldingForm
                søkerId={søkerId}
                søknadId={soknad?.soeknadId || ''}
                journalposter={Array.from(journalposterFraSoknad)}
            />
        </SplitView>
    );
};

const mapStateToProps = (state: RootStateType) => ({
    punchState: state.PLEIEPENGER_SYKT_BARN.punchState,
    journalpost: state.felles.journalpost,
    identState: state.identState,
    forbidden: state.felles.journalpostForbidden,
    punchFormState: state.PLEIEPENGER_SYKT_BARN.punchFormState,
    journalposterIAktivPunchForm: state.PLEIEPENGER_SYKT_BARN.punchFormState.soknad?.journalposter,
});

const KorrigeringAvInntektsmeldingContainer = connect(mapStateToProps)(KorrigeringAvInntektsmelding);
export default KorrigeringAvInntektsmeldingContainer;
