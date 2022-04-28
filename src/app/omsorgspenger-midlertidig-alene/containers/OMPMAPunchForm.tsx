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
import { capitalize } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';

import VerticalSpacer from '../../components/VerticalSpacer';
import { JaNeiIkkeRelevant } from '../../models/enums/JaNeiIkkeRelevant';
import { IIdentState } from '../../models/types/IdentState';
import { IJournalposterPerIdentState } from '../../models/types/Journalpost/JournalposterPerIdentState';
import { RootStateType } from '../../state/RootState';
import ErDuSikkerModal from '../../containers/pleiepenger/ErDuSikkerModal';
import OkGaaTilLosModal from '../../containers/pleiepenger/OkGaaTilLosModal';
import SettPaaVentErrorModal from '../../containers/pleiepenger/SettPaaVentErrorModal';
import SettPaaVentModal from '../../containers/pleiepenger/SettPaaVentModal';
import { IOMPMASoknad } from '../types/OMPMASoknad';
import { IPunchOMPMAFormState } from '../types/PunchOMPMAFormState';
import OpplysningerOmOMPMASoknad from './OpplysningerOmSoknad/OpplysningerOmOMPMASoknad';
import { OMPMASoknadKvittering } from './SoknadKvittering/OMPMASoknadKvittering';
import {
    getOMPMASoknad,
    resetOMPMASoknadAction,
    resetPunchOMPMAFormAction,
    submitOMPMASoknad,
    updateOMPMASoknad,
    validerOMPMASoknad,
    validerOMPMASoknadResetAction,
} from '../state/actions/OMPMAPunchFormActions';
import { undoChoiceOfEksisterendeOMPMASoknadAction } from '../state/actions/EksisterendeOMPMASoknaderActions';
import { IOMPMASoknadUt } from '../types/OMPMASoknadUt';
import AnnenForelder from '../components/AnnenForelder';

export interface IPunchOMPMAFormComponentProps {
    journalpostid: string;
    id: string;
    formik: FormikProps<FormikValues>;
    schema: yup.AnyObjectSchema;
}

export interface IPunchOMPMAFormStateProps {
    punchFormState: IPunchOMPMAFormState;
    signaturState: ISignaturState;
    journalposterState: IJournalposterPerIdentState;
    identState: IIdentState;
}

export interface IPunchOMPMAFormDispatchProps {
    getSoknad: typeof getOMPMASoknad;
    resetSoknadAction: typeof resetOMPMASoknadAction;
    setIdentAction: typeof setIdentAction;
    setStepAction: typeof setStepAction;
    undoChoiceOfEksisterendeSoknadAction: typeof undoChoiceOfEksisterendeOMPMASoknadAction;
    updateSoknad: typeof updateOMPMASoknad;
    submitSoknad: typeof submitOMPMASoknad;
    resetPunchFormAction: typeof resetPunchFormAction;
    setSignaturAction: typeof setSignaturAction;
    settJournalpostPaaVent: typeof settJournalpostPaaVent;
    settPaaventResetAction: typeof setJournalpostPaaVentResetAction;
    validateSoknad: typeof validerOMPMASoknad;
    validerSoknadReset: typeof validerOMPMASoknadResetAction;
}

type IPunchOMPMAFormProps = IPunchOMPMAFormComponentProps &
    WrappedComponentProps &
    IPunchOMPMAFormStateProps &
    IPunchOMPMAFormDispatchProps;

const feilFraYup = (schema: yup.AnyObjectSchema, soknad: FormikValues) => {
    try {
        const isValid = schema.validateSync(soknad, { abortEarly: false });
        if (isValid) return [];
    } catch (error) {
        const errors = error.inner.map(
            ({ message, params: { path } }: { message: string; params: { path: string } }) => ({
                message: capitalize(message),
                path,
            })
        );
        return errors;
    }
};

export const PunchOMPMAFormComponent: React.FC<IPunchOMPMAFormProps> = (props) => {
    const [showStatus, setShowStatus] = useState(false);
    const [showSettPaaVentModal, setShowSettPaaVentModal] = useState(false);
    const [visErDuSikkerModal, setVisErDuSikkerModal] = useState(false);
    const [feilmeldingStier, setFeilmeldingStier] = useState(new Set());
    const [harForsoektAaSendeInn, setHarForsoektAaSendeInn] = useState(false);
    const {
        intl,
        punchFormState,
        signaturState,
        schema,
        formik: { values, handleSubmit, errors },
    } = props;
    const { signert } = signaturState;

    useEffect(() => {
        if (showStatus) {
            setTimeout(() => setShowStatus(false), 5000);
        }
    }, [showStatus]);

    const handleSettPaaVent = () => {
        props.settJournalpostPaaVent(props.journalpostid, values.soeknadId!);
        setShowSettPaaVentModal(false);
    };

    const getManglerFromStore = () => {
        return props.punchFormState.inputErrors;
    };

    const getUhaandterteFeil = (attribute: string): (string | undefined)[] => {
        if (!feilmeldingStier.has(attribute)) {
            setFeilmeldingStier(feilmeldingStier.add(attribute));
        }

        const uhaandterteFeilmeldinger = getManglerFromStore()?.filter((m: IInputError) => {
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

    const updateSoknad = (soknad: IOMPMASoknad) => {
        setShowStatus(true);
        const { barn } = props.identState;
        const barnMappet = barn.map((barn) => ({ norskIdent: barn.identitetsnummer }));
        const journalposter = Array.from(soknad?.journalposter || []);

        if (!journalposter.includes(props.journalpostid)) {
            journalposter.push(props.journalpostid);
        }

        if (harForsoektAaSendeInn) {
            props.validateSoknad({ ...soknad, barn: barnMappet, journalposter: journalposter }, true);
        }

        return props.updateSoknad({ ...soknad, barn: barnMappet, journalposter: journalposter });
    };

    const statusetikett = () => {
        if (!showStatus) {
            return null;
        }

        const { punchFormState } = props;
        const className = 'statusetikett';

        if (punchFormState.isAwaitingUpdateResponse) {
            return <EtikettFokus {...{ className }}>Lagrer …</EtikettFokus>;
        }
        if (!!punchFormState.updateSoknadError) {
            return <EtikettAdvarsel {...{ className }}>Lagring feilet</EtikettAdvarsel>;
        }
        return <EtikettSuksess {...{ className }}>Lagret</EtikettSuksess>;
    };

    const harFeilISkjema = (errors: FormikErrors<IOMPMASoknad>) =>
        !![...getUhaandterteFeil(''), ...Object.keys(errors)].length;

    const handleBlur = (callback: () => void, values: IOMPMASoknad) => {
        callback();
        updateSoknad(values);
    };

    return (
        <>
            {statusetikett()}
            <VerticalSpacer sixteenPx />
            <OpplysningerOmOMPMASoknad
                intl={intl}
                setSignaturAction={props.setSignaturAction}
                signert={signert}
                handleBlur={handleBlur}
            />
            <VerticalSpacer fourtyPx />
            <AnnenForelder intl={intl} handleBlur={handleBlur} />
            <VerticalSpacer fourtyPx />
            <p className={'ikkeregistrert'}>{intlHelper(intl, 'skjema.ikkeregistrert')}</p>
            <div className={'flex-container'}>
                <Field name="harMedisinskeOpplysninger">
                    {({ field }: FieldProps<FormikValues>) => (
                        <>
                            <CheckboksPanel
                                id={'medisinskeopplysningercheckbox'}
                                label={intlHelper(intl, 'skjema.medisinskeopplysninger')}
                                checked={!!values.harMedisinskeOpplysninger}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                            />
                            <Hjelpetekst className={'hjelpetext'} type={PopoverOrientering.OverHoyre} tabIndex={-1}>
                                {intlHelper(intl, 'skjema.medisinskeopplysninger.omsorgspenger-ks.hjelpetekst')}
                            </Hjelpetekst>
                        </>
                    )}
                </Field>
            </div>
            <VerticalSpacer eightPx={true} />
            <div className={'flex-container'}>
                <Field name="harInfoSomIkkeKanPunsjes">
                    {({ field }: FieldProps<FormikValues>) => (
                        <>
                            <CheckboksPanel
                                id={'opplysningerikkepunsjetcheckbox'}
                                label={intlHelper(intl, 'skjema.opplysningerikkepunsjet')}
                                checked={!!values.harInfoSomIkkeKanPunsjes}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                            />
                            <Hjelpetekst className={'hjelpetext'} type={PopoverOrientering.OverHoyre} tabIndex={-1}>
                                {intlHelper(intl, 'skjema.opplysningerikkepunsjet.hjelpetekst')}
                            </Hjelpetekst>
                        </>
                    )}
                </Field>
            </div>
            <VerticalSpacer twentyPx={true} />
            {punchFormState.isAwaitingValidateResponse && (
                <div className={classNames('loadingSpinner')}>
                    <NavFrontendSpinner />
                </div>
            )}
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
                            handleSubmit();
                        }}
                    >
                        {intlHelper(intl, 'skjema.knapp.send')}
                    </Knapp>

                    <Knapp className={'vent-knapp'} onClick={() => setShowSettPaaVentModal(true)} disabled={false}>
                        {intlHelper(intl, 'skjema.knapp.settpaavent')}
                    </Knapp>
                </p>
            </div>
            <VerticalSpacer sixteenPx={true} />
            {!!punchFormState.updateSoknadError && (
                <AlertStripeFeil>{intlHelper(intl, 'skjema.feil.ikke_lagret')}</AlertStripeFeil>
            )}
            {!!punchFormState.inputErrors?.length && (
                <AlertStripeFeil className={'valideringstripefeil'}>
                    {intlHelper(intl, 'skjema.feil.validering')}
                </AlertStripeFeil>
            )}
            {!!punchFormState.submitSoknadError && (
                <AlertStripeFeil>{intlHelper(intl, 'skjema.feil.ikke_sendt')}</AlertStripeFeil>
            )}
            {!!punchFormState.submitSoknadConflict && (
                <AlertStripeFeil>{intlHelper(intl, 'skjema.feil.konflikt')}</AlertStripeFeil>
            )}
            {showSettPaaVentModal && (
                <ModalWrapper
                    key={'settpaaventmodal'}
                    className={'settpaaventmodal'}
                    onRequestClose={() => setShowSettPaaVentModal(false)}
                    contentLabel={'settpaaventmodal'}
                    isOpen={showSettPaaVentModal}
                    closeButton={false}
                >
                    <div className="">
                        <SettPaaVentModal
                            journalposter={props.journalposterState.journalposter.filter(
                                (jp) => jp.journalpostId !== props.journalpostid
                            )}
                            soknadId={values.soeknadId}
                            submit={() => handleSettPaaVent()}
                            avbryt={() => setShowSettPaaVentModal(false)}
                        />
                    </div>
                </ModalWrapper>
            )}
            {punchFormState.settPaaVentSuccess && (
                <ModalWrapper
                    key={'settpaaventokmodal'}
                    onRequestClose={() => props.settPaaventResetAction()}
                    contentLabel={'settpaaventokmodal'}
                    closeButton={false}
                    isOpen={punchFormState.settPaaVentSuccess}
                >
                    <OkGaaTilLosModal melding={'modal.settpaavent.til'} />
                </ModalWrapper>
            )}
            {!!punchFormState.settPaaVentError && (
                <ModalWrapper
                    key={'settpaaventerrormodal'}
                    onRequestClose={() => props.settPaaventResetAction()}
                    contentLabel={'settpaaventokmodal'}
                    closeButton={false}
                    isOpen={!!punchFormState.settPaaVentError}
                >
                    <SettPaaVentErrorModal close={() => props.settPaaventResetAction()} />
                </ModalWrapper>
            )}
            {props.punchFormState.isValid && !visErDuSikkerModal && props.punchFormState.validertSoknad && (
                <ModalWrapper
                    key={'validertSoknadModal'}
                    className={'validertSoknadModal'}
                    onRequestClose={() => props.validerSoknadReset()}
                    contentLabel={'validertSoknadModal'}
                    closeButton={false}
                    isOpen={!!props.punchFormState.isValid}
                >
                    <div className={classNames('validertSoknadOppsummeringContainer')}>
                        <OMPMASoknadKvittering intl={intl} response={props.punchFormState.validertSoknad} />
                    </div>
                    <div className={classNames('validertSoknadOppsummeringContainerKnapper')}>
                        <Hovedknapp
                            mini={true}
                            className="validertSoknadOppsummeringContainer_knappVidere"
                            onClick={() => setVisErDuSikkerModal(true)}
                        >
                            {intlHelper(intl, 'fordeling.knapp.videre')}
                        </Hovedknapp>
                        <Knapp
                            mini={true}
                            className="validertSoknadOppsummeringContainer_knappTilbake"
                            onClick={() => props.validerSoknadReset()}
                        >
                            {intlHelper(intl, 'skjema.knapp.avbryt')}
                        </Knapp>
                    </div>
                </ModalWrapper>
            )}
            {visErDuSikkerModal && (
                <ModalWrapper
                    key={'erdusikkermodal'}
                    className={'erdusikkermodal'}
                    onRequestClose={() => props.validerSoknadReset()}
                    contentLabel={'erdusikkermodal'}
                    closeButton={false}
                    isOpen={visErDuSikkerModal}
                >
                    <ErDuSikkerModal
                        melding={'modal.erdusikker.sendinn'}
                        extraInfo={'modal.erdusikker.sendinn.extrainfo'}
                        onSubmit={() => props.submitSoknad(values.soekerId, props.id)}
                        submitKnappText={'skjema.knapp.send'}
                        onClose={() => {
                            props.validerSoknadReset();
                            setVisErDuSikkerModal(false);
                        }}
                    />
                </ModalWrapper>
            )}
        </>
    );
};

const mapStateToProps = (state: RootStateType): IPunchOMPMAFormStateProps => ({
    punchFormState: state.OMSORGSPENGER_MIDLERTIDIG_ALENE.punchFormState,
    signaturState: state.OMSORGSPENGER_MIDLERTIDIG_ALENE.signaturState,
    journalposterState: state.journalposterPerIdentState,
    identState: state.identState,
});

const mapDispatchToProps = (dispatch: any) => ({
    resetSoknadAction: () => dispatch(resetOMPMASoknadAction()),
    setIdentAction: (ident1: string, ident2: string | null) => dispatch(setIdentAction(ident1, ident2)),
    undoChoiceOfEksisterendeSoknadAction: () => dispatch(undoChoiceOfEksisterendeOMPMASoknadAction()),
    updateSoknad: (soknad: Partial<IOMPMASoknadUt>) => dispatch(updateOMPMASoknad(soknad)),
    submitSoknad: (ident: string, soeknadid: string) => dispatch(submitOMPMASoknad(ident, soeknadid)),
    resetPunchFormAction: () => dispatch(resetPunchOMPMAFormAction()),
    setSignaturAction: (signert: JaNeiIkkeRelevant | null) => dispatch(setSignaturAction(signert)),
    settJournalpostPaaVent: (journalpostid: string, soeknadid: string) =>
        dispatch(settJournalpostPaaVent(journalpostid, soeknadid)),
    settPaaventResetAction: () => dispatch(setJournalpostPaaVentResetAction()),
    validateSoknad: (soknad: IOMPMASoknadUt, erMellomlagring: boolean) =>
        dispatch(validerOMPMASoknad(soknad, erMellomlagring)),
    validerSoknadReset: () => dispatch(validerOMPMASoknadResetAction()),
});

export const OMPMAPunchForm = injectIntl(connect(mapStateToProps, mapDispatchToProps)(PunchOMPMAFormComponent));
/* eslint-enable */
