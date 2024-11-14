import React, { useEffect, useState } from 'react';

import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import { IPSBSoknad } from 'app/models/types';
import { RootStateType } from 'app/state/RootState';
import { createOMSKorrigering, hentOMSSøknad } from 'app/state/actions/OMSPunchFormActions';
import KorrigeringAvInntektsmeldingForm from './KorrigeringAvInntektsmeldingForm';
import { ROUTES } from 'app/constants/routes';

const KorrigeringAvInntektsmeldingContainer: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    const navigate = useNavigate();

    const identState = useSelector((state: RootStateType) => state.identState);
    const journalpost = useSelector((state: RootStateType) => state.felles.journalpost);
    const fordelingState = useSelector((state: RootStateType) => state.fordelingState);

    const [soknad, setSoknad] = useState<Partial<IPSBSoknad>>({});

    const { søkerId } = identState;
    const { fagsak } = fordelingState;
    const k9saksnummer = fagsak?.fagsakId;

    useEffect(() => {
        if (!id) {
            createOMSKorrigering(
                søkerId,
                journalpost?.journalpostId || '',
                (response, data) => {
                    setSoknad(data);
                    navigate(`../${ROUTES.KORRIGERING_INNTEKTSMELDING_ID.replace(':id', data.soeknadId)}`);
                },
                k9saksnummer,
            );
        }
        if (id) {
            const søknad = hentOMSSøknad(journalpost?.norskIdent || '', id);
            søknad.then((response) => {
                setSoknad(response);
            });
        }
    }, [søkerId, journalpost]);

    const journalposterFraSoknad = soknad?.journalposter || [];
    const journalposter = Array.from(journalposterFraSoknad);

    return (
        <KorrigeringAvInntektsmeldingForm
            søkerId={søkerId || soknad.soekerId || ''}
            søknadId={soknad?.soeknadId || id || ''}
            journalposter={journalposter}
        />
    );
};

export default KorrigeringAvInntektsmeldingContainer;
