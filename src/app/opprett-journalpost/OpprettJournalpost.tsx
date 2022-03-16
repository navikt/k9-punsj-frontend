import { ApiPath } from 'app/apiConfig';
import { get, post } from 'app/utils';
import { requiredValue, validateText } from 'app/utils/validationHelpers';
import { ErrorMessage, Field, FieldProps, Form, Formik } from 'formik';
import AlertStripe from 'nav-frontend-alertstriper';
import { Hovedknapp } from 'nav-frontend-knapper';
import { Input, Select, Textarea } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import React, { useState } from 'react';
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

// eslint-disable-next-line arrow-body-style
const OpprettJournalpost: React.FC = () => {
    const [opprettJournalpostFeilet, setOpprettJournalpostFeilet] = useState(false);
    const [henteFagsakFeilet, setHenteFagsakFeilet] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [fagsaker, setFagsaker] = useState<Fagsak[]>([]);
    const hentFagsaker = (søkersFødselsnummer: string) => {
        setHenteFagsakFeilet(false);
        setIsLoading(true);
        get(
            ApiPath.HENT_FAGSAK_PÅ_IDENT,
            undefined,
            { 'X-Nav-NorskIdent': søkersFødselsnummer },
            (response, data: Fagsak[]) => {
                setIsLoading(false);
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
            <h1 className="heading">Opprett journalpost</h1>
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
                        const nyJournalpost = {
                            søkerIdentitetsnummer: values.søkersFødselsnummer,
                            fagsakId: values.fagsakId,
                            tittel: values.tittel,
                            notat: values.notat,
                        };
                        post(ApiPath.OPPRETT_NOTAT, undefined, undefined, nyJournalpost, (response) => {
                            if (response.status === 201) {
                                console.log(response);
                            } else {
                                setOpprettJournalpostFeilet(true);
                            }
                        });
                        actions.setSubmitting(false);
                    }}
                >
                    {({ isSubmitting, setFieldValue }) => (
                        <Form>
                            <Field
                                name={OpprettJournalpostFormKeys.søkersFødselsnummer}
                                validate={(value: string) => validateText(value, 11, true)}
                            >
                                {({ field, meta }: FieldProps) => (
                                    <Input
                                        {...field}
                                        className="input"
                                        bredde="L"
                                        label="Søkers fødselsnummer"
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
                                            className="input"
                                            bredde="l"
                                            label="Velg fagsak"
                                            feil={meta.touched && meta.error && <ErrorMessage name={field.name} />}
                                            disabled={fagsaker.length === 0}
                                        >
                                            <option value="">Velg</option>
                                            {fagsaker.map(({ fagsakId, fagsaksystem, tema }) => (
                                                <option key={fagsakId} value={fagsakId}>
                                                    {`${fagsakId} (${fagsaksystem} ${formaterTema(tema)})`}
                                                </option>
                                            ))}
                                        </Select>
                                        {isLoading && <NavFrontendSpinner type="XS" />}
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
                                        label="Tittel"
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
                                            label="Notat"
                                            maxLength={100000}
                                            feil={meta.touched && meta.error && <ErrorMessage name={field.name} />}
                                        />
                                    </div>
                                )}
                            </Field>

                            <Hovedknapp mini kompakt htmlType="submit" className="submitButton" spinner={isSubmitting}>
                                Opprett journalpost
                            </Hovedknapp>
                            {opprettJournalpostFeilet && (
                                <AlertStripe type="feil">Oppretting av journalpost feilet</AlertStripe>
                            )}
                            {henteFagsakFeilet && <AlertStripe type="feil">Henting av fagsaker feilet. </AlertStripe>}
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};
export default OpprettJournalpost;
