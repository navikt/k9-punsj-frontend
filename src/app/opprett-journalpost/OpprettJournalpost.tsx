import { Input, Radio, RadioGruppe, Select, Textarea } from 'nav-frontend-skjema';
import React, { useState } from 'react';
import './opprettJournalpost.less';
import { Hovedknapp } from 'nav-frontend-knapper';
import { Field, Formik, FieldProps, ErrorMessage, Form } from 'formik';
import { post, get } from 'app/utils';
import { ApiPath } from 'app/apiConfig';
import AlertStripe from 'nav-frontend-alertstriper';

enum OpprettJournalpostFormKeys {
    søkersFødselsnummer = 'søkersFødselsnummer',
    fagsakId = 'fagsakId',
    tittel = 'tittel',
    notat = 'notat',
    inneholderNotatetSensitivePersonopplysninger = 'inneholderNotatetSensitivePersonopplysninger',
}

// eslint-disable-next-line arrow-body-style
const OpprettJournalpost: React.FC = () => {
    const [opprettJournalpostFeilet, setOpprettJournalpostFeilet] = useState(false);
    const [fagsaker, setFagsaker] = useState([]);
    const hentFagsaker = (søkersFødselsnummer: string) => {
        get(ApiPath.HENT_FAGSAK_PÅ_IDENT, undefined, { 'X-Nav-NorskIdent': søkersFødselsnummer }, (response, data) => {
            if (response.status === 200) {
                setFagsaker(data);
            }
        });
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
                        [OpprettJournalpostFormKeys.inneholderNotatetSensitivePersonopplysninger]: '',
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
                            <Field name={OpprettJournalpostFormKeys.søkersFødselsnummer}>
                                {({ field, meta }: FieldProps) => (
                                    <Input
                                        {...field}
                                        className="input"
                                        bredde="L"
                                        label="Søkers fødselsnummer"
                                        feil={meta.touched && meta.error && <ErrorMessage name={field.name} />}
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
                            <Field name={OpprettJournalpostFormKeys.fagsakId}>
                                {({ field, meta }: FieldProps) => (
                                    <Select
                                        {...field}
                                        className="input"
                                        bredde="l"
                                        label="Velg fagsak"
                                        feil={meta.touched && meta.error && <ErrorMessage name={field.name} />}
                                        disabled={fagsaker.length === 0}
                                    >
                                        <option value="">Velg</option>
                                        {fagsaker.map((fagsak) => (
                                            <option key={fagsak} value={fagsak}>
                                                {fagsak}
                                            </option>
                                        ))}
                                    </Select>
                                )}
                            </Field>
                            <Field name={OpprettJournalpostFormKeys.tittel}>
                                {({ field, meta }: FieldProps) => (
                                    <Input
                                        {...field}
                                        className="input"
                                        bredde="XXL"
                                        label="Tittel"
                                        feil={meta.touched && meta.error && <ErrorMessage name={field.name} />}
                                    />
                                )}
                            </Field>
                            <Field name={OpprettJournalpostFormKeys.notat}>
                                {({ field, meta }: FieldProps) => (
                                    <div className="notatContainer input">
                                        <Textarea
                                            {...field}
                                            textareaClass="notat"
                                            label="Notat"
                                            feil={meta.touched && meta.error && <ErrorMessage name={field.name} />}
                                        />
                                    </div>
                                )}
                            </Field>
                            <Field name={OpprettJournalpostFormKeys.inneholderNotatetSensitivePersonopplysninger}>
                                {({ field, meta }: FieldProps) => (
                                    <RadioGruppe
                                        {...field}
                                        className="input"
                                        legend="Inneholder notatet sensitive personopplysninger?"
                                        feil={meta.touched && meta.error && <ErrorMessage name={field.name} />}
                                        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                                            setFieldValue(field.name, event.target.value)
                                        }
                                    >
                                        <Radio value="ja" label="Ja" name={field.name} />
                                        <Radio value="nei" label="Nei" name={field.name} />
                                    </RadioGruppe>
                                )}
                            </Field>
                            <Hovedknapp mini kompakt htmlType="submit" className="submitButton" spinner={isSubmitting}>
                                Opprett journalpost
                            </Hovedknapp>
                            {opprettJournalpostFeilet && (
                                <AlertStripe type="feil">Oppretting av journalpost feilet</AlertStripe>
                            )}
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};
export default OpprettJournalpost;
