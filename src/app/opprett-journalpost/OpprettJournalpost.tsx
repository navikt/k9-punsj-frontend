import { ApiPath } from 'app/apiConfig';
import ErrorIcon from 'app/assets/SVG/ErrorIcon';
import SuccessIcon from 'app/assets/SVG/SuccessIcon';
import { get, post } from 'app/utils';
import { requiredValue, validateText } from 'app/utils/validationHelpers';
import { ErrorMessage, Field, FieldProps, Form, Formik } from 'formik';
import { Hovedknapp } from 'nav-frontend-knapper';
import { Input, Select, Textarea } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Element } from 'nav-frontend-typografi';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import './opprettJournalpost.less';

enum OpprettJournalpostFormKeys {
    søkersFødselsnummer = 'søkersFødselsnummer',
    fagsakId = 'fagsakId',
    tittel = 'tittel',
    notat = 'notat',
}

interface Fagsak {
    fagsakId: string;
    fagsaksystem: string;
    sakstype: string;
    tema: string;
}

const formaterTema = (tema: string) => {
    if (tema === 'OMS') {
        return 'Omsorgspenger';
    }
    if (tema === 'PSB') {
        return 'Pleiepenger';
    }
    return tema;
};

const OpprettJournalpost: React.FC = () => {
    const [opprettJournalpostFeilet, setOpprettJournalpostFeilet] = useState(false);
    const [henteFagsakFeilet, setHenteFagsakFeilet] = useState(false);
    const [isFetchingFagsaker, setIsFetchingFagsaker] = useState(false);
    const [isSubmittingJournalpost, setIsSubmittingJournalpost] = useState(false);
    const [submitSuccessful, setSubmitSuccessful] = useState(false);
    const [opprettetJournalpostId, setOpprettetJournalpostId] = useState('');
    const [fagsaker, setFagsaker] = useState<Fagsak[]>([]);
    const intl = useIntl();

    const hentFagsaker = (søkersFødselsnummer: string) => {
        setHenteFagsakFeilet(false);
        setIsFetchingFagsaker(true);
        get(
            ApiPath.HENT_FAGSAK_PÅ_IDENT,
            undefined,
            { 'X-Nav-NorskIdent': søkersFødselsnummer },
            (response, data: Fagsak[]) => {
                setIsFetchingFagsaker(false);
                if (response.status === 200) {
                    setFagsaker(data);
                } else {
                    setHenteFagsakFeilet(true);
                }
            }
        );
    };
    return (
        <div className="opprettJournalpost">
            <h1 className="heading">{intl.formatMessage({ id: 'OpprettJournalpost.opprettJournalpost' })}</h1>
            <div className="formContainer">
                <Formik
                    initialValues={{
                        [OpprettJournalpostFormKeys.søkersFødselsnummer]: '',
                        [OpprettJournalpostFormKeys.fagsakId]: '',
                        [OpprettJournalpostFormKeys.tittel]: '',
                        [OpprettJournalpostFormKeys.notat]: '',
                    }}
                    onSubmit={(values, actions) => {
                        setOpprettJournalpostFeilet(false);
                        setIsSubmittingJournalpost(true);
                        const nyJournalpost = {
                            søkerIdentitetsnummer: values.søkersFødselsnummer,
                            fagsakId: values.fagsakId,
                            tittel: values.tittel,
                            notat: values.notat,
                        };
                        post(ApiPath.OPPRETT_NOTAT, undefined, undefined, nyJournalpost, (response, data) => {
                            setIsSubmittingJournalpost(false);
                            if (response.status === 201) {
                                setSubmitSuccessful(true);
                                setOpprettetJournalpostId(data.journalpostId);
                            } else {
                                setOpprettJournalpostFeilet(true);
                            }
                        });
                        actions.setSubmitting(false);
                    }}
                >
                    {({ setFieldValue }) => (
                        <Form>
                            <Field
                                name={OpprettJournalpostFormKeys.søkersFødselsnummer}
                                validate={(value: string) => validateText(value, 11, true)}
                            >
                                {({ field, meta }: FieldProps) => (
                                    <Input
                                        {...field}
                                        bredde="L"
                                        label={intl.formatMessage({ id: 'OpprettJournalpost.søkersFødselsnummer' })}
                                        feil={meta.touched && meta.error && <ErrorMessage name={field.name} />}
                                        maxLength={11}
                                        onChange={(event) => {
                                            const { value } = event.target;
                                            setFieldValue(field.name, value);
                                            if (value.length === 11) {
                                                hentFagsaker(value);
                                            }
                                        }}
                                    />
                                )}
                            </Field>
                            <Field name={OpprettJournalpostFormKeys.fagsakId} validate={requiredValue}>
                                {({ field, meta }: FieldProps) => (
                                    <div className="fagsagSelectContainer">
                                        <Select
                                            {...field}
                                            className="input select"
                                            bredde="l"
                                            label={intl.formatMessage({ id: 'OpprettJournalpost.velgFagsak' })}
                                            feil={meta.touched && meta.error && <ErrorMessage name={field.name} />}
                                            disabled={fagsaker.length === 0}
                                        >
                                            <option value="">
                                                {intl.formatMessage({ id: 'OpprettJournalpost.velg' })}
                                            </option>
                                            {fagsaker.map(({ fagsakId, fagsaksystem, tema }) => (
                                                <option key={fagsakId} value={fagsakId}>
                                                    {`${fagsakId} (${fagsaksystem} ${formaterTema(tema)})`}
                                                </option>
                                            ))}
                                        </Select>
                                        {isFetchingFagsaker && <NavFrontendSpinner type="XS" />}
                                    </div>
                                )}
                            </Field>
                            <Field
                                name={OpprettJournalpostFormKeys.tittel}
                                validate={(value: string) => validateText(value, 200)}
                            >
                                {({ field, meta }: FieldProps) => (
                                    <Input
                                        {...field}
                                        className="input"
                                        bredde="XXL"
                                        label={intl.formatMessage({ id: 'OpprettJournalpost.tittel' })}
                                        maxLength={200}
                                        feil={meta.touched && meta.error && <ErrorMessage name={field.name} />}
                                    />
                                )}
                            </Field>
                            <Field
                                name={OpprettJournalpostFormKeys.notat}
                                validate={(value: string) => validateText(value, 100000)}
                            >
                                {({ field, meta }: FieldProps) => (
                                    <div className="notatContainer input">
                                        <Textarea
                                            {...field}
                                            textareaClass="notat"
                                            label={intl.formatMessage({ id: 'OpprettJournalpost.notat' })}
                                            maxLength={100000}
                                            feil={meta.touched && meta.error && <ErrorMessage name={field.name} />}
                                        />
                                    </div>
                                )}
                            </Field>
                            {!submitSuccessful && (
                                <Hovedknapp
                                    mini
                                    kompakt
                                    htmlType="submit"
                                    className="submitButton"
                                    spinner={isSubmittingJournalpost}
                                >
                                    {intl.formatMessage({ id: 'OpprettJournalpost.opprettJournalpost' })}
                                </Hovedknapp>
                            )}
                            <div className="statusContainer">
                                {opprettJournalpostFeilet && (
                                    <>
                                        <ErrorIcon />
                                        <Element className="statusText">
                                            {intl.formatMessage({
                                                id: 'OpprettJournalpost.opprettingAvJournalpostFeilet',
                                            })}
                                        </Element>
                                    </>
                                )}
                                {henteFagsakFeilet && (
                                    <>
                                        <ErrorIcon />
                                        <Element className="statusText">
                                            {intl.formatMessage({
                                                id: 'OpprettJournalpost.hentingAvFagsakFeilet',
                                            })}
                                        </Element>
                                    </>
                                )}
                                {submitSuccessful && (
                                    <>
                                        <SuccessIcon />
                                        <Element className="statusText">
                                            {intl.formatMessage({
                                                id: 'OpprettJournalpost.journalpostOpprettet',
                                            })}
                                        </Element>
                                    </>
                                )}
                            </div>
                        </Form>
                    )}
                </Formik>
                {submitSuccessful && (
                    <Hovedknapp
                        onClick={() => window.location.assign(`journalpost/${opprettetJournalpostId}`)}
                        mini
                        kompakt
                        htmlType="button"
                        className="submitButton"
                    >
                        {intl.formatMessage({
                            id: 'OpprettJournalpost.gåTilJournalpost',
                        })}
                    </Hovedknapp>
                )}
            </div>
        </div>
    );
};
export default OpprettJournalpost;
