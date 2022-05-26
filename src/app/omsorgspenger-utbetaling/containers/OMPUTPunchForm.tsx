/* eslint-disable */
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Field, FieldProps, FormikErrors, FormikProps, FormikValues } from 'formik';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { connect } from 'react-redux';
import classNames from 'classnames';
import * as yup from 'yup';

import { AlertStripeFeil } from 'nav-frontend-alertstriper';
import { EtikettAdvarsel, EtikettFokus, EtikettSuksess } from 'nav-frontend-etiketter';
import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import ModalWrapper from 'nav-frontend-modal';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { ErrorSummary } from '@navikt/ds-react';
import { CheckboksPanel } from 'nav-frontend-skjema';
import Hjelpetekst from 'nav-frontend-hjelpetekst';
import { PopoverOrientering } from 'nav-frontend-popover';

import { IInputError, ISignaturState } from 'app/models/types';
import {
    resetPunchFormAction,
    setIdentAction,
    setJournalpostPaaVentResetAction,
    setSignaturAction,
    setStepAction,
    settJournalpostPaaVent,
} from 'app/state/actions';
import intlHelper from 'app/utils/intlUtils';

import VerticalSpacer from '../../components/VerticalSpacer';
import { JaNeiIkkeRelevant } from '../../models/enums/JaNeiIkkeRelevant';
import { IIdentState } from '../../models/types/IdentState';
import { IJournalposterPerIdentState } from '../../models/types/Journalpost/JournalposterPerIdentState';
import { RootStateType } from '../../state/RootState';
import ErDuSikkerModal from '../../containers/pleiepenger/ErDuSikkerModal';
import { IOMPUTSoknad } from '../types/OMPUTSoknad';
import { IPunchOMPUTFormState } from '../types/PunchOMPUTFormState';
import OpplysningerOmOMPUTSoknad from './OpplysningerOmSoknad/OpplysningerOmOMPUTSoknad';
import { OMPUTSoknadKvittering } from './SoknadKvittering/OMPUTSoknadKvittering';
import {
    getOMPUTSoknad,
    resetOMPUTSoknadAction,
    submitOMPUTSoknad,
    updateOMPUTSoknad,
    validerOMPUTSoknad,
    validerOMPUTSoknadResetAction,
} from '../state/actions/OMPUTPunchFormActions';
import { IOMPUTSoknadUt } from '../types/OMPUTSoknadUt';
import { useMutation } from 'react-query';
import MellomlagringEtikett from 'app/components/mellomlagringEtikett/MellomlagringEtikett';
import { Feil, ValideringResponse } from 'app/models/types/ValideringResponse';
import { feilFraYup } from 'app/utils/validationHelpers';
import { oppdaterSoeknad, validerSoeknad } from '../api';
import VentModal from 'app/components/ventModal/VentModal';
import ForhaandsvisSoeknadModal from 'app/components/forhaandsvisSoeknadModal/ForhaandsvisSoeknadModal';
import IkkeRegistrerteOpplysninger from 'app/components/ikkeRegisterteOpplysninger/IkkeRegistrerteOpplysninger';

export interface IPunchOMPUTFormComponentProps {
    journalpostid: string;
    id: string;
    formik: FormikProps<IOMPUTSoknad>;
    schema: yup.AnyObjectSchema;
    visForhaandsvisModal: boolean;
    setVisForhaandsvisModal: (vis: boolean) => void;
    soeknadTilForhaandsvisning: any;
    k9FormatErrors: Feil[];
    setK9FormatErrors: (feil: Feil[]) => void;
}

export interface IPunchOMPUTFormStateProps {
    punchFormState: IPunchOMPUTFormState;
    signaturState: ISignaturState;
    journalposterState: IJournalposterPerIdentState;
    identState: IIdentState;
}

export interface IPunchOMPUTFormDispatchProps {
    getSoknad: typeof getOMPUTSoknad;
    resetSoknadAction: typeof resetOMPUTSoknadAction;
    setIdentAction: typeof setIdentAction;
    setStepAction: typeof setStepAction;
    updateSoknad: typeof updateOMPUTSoknad;
    submitSoknad: typeof submitOMPUTSoknad;
    resetPunchFormAction: typeof resetPunchFormAction;
    setSignaturAction: typeof setSignaturAction;
    settJournalpostPaaVent: typeof settJournalpostPaaVent;
    settPaaventResetAction: typeof setJournalpostPaaVentResetAction;
    validateSoknad: typeof validerOMPUTSoknad;
    validerSoknadReset: typeof validerOMPUTSoknadResetAction;
}

type IPunchOMPUTFormProps = IPunchOMPUTFormComponentProps &
    WrappedComponentProps &
    IPunchOMPUTFormStateProps &
    IPunchOMPUTFormDispatchProps;

export const PunchOMPUTFormComponent: React.FC<IPunchOMPUTFormProps> = (props) => {
    const [harMellomlagret, setHarMellomlagret] = useState(false);
    const [visVentModal, setVisVentModal] = useState(false);
    const [visErDuSikkerModal, setVisErDuSikkerModal] = useState(false);
    const [feilmeldingStier, setFeilmeldingStier] = useState(new Set());
    const [harForsoektAaSendeInn, setHarForsoektAaSendeInn] = useState(false);
    const {
        intl,
        signaturState,
        schema,
        identState,
        visForhaandsvisModal,
        setVisForhaandsvisModal,
        punchFormState,
        soeknadTilForhaandsvisning,
        k9FormatErrors,
        setK9FormatErrors,
        journalpostid,
        formik: { values, errors },
    } = props;
    const { signert } = signaturState;

    useEffect(() => {
        setIdentAction(values.soekerId);
    }, [values.soekerId]);

    useEffect(() => {
        if (harMellomlagret) {
            setTimeout(() => setHarMellomlagret(false), 5000);
        }
    }, [harMellomlagret]);

    const { isLoading: validerer, mutate: valider } = useMutation(() => validerSoeknad(values, identState.ident1), {
        onSuccess: (data: ValideringResponse | IOMPUTSoknad) => {
            if (data?.feil?.length) setK9FormatErrors(data?.feil);
        },
    });

    const {
        isLoading: mellomlagrer,
        error: mellomlagringError,
        mutate: mellomlagreSoeknad,
    } = useMutation(() => oppdaterSoeknad(values));

    const getUhaandterteFeil = (attribute: string): (string | undefined)[] => {
        if (!feilmeldingStier.has(attribute)) {
            setFeilmeldingStier(feilmeldingStier.add(attribute));
        }

        const uhaandterteFeilmeldinger = k9FormatErrors?.filter((m: IInputError) => {
            const felter = m.felt?.split('.') || [];
            for (let index = felter.length - 1; index >= -1; index--) {
                const felt = felter.slice(0, index + 1).join('.');
                const andreFeilmeldingStier = new Set(feilmeldingStier);
                andreFeilmeldingStier.delete(attribute);
                if (attribute === felt) {
                    return true;
                }
                if (andreFeilmeldingStier.has(felt)) {
                    return false;
                }
            }
            return false;
        });

        if (uhaandterteFeilmeldinger && uhaandterteFeilmeldinger?.length > 0) {
            return uhaandterteFeilmeldinger.map((error) => error.feilmelding).filter(Boolean);
        }
        return [];
    };

    const updateSoknad = (soknad: IOMPUTSoknad) => {
        const journalposter = Array.from(soknad?.journalposter || []);

        if (!journalposter.includes(props.journalpostid)) {
            journalposter.push(props.journalpostid);
        }
        // legg inn journalposter som mangler
        if (harForsoektAaSendeInn) {
            valider();
        }

        return mellomlagreSoeknad();
    };

    const harFeilISkjema = (errors: FormikErrors<IOMPUTSoknad>) =>
        !![...getUhaandterteFeil(''), ...Object.keys(errors)].length;

    const handleBlur = (callback: () => void) => {
        callback();
        updateSoknad(values);
    };

    return (
        <>
            <MellomlagringEtikett lagrer={mellomlagrer} lagret={harMellomlagret} error={!!mellomlagringError} />
            <VerticalSpacer sixteenPx />
            <OpplysningerOmOMPUTSoknad
                intl={intl}
                setSignaturAction={props.setSignaturAction}
                signert={signert}
                handleBlur={handleBlur}
            />
            <VerticalSpacer fourtyPx />
            <VerticalSpacer fourtyPx />
            <IkkeRegistrerteOpplysninger intl={intl} handleBlur={handleBlur} />
            <VerticalSpacer twentyPx={true} />
            {harForsoektAaSendeInn && harFeilISkjema(errors) && (
                <ErrorSummary heading="Du må fikse disse feilene før du kan sende inn punsjemeldingen.">
                    {getUhaandterteFeil('').map((feilmelding) => {
                        return <ErrorSummary.Item key={feilmelding}>{feilmelding}</ErrorSummary.Item>;
                    })}
                    {feilFraYup(schema, values).map((error: { message: string; path: string }) => {
                        return (
                            <ErrorSummary.Item key={`${error.path}-${error.message}`}>
                                {error.message}
                            </ErrorSummary.Item>
                        );
                    })}
                </ErrorSummary>
            )}
            <div className={'submit-knapper'}>
                <p className="sendknapp-wrapper">
                    <Knapp
                        className={'send-knapp'}
                        onClick={() => {
                            if (!harForsoektAaSendeInn) {
                                setHarForsoektAaSendeInn(true);
                            }

                            valider();
                        }}
                    >
                        {intlHelper(intl, 'skjema.knapp.send')}
                    </Knapp>

                    <Knapp className={'vent-knapp'} onClick={() => setVisVentModal(true)} disabled={false}>
                        {intlHelper(intl, 'skjema.knapp.settpaavent')}
                    </Knapp>
                </p>
            </div>
            <VerticalSpacer sixteenPx={true} />
            {!!punchFormState.updateSoknadError && (
                <AlertStripeFeil>{intlHelper(intl, 'skjema.feil.ikke_lagret')}</AlertStripeFeil>
            )}
            {!!punchFormState.submitSoknadError && (
                <AlertStripeFeil>{intlHelper(intl, 'skjema.feil.ikke_sendt')}</AlertStripeFeil>
            )}
            {!!punchFormState.submitSoknadConflict && (
                <AlertStripeFeil>{intlHelper(intl, 'skjema.feil.konflikt')}</AlertStripeFeil>
            )}
            {visVentModal && (
                <VentModal journalpostId={journalpostid} soeknadId={values.soeknadId} visModalFn={setVisVentModal} />
            )}
            {visForhaandsvisModal && (
                <ForhaandsvisSoeknadModal
                    avbryt={() => setVisForhaandsvisModal(false)}
                    videre={() => {
                        setVisForhaandsvisModal(false);
                        setVisErDuSikkerModal(true);
                    }}
                    intl={intl}
                >
                    <OMPUTSoknadKvittering intl={intl} response={soeknadTilForhaandsvisning} />
                </ForhaandsvisSoeknadModal>
            )}

            {visErDuSikkerModal && (
                <ModalWrapper
                    key={'erdusikkermodal'}
                    className={'erdusikkermodal'}
                    onRequestClose={() => setVisErDuSikkerModal(false)}
                    contentLabel={'erdusikkermodal'}
                    closeButton={false}
                    isOpen={visErDuSikkerModal}
                >
                    <ErDuSikkerModal
                        melding={'modal.erdusikker.sendinn'}
                        extraInfo={'modal.erdusikker.sendinn.extrainfo'}
                        onSubmit={() => {
                            throw Error('vennligst implementer meg. hilsen onSubmit');
                        }}
                        submitKnappText={'skjema.knapp.send'}
                        onClose={() => {
                            setVisErDuSikkerModal(false);
                        }}
                    />
                </ModalWrapper>
            )}
        </>
    );
};

const mapStateToProps = (state: RootStateType): IPunchOMPUTFormStateProps => ({
    punchFormState: state.OMSORGSPENGER_MIDLERTIDIG_ALENE.punchFormState,
    signaturState: state.OMSORGSPENGER_MIDLERTIDIG_ALENE.signaturState,
    journalposterState: state.journalposterPerIdentState,
    identState: state.identState,
});

const mapDispatchToProps = (dispatch: any) => ({
    updateSoknad: (soknad: Partial<IOMPUTSoknadUt>) => dispatch(updateOMPUTSoknad(soknad)),
    submitSoknad: (ident: string, soeknadid: string) => dispatch(submitOMPUTSoknad(ident, soeknadid)),
    setSignaturAction: (signert: JaNeiIkkeRelevant | null) => dispatch(setSignaturAction(signert)),
    settJournalpostPaaVent: (journalpostid: string, soeknadid: string) =>
        dispatch(settJournalpostPaaVent(journalpostid, soeknadid)),
    settPaaventResetAction: () => dispatch(setJournalpostPaaVentResetAction()),
    validateSoknad: (soknad: IOMPUTSoknadUt, erMellomlagring: boolean) =>
        dispatch(validerOMPUTSoknad(soknad, erMellomlagring)),
    validerSoknadReset: () => dispatch(validerOMPUTSoknadResetAction()),
});

export const OMPUTPunchForm = injectIntl(connect(mapStateToProps, mapDispatchToProps)(PunchOMPUTFormComponent));
/* eslint-enable */
