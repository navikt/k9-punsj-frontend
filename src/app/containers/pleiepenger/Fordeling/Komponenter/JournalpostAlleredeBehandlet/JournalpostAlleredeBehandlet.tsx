import React, { useEffect, useState } from 'react';
import { Dispatch } from 'redux';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Button } from '@navikt/ds-react';

import { IdentRules } from 'app/rules';
import { RootStateType } from 'app/state/RootState';
import { setIdentFellesAction } from 'app/state/actions/IdentActions';

import PunsjInnsendingType from '../../../../../models/enums/PunsjInnsendingType';
import { kopierJournalpost } from '../../../../../state/reducers/FellesReducer';
import { getEnvironmentVariable } from '../../../../../utils';

import LabelValue from 'app/components/skjema/LabelValue';
import JournalPostKopiFelmeldinger from '../JournalPostKopiFelmeldinger';
import Pleietrengende from '../Pleietrengende';
import DokumentTypeVelger from '../DokumentTypeVelger';
import { FordelingDokumenttype } from 'app/models/enums';
import { setDokumenttypeAction } from 'app/state/actions';

const JournalpostAlleredeBehandlet: React.FC = () => {
    const [visKanIkkeKopiere, setVisKanIkkeKopiere] = useState(false);

    const dispatch = useDispatch<Dispatch<any>>();
    const setIdentAction = (søkerId: string) => dispatch(setIdentFellesAction(søkerId, null, null));
    const setDokumenttype = (dokumenttype: FordelingDokumenttype) => dispatch(setDokumenttypeAction(dokumenttype));

    const identState = useSelector((state: RootStateType) => state.identState);
    const fellesState = useSelector((state: RootStateType) => state.felles);
    const fordelingState = useSelector((state: RootStateType) => state.fordelingState);

    const { dedupKey, journalpost, kopierJournalpostSuccess } = fellesState;
    const { søkerId, pleietrengendeId } = identState;

    const erInntektsmeldingUtenKrav =
        journalpost?.punsjInnsendingType?.kode === PunsjInnsendingType.INNTEKTSMELDING_UTGÅTT;

    const isKopierButtonDisabled = IdentRules.erUgyldigIdent(pleietrengendeId) || kopierJournalpostSuccess;

    useEffect(() => {
        if (!søkerId && journalpost?.norskIdent) {
            setIdentAction(journalpost?.norskIdent);
        }
    }, [journalpost?.norskIdent]);

    if (!journalpost?.norskIdent) {
        return (
            <Alert variant="warning">
                <FormattedMessage id="fordeling.journalpostAlleredeBehandlet.tomtIdentIJp.feil" />
            </Alert>
        );
    }

    const handleKopierJournalpost = () => {
        if (kopierJournalpostSuccess || erInntektsmeldingUtenKrav) {
            setVisKanIkkeKopiere(true);
            return;
        }
        if (!!søkerId && !!pleietrengendeId) {
            dispatch(kopierJournalpost(søkerId, søkerId, pleietrengendeId, journalpost?.journalpostId, dedupKey));
        }
    };

    const handleGåToLOS = () => {
        window.location.href = getEnvironmentVariable('K9_LOS_URL');
    };

    return (
        <>
            <div className="p-4">
                <Alert variant="info">
                    <FormattedMessage id="fordeling.journalpostAlleredeBehandlet.kanIkkeSendeInn.info" />
                </Alert>

                <div className="mt-6">
                    <LabelValue labelTextId="journalpost.norskIdent" value={søkerId} visKopier />
                </div>

                <DokumentTypeVelger
                    handleDokumenttype={(type: FordelingDokumenttype) => {
                        setDokumenttype(type);
                        setIdentAction(søkerId);
                    }}
                    valgtDokumentType={fordelingState.dokumenttype as string}
                    kopierValg={true}
                />

                {!kopierJournalpostSuccess && (
                    <div className="mt-6">
                        <Pleietrengende visPleietrengende skalHenteBarn toSokereIJournalpost={false} />
                    </div>
                )}

                <JournalPostKopiFelmeldinger fellesState={fellesState} />

                {visKanIkkeKopiere && (
                    <Alert variant="warning">
                        <FormattedMessage id="fordeling.journalpostAlleredeBehandlet.kanIkkeKopieres.info.tittel" />
                        <ul>
                            <li>
                                <FormattedMessage id="fordeling.journalpostAlleredeBehandlet.kanIkkeKopieres.info.1" />
                            </li>
                            <li>
                                <FormattedMessage id="fordeling.journalpostAlleredeBehandlet.kanIkkeKopieres.info.2" />
                            </li>
                            <li>
                                <FormattedMessage id="fordeling.journalpostAlleredeBehandlet.kanIkkeKopieres.info.3" />
                            </li>
                        </ul>
                    </Alert>
                )}
            </div>

            <div className="mt-8 flex space-x-6">
                <Button
                    variant="secondary"
                    size="small"
                    disabled={isKopierButtonDisabled}
                    onClick={handleKopierJournalpost}
                >
                    <FormattedMessage id="fordeling.journalpostAlleredeBehandlet.kopierJournalpost.btn" />
                </Button>

                {!!kopierJournalpostSuccess && (
                    <Button onClick={handleGåToLOS} size="small">
                        <FormattedMessage id="fordeling.journalpostAlleredeBehandlet.tilbakeTilLOS.btn" />
                    </Button>
                )}
            </div>
        </>
    );
};

export default JournalpostAlleredeBehandlet;
