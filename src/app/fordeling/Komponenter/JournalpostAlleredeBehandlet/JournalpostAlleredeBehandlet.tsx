import React, { useEffect, useRef, useState } from 'react';
import { Dispatch } from 'redux';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Button } from '@navikt/ds-react';

import { IdentRules } from 'app/validation';
import { RootStateType } from 'app/state/RootState';
import { setAnnenPartAction, setIdentFellesAction } from 'app/state/actions/IdentActions';

import PunsjInnsendingType from 'app/models/enums/PunsjInnsendingType';
import {
    getJournalpostKopiereErrorResetAction,
    kopierJournalpostRedux,
    resetBarnAction,
} from 'app/state/reducers/FellesReducer';
import { hentBarn } from 'app/state/reducers/HentBarn';
import { getEnvironmentVariable, getForkortelseFraFordelingDokumenttype } from 'app/utils';

import JournalPostKopiFelmeldinger from '../JournalPostKopiFelmeldinger';
import Pleietrengende from '../Pleietrengende';

import { FordelingDokumenttype } from 'app/models/enums';
import { setDokumenttypeAction } from 'app/state/actions';
import DokumentTypeVelgerForKopiering from '../DokumentTypeVelgerForKopiering';
import ValgAvBehandlingsÅr from '../ValgAvBehandlingsÅr';
import AnnenPart from '../AnnenPart';
import ToSøkere from '../ToSøkere';
import { useNavigate } from 'react-router';
import { ROUTES } from 'app/constants/routes';

const JournalpostAlleredeBehandlet: React.FC = () => {
    const [visKanIkkeKopiere, setVisKanIkkeKopiere] = useState(false);
    const [behandlingsAar, setBehandlingsAar] = useState<string | undefined>(undefined);
    const [toSokereIJournalpost, setToSokereIJournalpost] = useState<boolean>(false);

    const navigate = useNavigate();

    const dispatch = useDispatch<Dispatch<any>>();

    const setIdentAction = (søkerId: string, pleietrengendeId?: string, annenSokerIdent?: string) =>
        dispatch(setIdentFellesAction(søkerId, pleietrengendeId, annenSokerIdent));
    const setAnnenPart = (annenPart: string) => dispatch(setAnnenPartAction(annenPart));
    const setDokumenttype = (dokumenttype?: FordelingDokumenttype) => dispatch(setDokumenttypeAction(dokumenttype));
    const resetBarn = () => dispatch(resetBarnAction());
    const kopiereErrorReset = () => dispatch(getJournalpostKopiereErrorResetAction());
    const henteBarn = (søkerId: string) => dispatch(hentBarn(søkerId));

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

    const isSammeIdenter =
        (søkerId && søkerId === pleietrengendeId) ||
        (søkerId && søkerId === annenSokerIdent) ||
        (søkerId && søkerId === identState.annenPart) ||
        (pleietrengendeId && pleietrengendeId === annenSokerIdent) ||
        (pleietrengendeId && pleietrengendeId === identState.annenPart) ||
        (annenSokerIdent && annenSokerIdent === identState.annenPart);

    const isKopierButtonDisabled =
        !fordelingState.dokumenttype ||
        fordelingState.dokumenttype === FordelingDokumenttype.OMSORGSPENGER ||
        (isDokumenttypeMedPleietrengende && IdentRules.erUgyldigIdent(pleietrengendeId)) ||
        (isDokumenttypeMedBehandlingsår && !behandlingsAar) ||
        (isDokumenttypeMedAnnenPart && IdentRules.erUgyldigIdent(identState.annenPart)) ||
        isSammeIdenter ||
        kopierJournalpostSuccess;

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
                    dedupKey,
                    toSokereIJournalpost ? annenSokerIdent! : søkerId,
                    journalpost?.journalpostId,
                    ytelseForKopiering,
                    pleietrengendeId && pleietrengendeId.length > 0 ? pleietrengendeId : undefined,
                    isDokumenttypeMedBehandlingsår && behandlingsAar ? Number(behandlingsAar) : undefined,
                    isDokumenttypeMedAnnenPart ? identState.annenPart : undefined,
                ),
            );
        }
    };

    const handleGåToLOS = () => {
        window.location.href = getEnvironmentVariable('K9_LOS_URL');
    };

    const handleGåToSendBrev = () => {
        // Redirect to brev side
        navigate(
            `${ROUTES.JOURNALPOST_ROOT.replace(':journalpostid/*', journalpost.journalpostId)}/${ROUTES.BREV_BEHANDLET_JP}`,
        );
    };

    const visPleietrengende = !kopierJournalpostSuccess && isDokumenttypeMedPleietrengende;

    const skalHenteBarn =
        fordelingState.dokumenttype !== FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE &&
        fordelingState.dokumenttype !== FordelingDokumenttype.OMSORGSPENGER_MA &&
        fordelingState.dokumenttype !== FordelingDokumenttype.OMSORGSPENGER_UT &&
        fordelingState.dokumenttype !== FordelingDokumenttype.KORRIGERING_IM;

    const sendBrevDisabled =
        !fellesState.journalpost?.sak?.sakstype &&
        (!fordelingState.dokumenttype || fordelingState.dokumenttype === FordelingDokumenttype.OMSORGSPENGER);

    return (
        <>
            <div className="p-4">
                <Alert variant="info" data-test-id="infoJournalpostAlleredeBehandlet">
                    <FormattedMessage id="fordeling.journalpostAlleredeBehandlet.kanIkkeSendeInn.info" />
                </Alert>

                {!fellesState.journalpost?.sak?.sakstype && (
                    <Alert variant="warning" data-test-id="infoJournalpostAlleredeBehandlet">
                        <FormattedMessage id="fordeling.journalpostAlleredeBehandlet.sendBrevInfo" />
                    </Alert>
                )}
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
                            setIdentAction(søkerId, undefined, annenSokerIdent || '');
                            resetBarn();
                        }
                    }}
                    valgtDokumentType={fordelingState.dokumenttype as string}
                />

                <ToSøkere
                    journalpost={journalpost}
                    identState={identState}
                    toSokereIJournalpost={toSokereIJournalpost}
                    setIdentAction={setIdentAction}
                    setToSokereIJournalpost={setToSokereIJournalpost}
                    dokumenttype={fordelingState.dokumenttype}
                />

                <div className="mt-4">
                    <Pleietrengende
                        identState={identState}
                        fellesState={fellesState}
                        toSokereIJournalpost={false}
                        skalHenteBarn={skalHenteBarn}
                        visPleietrengende={visPleietrengende}
                        setIdentAction={setIdentAction}
                        henteBarn={henteBarn}
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
                    data-test-id="kopierJournalpostBtn"
                >
                    <FormattedMessage id="fordeling.journalpostAlleredeBehandlet.kopierJournalpost.btn" />
                </Button>

                {!!kopierJournalpostSuccess && (
                    <Button onClick={handleGåToLOS} size="small">
                        <FormattedMessage id="fordeling.journalpostAlleredeBehandlet.tilbakeTilLOS.btn" />
                    </Button>
                )}

                <Button
                    variant="secondary"
                    size="small"
                    onClick={handleGåToSendBrev}
                    data-test-id="sendBrevLenkeBtn"
                    type="button"
                    disabled={sendBrevDisabled}
                >
                    <FormattedMessage id="fordeling.journalpostAlleredeBehandlet.sendBrevLenke.btn" />
                </Button>
            </div>
        </>
    );
};

export default JournalpostAlleredeBehandlet;
