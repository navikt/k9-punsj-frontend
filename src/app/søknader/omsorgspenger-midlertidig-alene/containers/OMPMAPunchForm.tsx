import React, { useEffect, useState } from 'react';

import classNames from 'classnames';
import { Field, FieldProps, FormikProps, FormikValues } from 'formik';
import { CheckboksPanel } from 'nav-frontend-skjema';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';
import { Dispatch } from 'redux';

import { Alert, Loader, Button, ErrorSummary, Heading, HelpText, Modal, Tag } from '@navikt/ds-react';

import Personvelger from 'app/components/person-velger/Personvelger';
import { IInputError } from 'app/models/types';
import { setSignaturAction } from 'app/state/actions';
import { capitalize } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';

import JournalposterSync from 'app/components/JournalposterSync';
import VerticalSpacer from '../../../components/VerticalSpacer';
import ErDuSikkerModal from 'app/components/ErDuSikkerModal';
import OkGåTilLosModal from 'app/components/okGåTilLosModal/OkGåTilLosModal';
import SettPaaVentModal from 'app/components/settPåVentModal/SettPåVentModal';
import { JaNeiIkkeRelevant } from '../../../models/enums/JaNeiIkkeRelevant';
import { RootStateType } from '../../../state/RootState';
import AnnenForelder from '../components/AnnenForelder';

import {
    setJournalpostPaaVentResetAction,
    settJournalpostPaaVent,
    submitOMPMASoknad,
    updateOMPMASoknad,
    validerOMPMASoknad,
    validerOMPMASoknadResetAction,
} from '../state/actions/OMPMAPunchFormActions';
import { IOMPMASoknad, OMPMASoknad } from '../types/OMPMASoknad';
import { IOMPMASoknadUt } from '../types/OMPMASoknadUt';
import OpplysningerOmOMPMASoknad from '../components/OpplysningerOmOMPMASoknad';
import OMPMASoknadKvittering from '../components/OMPMASoknadKvittering';
import ErrorModal from 'app/fordeling/Komponenter/ErrorModal';

interface Props {
    journalpostid: string;
    id: string;
    formik: FormikProps<IOMPMASoknad>;
    schema: yup.AnyObjectSchema;
}

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

export const OMPMAPunchForm: React.FC<Props> = ({
    journalpostid,
    id,
    schema,
    formik: { values, handleSubmit, errors },
}: Props) => {
    const intl = useIntl();

    const dispatch = useDispatch<Dispatch<any>>();

    const [showStatus, setShowStatus] = useState(false);
    const [showSettPaaVentModal, setShowSettPaaVentModal] = useState(false);
    const [visErDuSikkerModal, setVisErDuSikkerModal] = useState(false);
    const [feilmeldingStier, setFeilmeldingStier] = useState(new Set());
    const [harForsoektAaSendeInn, setHarForsoektAaSendeInn] = useState(false);

    const updateSoknadRedux = (soknad: Partial<IOMPMASoknadUt>) => dispatch(updateOMPMASoknad(soknad));
    const submitSoknad = (ident: string, soeknadid: string) => dispatch(submitOMPMASoknad(ident, soeknadid));
    const setSignatur = (signert: JaNeiIkkeRelevant | null) => dispatch(setSignaturAction(signert));
    const settJournalpostPaaVentAction = (journalpostidRedux: string, soeknadid: string) =>
        dispatch(settJournalpostPaaVent(journalpostidRedux, soeknadid));
    const settPåventResetAction = () => dispatch(setJournalpostPaaVentResetAction());
    const validateSoknad = (soknad: IOMPMASoknadUt, erMellomlagring: boolean) =>
        dispatch(validerOMPMASoknad(soknad, erMellomlagring));
    const validerSoknadReset = () => dispatch(validerOMPMASoknadResetAction());

    const punchFormState = useSelector((state: RootStateType) => state.OMSORGSPENGER_MIDLERTIDIG_ALENE.punchFormState);
    const signaturState = useSelector((state: RootStateType) => state.OMSORGSPENGER_MIDLERTIDIG_ALENE.signaturState);
    const journalposterState = useSelector((state: RootStateType) => state.journalposterPerIdentState);
    const annenSokerIdent = useSelector((state: RootStateType) => state.identState.annenSokerIdent);
    const kopierJournalpostSuccess = useSelector((state: RootStateType) => state.felles.kopierJournalpostSuccess);

    const { signert } = signaturState;

    const updateSoknad = (soknad: IOMPMASoknad) => {
        setShowStatus(true);
        const barnMappet = soknad.barn.map((barn) => ({ norskIdent: barn.norskIdent, foedselsdato: '' }));
        const journalposter = Array.from(soknad?.journalposter || []);

        if (!journalposter.includes(journalpostid)) {
            journalposter.push(journalpostid);
        }
        if (harForsoektAaSendeInn) {
            validateSoknad({ ...soknad, barn: barnMappet, journalposter }, true);
        }

        return updateSoknadRedux({ ...soknad, barn: barnMappet, journalposter });
    };

    useEffect(() => {
        if (showStatus) {
            setTimeout(() => setShowStatus(false), 5000);
        }
    }, [showStatus]);

    const handleSettPaaVent = () => {
        settJournalpostPaaVentAction(journalpostid, values.soeknadId!);
        setShowSettPaaVentModal(false);
    };

    const getManglerFromStore = () => punchFormState.inputErrors;

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

        const className = 'absolute top-[60px] left-4 z-5';

        if (punchFormState.isAwaitingUpdateResponse) {
            return (
                <Tag variant="warning" className={className}>
                    <FormattedMessage id={'omsorgspenger.midlertidigAlene.punshcForm.awaitingUpdateResponse'} />
                </Tag>
            );
        }

        if (punchFormState.updateSoknadError) {
            return (
                <Tag variant="error" className={className}>
                    <FormattedMessage id={'omsorgspenger.midlertidigAlene.punshcForm.updateSoknadError'} />
                </Tag>
            );
        }

        return (
            <Tag variant="success" className={className}>
                <FormattedMessage id={'omsorgspenger.midlertidigAlene.punshcForm.updateSoknadSuccess'} />
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

            <OpplysningerOmOMPMASoknad setSignaturAction={setSignatur} signert={signert} handleBlur={handleBlur} />

            <VerticalSpacer fourtyPx />

            <Heading size="xsmall" spacing>
                <FormattedMessage id={'omsorgspenger.midlertidigAlene.punchForm.barn.tittel'} />
            </Heading>

            <Personvelger
                name="barn"
                handleBlur={handleBlur}
                sokersIdent={values.soekerId}
                populerMedBarn={!values.barn.length}
            />

            <VerticalSpacer fourtyPx />

            <AnnenForelder handleBlur={handleBlur} />

            <VerticalSpacer fourtyPx />

            <p className="ikkeregistrert">
                <FormattedMessage id={'skjema.ikkeregistrert'} />
            </p>

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
                                <FormattedMessage id={'skjema.medisinskeopplysninger.omsorgspenger-ks.hjelpetekst'} />
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
                                <FormattedMessage id={'skjema.opplysningerikkepunsjet.hjelpetekst'} />
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
                        className="send-knapp"
                        type="button"
                        onClick={() => {
                            if (!harForsoektAaSendeInn) {
                                setHarForsoektAaSendeInn(true);
                            }
                            handleSubmit();
                        }}
                    >
                        <FormattedMessage id="skjema.knapp.send" />
                    </Button>

                    <Button
                        variant="secondary"
                        type="button"
                        className="vent-knapp"
                        onClick={() => setShowSettPaaVentModal(true)}
                        disabled={false}
                    >
                        <FormattedMessage id="skjema.knapp.settpaavent" />
                    </Button>
                </p>
            </div>

            <VerticalSpacer sixteenPx />

            {!!punchFormState.updateSoknadError && (
                <Alert size="small" variant="error">
                    <FormattedMessage id="skjema.feil.ikke_lagret" />
                </Alert>
            )}

            {!!punchFormState.inputErrors?.length && (
                <Alert size="small" variant="error" className="valideringstripefeil">
                    <FormattedMessage id="skjema.feil.validering" />
                </Alert>
            )}

            {!!punchFormState.submitSoknadError && (
                <Alert size="small" variant="error">
                    <FormattedMessage id="skjema.feil.ikke_sendt" />
                </Alert>
            )}

            {!!punchFormState.submitSoknadConflict && (
                <Alert size="small" variant="error">
                    <FormattedMessage id="skjema.feil.konflikt" />
                </Alert>
            )}

            {showSettPaaVentModal && (
                <SettPaaVentModal
                    journalposter={journalposterState.journalposter.filter((jp) => jp.journalpostId !== journalpostid)}
                    soknadId={values.soeknadId}
                    submit={() => handleSettPaaVent()}
                    onClose={() => setShowSettPaaVentModal(false)}
                />
            )}

            {punchFormState.settPaaVentSuccess && (
                <OkGåTilLosModal meldingId="modal.settpaavent.til" onClose={() => settPåventResetAction()} />
            )}

            {!!punchFormState.settPaaVentError && <ErrorModal onClose={() => settPåventResetAction()} />}

            {punchFormState.isValid && !visErDuSikkerModal && punchFormState.validertSoknad && (
                <Modal
                    key="validertSoknadModal"
                    onClose={() => validerSoknadReset()}
                    open={!!punchFormState.isValid}
                    aria-label="validertSoknadModal"
                    data-test-id="validertSoknadModal"
                >
                    <Modal.Header closeButton={false}>
                        <Heading size="medium" level="1" data-test-id="OMPMAPunchFormKvitteringHeader">
                            <FormattedMessage id="skjema.kvittering.oppsummering" />
                        </Heading>
                    </Modal.Header>

                    <Modal.Body>
                        <OMPMASoknadKvittering
                            response={punchFormState.validertSoknad}
                            kopierJournalpostSuccess={kopierJournalpostSuccess}
                            annenSokerIdent={annenSokerIdent}
                        />
                    </Modal.Body>

                    <Modal.Footer>
                        <Button
                            size="small"
                            className="validertSoknadOppsummeringContainer_knappVidere"
                            onClick={() => setVisErDuSikkerModal(true)}
                        >
                            <FormattedMessage id="fordeling.knapp.videre" />
                        </Button>

                        <Button
                            variant="secondary"
                            size="small"
                            className="validertSoknadOppsummeringContainer_knappTilbake"
                            onClick={() => validerSoknadReset()}
                        >
                            <FormattedMessage id="skjema.knapp.avbryt" />
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}

            {visErDuSikkerModal && (
                <ErDuSikkerModal
                    melding="modal.erdusikker.sendinn"
                    modalKey="erdusikkermodal"
                    extraInfo="modal.erdusikker.sendinn.extrainfo"
                    open={visErDuSikkerModal}
                    submitKnappText="skjema.knapp.send"
                    onSubmit={() => submitSoknad(values.soekerId, id)}
                    onClose={() => {
                        validerSoknadReset();
                        setVisErDuSikkerModal(false);
                    }}
                />
            )}
        </>
    );
};
