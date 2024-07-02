import classNames from 'classnames';
import { Field, FieldProps, FormikProps, FormikValues } from 'formik';
import { CheckboksPanel } from 'nav-frontend-skjema';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';
import * as yup from 'yup';

import { Alert, Loader, Button, ErrorSummary, Heading, HelpText, Modal, Tag } from '@navikt/ds-react';

import Personvelger from 'app/components/person-velger/Personvelger';
import { IInputError, ISignaturState } from 'app/models/types';
import { resetPunchFormAction, setSignaturAction } from 'app/state/actions';
import { capitalize } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';

import JournalposterSync from 'app/components/JournalposterSync';
import VerticalSpacer from 'app/components/vertical-spacer/VerticalSpacer';
import ErDuSikkerModal from 'app/components/ErDuSikkerModal';
import { OkGaaTilLosModal } from 'app/components/gå-til-los-modal/OkGaaTilLosModal';
import SettPaaVentErrorModal from 'app/components/sett-på-vent-modal/SettPaaVentErrorModal';
import SettPaaVentModal from 'app/components/sett-på-vent-modal/SettPaaVentModal';
import { JaNeiIkkeRelevant } from 'app/models/enums/JaNeiIkkeRelevant';
import { IIdentState } from 'app/models/types/IdentState';
import { IJournalposterPerIdentState } from 'app/models/types/Journalpost/JournalposterPerIdentState';
import { RootStateType } from 'app/state/RootState';
import AnnenForelder from '../components/AnnenForelder';
import { undoChoiceOfEksisterendeOMPMASoknadAction } from '../state/actions/EksisterendeOMPMASoknaderActions';
import {
    getOMPMASoknad,
    resetOMPMASoknadAction,
    resetPunchOMPMAFormAction,
    setJournalpostPaaVentResetAction,
    settJournalpostPaaVent,
    submitOMPMASoknad,
    updateOMPMASoknad,
    validerOMPMASoknad,
    validerOMPMASoknadResetAction,
} from '../state/actions/OMPMAPunchFormActions';
import { IOMPMASoknad, OMPMASoknad } from '../types/OMPMASoknad';
import { IOMPMASoknadUt } from '../types/OMPMASoknadUt';
import { IPunchOMPMAFormState } from '../types/PunchOMPMAFormState';
import OpplysningerOmOMPMASoknad from './OpplysningerOmSoknad/OpplysningerOmOMPMASoknad';
import { OMPMASoknadKvittering } from './SoknadKvittering/OMPMASoknadKvittering';

export interface IPunchOMPMAFormComponentProps {
    journalpostid: string;
    id: string;
    formik: FormikProps<IOMPMASoknad>;
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
    updateSoknad: typeof updateOMPMASoknad;
    submitSoknad: typeof submitOMPMASoknad;
    resetPunchFormAction: typeof resetPunchFormAction;
    setSignaturAction: typeof setSignaturAction;
    settJournalpostPaaVent: typeof settJournalpostPaaVent;
    settPaaventResetAction: typeof setJournalpostPaaVentResetAction;
    validateSoknad: typeof validerOMPMASoknad;
    validerSoknadReset: typeof validerOMPMASoknadResetAction;
}

type IPunchOMPMAFormProps = IPunchOMPMAFormComponentProps & IPunchOMPMAFormStateProps & IPunchOMPMAFormDispatchProps;

const feilFraYup = (schema: yup.AnyObjectSchema, soknad: FormikValues) => {
    try {
        const isValid = schema.validateSync(soknad, { abortEarly: false });
        if (isValid) return [];
        // TODO: Fiks denne
        return [];
    } catch (error) {
        const errors = error.inner.map(
            ({ message, params: { path } }: { message: string; params: { path: string } }) => ({
                message: capitalize(message),
                path,
            }),
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
        punchFormState,
        signaturState,
        schema,
        formik: { values, handleSubmit, errors },
    } = props;
    const { signert } = signaturState;
    const intl = useIntl();

    const updateSoknad = (soknad: IOMPMASoknad) => {
        setShowStatus(true);
        const barnMappet = soknad.barn.map((barn) => ({ norskIdent: barn.norskIdent, foedselsdato: '' }));
        const journalposter = Array.from(soknad?.journalposter || []);

        if (!journalposter.includes(props.journalpostid)) {
            journalposter.push(props.journalpostid);
        }
        if (harForsoektAaSendeInn) {
            props.validateSoknad({ ...soknad, barn: barnMappet, journalposter }, true);
        }

        return props.updateSoknad({ ...soknad, barn: barnMappet, journalposter });
    };

    useEffect(() => {
        if (showStatus) {
            setTimeout(() => setShowStatus(false), 5000);
        }
    }, [showStatus]);

    const handleSettPaaVent = () => {
        props.settJournalpostPaaVent(props.journalpostid, values.soeknadId!);
        setShowSettPaaVentModal(false);
    };

    const getManglerFromStore = () => props.punchFormState.inputErrors;

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

    const statusetikett = () => {
        if (!showStatus) {
            return null;
        }

        const className = 'statusetikett';

        if (punchFormState.isAwaitingUpdateResponse) {
            return (
                <Tag variant="warning" {...{ className }}>
                    Lagrer …
                </Tag>
            );
        }
        if (punchFormState.updateSoknadError) {
            return (
                <Tag variant="error" {...{ className }}>
                    Lagring feilet
                </Tag>
            );
        }
        return (
            <Tag variant="success" {...{ className }}>
                Lagret
            </Tag>
        );
    };

    const harFeilISkjema = () => !![...getUhaandterteFeil(''), ...Object.keys(errors)].length;

    // valuesFromOnBlur er nødvendig på grunn av DateInput, hvor variabelen i formik ikke oppdateres før onBlur kalles
    const handleBlur = (callback: () => void = () => {}, valuesFromOnBlur: Partial<OMPMASoknad> = {}) => {
        callback();
        updateSoknad({ ...values, ...valuesFromOnBlur });
    };

    return (
        <>
            <JournalposterSync journalposter={values.journalposter} />

            {statusetikett()}
            <VerticalSpacer sixteenPx />
            <OpplysningerOmOMPMASoknad
                intl={intl}
                setSignaturAction={props.setSignaturAction}
                signert={signert}
                handleBlur={handleBlur}
            />
            <VerticalSpacer fourtyPx />
            <Heading size="xsmall" spacing>
                Barn
            </Heading>
            <Personvelger
                name="barn"
                handleBlur={handleBlur}
                sokersIdent={values.soekerId}
                populerMedBarn={!values.barn.length}
            />
            <VerticalSpacer fourtyPx />
            <AnnenForelder intl={intl} handleBlur={handleBlur} />
            <VerticalSpacer fourtyPx />
            <p className="ikkeregistrert">{intlHelper(intl, 'skjema.ikkeregistrert')}</p>
            <div className="flex-container">
                <Field name="harMedisinskeOpplysninger">
                    {({ field }: FieldProps<FormikValues>) => (
                        <>
                            <CheckboksPanel
                                id="medisinskeopplysningercheckbox"
                                label={intlHelper(intl, 'skjema.medisinskeopplysninger')}
                                checked={!!values.harMedisinskeOpplysninger}
                                {...field}
                                onChange={(e) => handleBlur(() => field.onChange(e))}
                                value=""
                            />
                            <HelpText className="hjelpetext" placement="top-end">
                                {intlHelper(intl, 'skjema.medisinskeopplysninger.omsorgspenger-ks.hjelpetekst')}
                            </HelpText>
                        </>
                    )}
                </Field>
            </div>
            <VerticalSpacer eightPx />
            <div className="flex-container">
                <Field name="harInfoSomIkkeKanPunsjes">
                    {({ field }: FieldProps<FormikValues>) => (
                        <>
                            <CheckboksPanel
                                id="opplysningerikkepunsjetcheckbox"
                                label={intlHelper(intl, 'skjema.opplysningerikkepunsjet')}
                                checked={!!values.harInfoSomIkkeKanPunsjes}
                                {...field}
                                onChange={(e) => handleBlur(() => field.onChange(e))}
                                value=""
                            />
                            <HelpText className="hjelpetext" placement="top-end">
                                {intlHelper(intl, 'skjema.opplysningerikkepunsjet.hjelpetekst')}
                            </HelpText>
                        </>
                    )}
                </Field>
            </div>
            <VerticalSpacer twentyPx />
            {punchFormState.isAwaitingValidateResponse && (
                <div className={classNames('loadingSpinner')}>
                    <Loader size="large" />
                </div>
            )}
            {harForsoektAaSendeInn && harFeilISkjema() && (
                <ErrorSummary heading="Du må fikse disse feilene før du kan sende inn punsjemeldingen.">
                    {getUhaandterteFeil('').map((feilmelding) => (
                        <ErrorSummary.Item key={feilmelding}>{feilmelding}</ErrorSummary.Item>
                    ))}
                    {feilFraYup(schema, values).map((error: { message: string; path: string }) => (
                        <ErrorSummary.Item key={`${error.path}-${error.message}`}>{error.message}</ErrorSummary.Item>
                    ))}
                </ErrorSummary>
            )}
            <div className="submit-knapper">
                <p className="sendknapp-wrapper">
                    <Button
                        variant="secondary"
                        className="send-knapp"
                        onClick={() => {
                            if (!harForsoektAaSendeInn) {
                                setHarForsoektAaSendeInn(true);
                            }
                            handleSubmit();
                        }}
                    >
                        {intlHelper(intl, 'skjema.knapp.send')}
                    </Button>

                    <Button
                        variant="secondary"
                        className="vent-knapp"
                        onClick={() => setShowSettPaaVentModal(true)}
                        disabled={false}
                    >
                        {intlHelper(intl, 'skjema.knapp.settpaavent')}
                    </Button>
                </p>
            </div>
            <VerticalSpacer sixteenPx />
            {!!punchFormState.updateSoknadError && (
                <Alert size="small" variant="error">
                    {intlHelper(intl, 'skjema.feil.ikke_lagret')}
                </Alert>
            )}
            {!!punchFormState.inputErrors?.length && (
                <Alert size="small" variant="error" className="valideringstripefeil">
                    {intlHelper(intl, 'skjema.feil.validering')}
                </Alert>
            )}
            {!!punchFormState.submitSoknadError && (
                <Alert size="small" variant="error">
                    {intlHelper(intl, 'skjema.feil.ikke_sendt')}
                </Alert>
            )}
            {!!punchFormState.submitSoknadConflict && (
                <Alert size="small" variant="error">
                    {intlHelper(intl, 'skjema.feil.konflikt')}
                </Alert>
            )}
            {showSettPaaVentModal && (
                <Modal
                    key="settpaaventmodal"
                    className="settpaaventmodal"
                    onClose={() => setShowSettPaaVentModal(false)}
                    aria-label="settpaaventmodal"
                    open={showSettPaaVentModal}
                >
                    <div className="">
                        <SettPaaVentModal
                            journalposter={props.journalposterState.journalposter.filter(
                                (jp) => jp.journalpostId !== props.journalpostid,
                            )}
                            soknadId={values.soeknadId}
                            submit={() => handleSettPaaVent()}
                            avbryt={() => setShowSettPaaVentModal(false)}
                        />
                    </div>
                </Modal>
            )}
            {punchFormState.settPaaVentSuccess && (
                <Modal
                    key="settpaaventokmodal"
                    onClose={() => props.settPaaventResetAction()}
                    aria-label="settpaaventokmodal"
                    open={punchFormState.settPaaVentSuccess}
                >
                    <OkGaaTilLosModal melding="modal.settpaavent.til" />
                </Modal>
            )}
            {!!punchFormState.settPaaVentError && (
                <Modal
                    key="settpaaventerrormodal"
                    onClose={() => props.settPaaventResetAction()}
                    aria-label="settpaaventokmodal"
                    open={!!punchFormState.settPaaVentError}
                >
                    <SettPaaVentErrorModal close={() => props.settPaaventResetAction()} />
                </Modal>
            )}
            {props.punchFormState.isValid && !visErDuSikkerModal && props.punchFormState.validertSoknad && (
                <Modal
                    key="validertSoknadModal"
                    className="validertSoknadModal"
                    onClose={() => props.validerSoknadReset()}
                    aria-label="validertSoknadModal"
                    open={!!props.punchFormState.isValid}
                >
                    <Modal.Body>
                        <div className={classNames('validertSoknadOppsummeringContainer')}>
                            <OMPMASoknadKvittering response={props.punchFormState.validertSoknad} />
                        </div>
                        <div className={classNames('validertSoknadOppsummeringContainerKnapper')}>
                            <Button
                                size="small"
                                className="validertSoknadOppsummeringContainer_knappVidere"
                                onClick={() => setVisErDuSikkerModal(true)}
                            >
                                {intlHelper(intl, 'fordeling.knapp.videre')}
                            </Button>
                            <Button
                                variant="secondary"
                                size="small"
                                className="validertSoknadOppsummeringContainer_knappTilbake"
                                onClick={() => props.validerSoknadReset()}
                            >
                                {intlHelper(intl, 'skjema.knapp.avbryt')}
                            </Button>
                        </div>
                    </Modal.Body>
                </Modal>
            )}
            {visErDuSikkerModal && (
                <Modal
                    key="erdusikkermodal"
                    className="erdusikkermodal"
                    onClose={() => props.validerSoknadReset()}
                    aria-label="erdusikkermodal"
                    open={visErDuSikkerModal}
                >
                    <ErDuSikkerModal
                        melding="modal.erdusikker.sendinn"
                        extraInfo="modal.erdusikker.sendinn.extrainfo"
                        onSubmit={() => props.submitSoknad(values.soekerId, props.id)}
                        submitKnappText="skjema.knapp.send"
                        onClose={() => {
                            props.validerSoknadReset();
                            setVisErDuSikkerModal(false);
                        }}
                    />
                </Modal>
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

export const OMPMAPunchForm = connect(mapStateToProps, mapDispatchToProps)(PunchOMPMAFormComponent);
