import React, { useEffect, useRef, useState } from 'react';
import { Dispatch } from 'redux';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Button } from '@navikt/ds-react';

import { IdentRules } from 'app/rules';
import { RootStateType } from 'app/state/RootState';
import { setAnnenPartAction, setIdentFellesAction } from 'app/state/actions/IdentActions';

import PunsjInnsendingType from '../../../../../models/enums/PunsjInnsendingType';
import {
    getJournalpostKopiereErrorResetAction,
    kopierJournalpostRedux,
    resetBarnAction,
} from '../../../../../state/reducers/FellesReducer';
import { getEnvironmentVariable, getForkortelseFraFordelingDokumenttype } from '../../../../../utils';

import JournalPostKopiFelmeldinger from '../JournalPostKopiFelmeldinger';
import Pleietrengende from '../Pleietrengende';

import { FordelingDokumenttype } from 'app/models/enums';
import { setDokumenttypeAction } from 'app/state/actions';
import DokumentTypeVelgerForKopiering from '../DokumentTypeVelgerForKopiering';
import ValgAvBehandlingsÅr from '../ValgAvBehandlingsÅr';
import AnnenPart from '../AnnenPart';
import ToSoekere from '../ToSoekere';

const JournalpostAlleredeBehandlet: React.FC = () => {
    const [visKanIkkeKopiere, setVisKanIkkeKopiere] = useState(false);
    const [behandlingsAar, setBehandlingsAar] = useState<string | undefined>(undefined);
    const [toSokereIJournalpost, setToSokereIJournalpost] = useState<boolean>(false);

    const dispatch = useDispatch<Dispatch<any>>();

    const setIdentAction = (søkerId: string, pleietrengendeId?: string, annenSokerIdent?: string) =>
        dispatch(setIdentFellesAction(søkerId, pleietrengendeId, annenSokerIdent));
    const setAnnenPart = (annenPart: string) => dispatch(setAnnenPartAction(annenPart));
    const setDokumenttype = (dokumenttype?: FordelingDokumenttype) => dispatch(setDokumenttypeAction(dokumenttype));
    const resetBarn = () => dispatch(resetBarnAction());
    const kopiereErrorReset = () => dispatch(getJournalpostKopiereErrorResetAction());

    const identState = useSelector((state: RootStateType) => state.identState);
    const fellesState = useSelector((state: RootStateType) => state.felles);
    const fordelingState = useSelector((state: RootStateType) => state.fordelingState);

    const prevPleietrengendeIdRef = useRef<string | null>(null);

    const { dedupKey, journalpost, kopierJournalpostSuccess, kopierJournalpostError } = fellesState;
    const { søkerId, pleietrengendeId, annenSokerIdent } = identState;

    const erInntektsmeldingUtenKrav =
        journalpost?.punsjInnsendingType?.kode === PunsjInnsendingType.INNTEKTSMELDING_UTGÅTT;

    const isDokumenttypeMedPleietrengende =
        fordelingState.dokumenttype === FordelingDokumenttype.PLEIEPENGER ||
        fordelingState.dokumenttype === FordelingDokumenttype.OMSORGSPENGER_KS ||
        fordelingState.dokumenttype === FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE ||
        fordelingState.dokumenttype === FordelingDokumenttype.OPPLAERINGSPENGER ||
        fordelingState.dokumenttype === FordelingDokumenttype.OMSORGSPENGER_AO;

    const isDokumenttypeMedBehandlingsår =
        fordelingState.dokumenttype === FordelingDokumenttype.OMSORGSPENGER_UT ||
        fordelingState.dokumenttype === FordelingDokumenttype.KORRIGERING_IM;

    const isDokumenttypeMedAnnenPart = fordelingState.dokumenttype === FordelingDokumenttype.OMSORGSPENGER_MA;

    // TODO: Legg til validering for Annen søker
    const isKopierButtonDisabled =
        !fordelingState.dokumenttype ||
        fordelingState.dokumenttype === FordelingDokumenttype.OMSORGSPENGER ||
        (isDokumenttypeMedPleietrengende && IdentRules.erUgyldigIdent(pleietrengendeId)) ||
        (isDokumenttypeMedBehandlingsår && !behandlingsAar) ||
        (isDokumenttypeMedAnnenPart && IdentRules.erUgyldigIdent(identState.annenPart)) ||
        kopierJournalpostSuccess;
    /*
     * TODO:
     * Hvis ukjent ytelse, vises valg for dokumenttype og ytelse brukes av dette valget.
     * Hvis ytelse er kjent, brukes sakstype fra journalposten.
     * Kan væere problemmet med OMS ytelser, frodi de har flere sakstyper - må ses på.
     * */
    const ytelseForKopiering = fordelingState.dokumenttype
        ? getForkortelseFraFordelingDokumenttype(fordelingState.dokumenttype)
        : undefined;

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
         * TODO: Fix If statement
         * */
        if (
            ((!!søkerId && !toSokereIJournalpost) || (toSokereIJournalpost && annenSokerIdent)) &&
            ytelseForKopiering &&
            !isKopierButtonDisabled
        ) {
            dispatch(
                kopierJournalpostRedux(
                    toSokereIJournalpost ? annenSokerIdent! : søkerId,
                    pleietrengendeId,
                    journalpost?.journalpostId,
                    dedupKey,
                    ytelseForKopiering,
                    isDokumenttypeMedBehandlingsår && behandlingsAar ? Number(behandlingsAar) : undefined,
                    isDokumenttypeMedAnnenPart ? identState.annenPart : undefined,
                ),
            );
        }
    };

    const handleGåToLOS = () => {
        window.location.href = getEnvironmentVariable('K9_LOS_URL');
    };

    const visPleietrengende = !kopierJournalpostSuccess && isDokumenttypeMedPleietrengende;

    const skalHenteBarn =
        fordelingState.dokumenttype !== FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE &&
        fordelingState.dokumenttype !== FordelingDokumenttype.OMSORGSPENGER_MA &&
        fordelingState.dokumenttype !== FordelingDokumenttype.OMSORGSPENGER_UT &&
        fordelingState.dokumenttype !== FordelingDokumenttype.KORRIGERING_IM;

    return (
        <>
            <div className="p-4">
                <Alert variant="info">
                    <FormattedMessage id="fordeling.journalpostAlleredeBehandlet.kanIkkeSendeInn.info" />
                </Alert>

                <DokumentTypeVelgerForKopiering
                    handleDokumenttype={(type: FordelingDokumenttype) => {
                        const prevDokumentType = fordelingState.dokumenttype;

                        if (
                            prevDokumentType === FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE ||
                            prevDokumentType === FordelingDokumenttype.OMSORGSPENGER_MA
                        ) {
                            setIdentAction(søkerId);
                        }

                        setDokumenttype(type);
                        setAnnenPart('');

                        if (
                            type !== FordelingDokumenttype.OMSORGSPENGER_UT &&
                            type !== FordelingDokumenttype.KORRIGERING_IM &&
                            behandlingsAar
                        ) {
                            setBehandlingsAar(undefined);
                        }

                        if (kopierJournalpostError) {
                            kopiereErrorReset();
                        }

                        if (
                            type === FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE ||
                            type === FordelingDokumenttype.OMSORGSPENGER_UT ||
                            type === FordelingDokumenttype.KORRIGERING_IM ||
                            type === FordelingDokumenttype.OMSORGSPENGER_MA
                        ) {
                            setIdentAction(søkerId);
                            resetBarn();
                        }
                    }}
                    valgtDokumentType={fordelingState.dokumenttype as string}
                />

                <ToSoekere
                    journalpost={journalpost}
                    identState={identState}
                    toSokereIJournalpost={toSokereIJournalpost}
                    setIdentAction={setIdentAction}
                    setToSokereIJournalpost={setToSokereIJournalpost}
                    dokumenttype={fordelingState.dokumenttype}
                    // disabled={disableRadios}
                />

                <div className="mt-4">
                    <Pleietrengende
                        visPleietrengende={visPleietrengende}
                        skalHenteBarn={skalHenteBarn}
                        toSokereIJournalpost={false}
                    />
                </div>

                {isDokumenttypeMedBehandlingsår && (
                    <ValgAvBehandlingsÅr behandlingsAar={behandlingsAar} onChange={setBehandlingsAar} />
                )}

                <div className="mt-5 mb-5">
                    <AnnenPart
                        identState={identState}
                        showComponent={fordelingState.dokumenttype === FordelingDokumenttype.OMSORGSPENGER_MA}
                        setAnnenPart={setAnnenPart}
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
