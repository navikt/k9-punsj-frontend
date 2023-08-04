import { ErrorMessage, Field, FieldProps, Form, Formik } from 'formik';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';

import { Button, Label, Loader, Select, TextField, Textarea } from '@navikt/ds-react';

import { finnFagsaker } from 'app/api/api';
import { ApiPath } from 'app/apiConfig';
import ErrorIcon from 'app/assets/SVG/ErrorIcon';
import SuccessIcon from 'app/assets/SVG/SuccessIcon';
import Fagsak from 'app/types/Fagsak';
import { finnVisningsnavnForSakstype, post } from 'app/utils';
import { requiredValue, validateText } from 'app/utils/validationHelpers';

import './opprettJournalpost.less';

enum OpprettJournalpostFormKeys {
    søkersFødselsnummer = 'søkersFødselsnummer',
    fagsakId = 'fagsakId',
    tittel = 'tittel',
    notat = 'notat',
}

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
        finnFagsaker(søkersFødselsnummer, (response, data: Fagsak[]) => {
            setIsFetchingFagsaker(false);
            if (response.status === 200) {
                setFagsaker(data);
            } else {
                setHenteFagsakFeilet(true);
            }
        });
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
                                    <TextField
                                        {...field}
                                        className="w-64"
                                        label={intl.formatMessage({ id: 'OpprettJournalpost.søkersFødselsnummer' })}
                                        error={meta.touched && meta.error && <ErrorMessage name={field.name} />}
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
                                            className="input select w-64"
                                            label={intl.formatMessage({ id: 'OpprettJournalpost.velgFagsak' })}
                                            error={meta.touched && meta.error && <ErrorMessage name={field.name} />}
                                            disabled={fagsaker.length === 0}
                                        >
                                            <option value="">
                                                {intl.formatMessage({ id: 'OpprettJournalpost.velg' })}
                                            </option>
                                            {fagsaker.map(({ fagsakId, sakstype }) => (
                                                <option key={fagsakId} value={fagsakId}>
                                                    {`${fagsakId} (K9 ${finnVisningsnavnForSakstype(sakstype)})`}
                                                </option>
                                            ))}
                                        </Select>
                                        {isFetchingFagsaker && <Loader size="small" />}
                                    </div>
                                )}
                            </Field>
                            <Field
                                name={OpprettJournalpostFormKeys.tittel}
                                validate={(value: string) => validateText(value, 200)}
                            >
                                {({ field, meta }: FieldProps) => (
                                    <TextField
                                        {...field}
                                        className="input w-[400px]"
                                        label={intl.formatMessage({ id: 'OpprettJournalpost.tittel' })}
                                        maxLength={200}
                                        error={meta.touched && meta.error && <ErrorMessage name={field.name} />}
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
                                            className="notat"
                                            label={intl.formatMessage({ id: 'OpprettJournalpost.notat' })}
                                            maxLength={100000}
                                            error={meta.touched && meta.error && <ErrorMessage name={field.name} />}
                                        />
                                    </div>
                                )}
                            </Field>
                            {!submitSuccessful && (
                                <Button
                                    size="small"
                                    type="submit"
                                    className="submitButton"
                                    loading={isSubmittingJournalpost}
                                >
                                    {intl.formatMessage({ id: 'OpprettJournalpost.opprettJournalpost' })}
                                </Button>
                            )}
                            <div className="statusContainer">
                                {opprettJournalpostFeilet && (
                                    <>
                                        <ErrorIcon />
                                        <Label size="small" className="statusText">
                                            {intl.formatMessage({
                                                id: 'OpprettJournalpost.opprettingAvJournalpostFeilet',
                                            })}
                                        </Label>
                                    </>
                                )}
                                {henteFagsakFeilet && (
                                    <>
                                        <ErrorIcon />
                                        <Label size="small" className="statusText">
                                            {intl.formatMessage({
                                                id: 'OpprettJournalpost.hentingAvFagsakFeilet',
                                            })}
                                        </Label>
                                    </>
                                )}
                                {submitSuccessful && (
                                    <>
                                        <SuccessIcon />
                                        <Label size="small" className="statusText">
                                            {intl.formatMessage({
                                                id: 'OpprettJournalpost.journalpostOpprettet',
                                            })}
                                        </Label>
                                    </>
                                )}
                            </div>
                        </Form>
                    )}
                </Formik>
                {submitSuccessful && (
                    <Button
                        onClick={() => window.location.assign(`journalpost/${opprettetJournalpostId}`)}
                        type="button"
                        size="small"
                        className="submitButton"
                    >
                        {intl.formatMessage({
                            id: 'OpprettJournalpost.gåTilJournalpost',
                        })}
                    </Button>
                )}
            </div>
        </div>
    );
};
export default OpprettJournalpost;
