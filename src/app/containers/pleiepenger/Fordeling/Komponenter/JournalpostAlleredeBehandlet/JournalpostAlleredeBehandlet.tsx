import React, { useEffect, useRef, useState } from 'react';
import { Dispatch } from 'redux';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Button } from '@navikt/ds-react';

import { IdentRules } from 'app/rules';
import { RootStateType } from 'app/state/RootState';
import { setIdentFellesAction } from 'app/state/actions/IdentActions';

import PunsjInnsendingType from '../../../../../models/enums/PunsjInnsendingType';
import {
    getJournalpostKopiereErrorResetAction,
    kopierJournalpost,
    resetBarnAction,
} from '../../../../../state/reducers/FellesReducer';
import { getEnvironmentVariable, getForkortelseFraFordelingDokumenttype } from '../../../../../utils';

import JournalPostKopiFelmeldinger from '../JournalPostKopiFelmeldinger';
import Pleietrengende from '../Pleietrengende';

import { DokumenttypeForkortelse, FordelingDokumenttype } from 'app/models/enums';
import { setDokumenttypeAction } from 'app/state/actions';
import DokumentTypeVelgerForKopiering from '../DokumentTypeVelgerForKopiering';

const JournalpostAlleredeBehandlet: React.FC = () => {
    const [visKanIkkeKopiere, setVisKanIkkeKopiere] = useState(false);

    const dispatch = useDispatch<Dispatch<any>>();

    const setIdentAction = (søkerId: string) => dispatch(setIdentFellesAction(søkerId, null, null));
    const setDokumenttype = (dokumenttype?: FordelingDokumenttype) => dispatch(setDokumenttypeAction(dokumenttype));
    const resetBarn = () => dispatch(resetBarnAction());
    const kopiereErrorReset = () => dispatch(getJournalpostKopiereErrorResetAction());

    const identState = useSelector((state: RootStateType) => state.identState);
    const fellesState = useSelector((state: RootStateType) => state.felles);
    const fordelingState = useSelector((state: RootStateType) => state.fordelingState);

    const prevPleietrengendeIdRef = useRef<string | null>(null);

    const { dedupKey, journalpost, kopierJournalpostSuccess, kopierJournalpostError } = fellesState;
    const { søkerId, pleietrengendeId } = identState;

    const erInntektsmeldingUtenKrav =
        journalpost?.punsjInnsendingType?.kode === PunsjInnsendingType.INNTEKTSMELDING_UTGÅTT;

    const isKopierButtonDisabled = IdentRules.erUgyldigIdent(pleietrengendeId) || kopierJournalpostSuccess;

    const ukjentYtelse =
        fellesState.journalpost?.sak?.sakstype === DokumenttypeForkortelse.UKJENT ||
        fellesState.journalpost?.sak?.sakstype === null ||
        fellesState.journalpost?.sak?.sakstype === DokumenttypeForkortelse.IKKE_DEFINERT;
    /*
     * TODO:
     * Hvis ukjent ytelse, vises valg for dokumenttype og ytelse brukes av dette valget.
     * Hvis ytelse er kjent, brukes sakstype fra journalposten.
     * Kan væere problemmet med OMS ytelser, frodi de har flere sakstyper - må ses på.
     * */
    const ytelseForKopiering =
        ukjentYtelse && fordelingState.dokumenttype
            ? getForkortelseFraFordelingDokumenttype(fordelingState.dokumenttype)
            : fellesState.journalpost?.sak?.sakstype;

    useEffect(() => {
        if (!søkerId && journalpost?.norskIdent) {
            setIdentAction(journalpost?.norskIdent);
        }
    }, [journalpost?.norskIdent]);

    useEffect(() => {
        if (kopierJournalpostError && identState.pleietrengendeId !== prevPleietrengendeIdRef.current) {
            kopiereErrorReset();
        }
    }, [identState.pleietrengendeId, kopierJournalpostError]);

    useEffect(() => {
        prevPleietrengendeIdRef.current = identState.pleietrengendeId;
    }, [identState.pleietrengendeId]);

    if (!journalpost?.norskIdent) {
        return (
            <Alert variant="warning">
                <FormattedMessage id="fordeling.journalpostAlleredeBehandlet.tomtIdentIJp.feil" />
            </Alert>
        );
    }

    const handleKopierJournalpost = () => {
        if (kopierJournalpostError) {
            kopiereErrorReset();
        }

        if (kopierJournalpostSuccess || erInntektsmeldingUtenKrav) {
            setVisKanIkkeKopiere(true);
            return;
        }
        /*
         *
         * TODO: Trenges støtte for annet part/behandligsår ???
         * Hvis ytelse i jp er ukjent da bør velges dokumenttype, pleitrengende (som nå), behandlinsår og annen part - samme som i fordeling.
         * Hvis ytelse i jp er kjent, da det finnes alt i fellesState.journalpost?.sak ???? eller nei???
         *
         * */
        if (!!søkerId && !!pleietrengendeId) {
            dispatch(
                kopierJournalpost(
                    søkerId,
                    søkerId,
                    pleietrengendeId,
                    journalpost?.journalpostId,
                    dedupKey,
                    ytelseForKopiering,
                ),
            );
        }
    };

    const handleGåToLOS = () => {
        window.location.href = getEnvironmentVariable('K9_LOS_URL');
    };

    const visPleietrengende = (!kopierJournalpostSuccess && !!fordelingState.dokumenttype) || !ukjentYtelse;
    const skalHenteBarn =
        (ukjentYtelse && fordelingState.dokumenttype !== FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE) ||
        (!ukjentYtelse && fellesState.journalpost?.sak?.sakstype !== DokumenttypeForkortelse.PPN);

    return (
        <>
            <div className="p-4">
                <Alert variant="info">
                    <FormattedMessage id="fordeling.journalpostAlleredeBehandlet.kanIkkeSendeInn.info" />
                </Alert>

                <DokumentTypeVelgerForKopiering
                    handleDokumenttype={(type: FordelingDokumenttype) => {
                        setDokumenttype(type);

                        if (kopierJournalpostError) {
                            kopiereErrorReset();
                        }

                        if (type === FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE) {
                            setIdentAction(søkerId);
                            resetBarn();
                        }
                    }}
                    visComponent={ukjentYtelse}
                    valgtDokumentType={fordelingState.dokumenttype as string}
                />

                <div className="mt-4">
                    <Pleietrengende
                        visPleietrengende={visPleietrengende}
                        skalHenteBarn={skalHenteBarn}
                        toSokereIJournalpost={false}
                    />
                </div>

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
