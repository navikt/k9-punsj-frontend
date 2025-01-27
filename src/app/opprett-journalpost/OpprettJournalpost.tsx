import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { FormattedMessage, useIntl } from 'react-intl';
import { Alert, Button, Heading, Label, Loader } from '@navikt/ds-react';

import { finnFagsaker } from 'app/api/api';
import { ApiPath } from 'app/apiConfig';
import ErrorIcon from 'app/assets/SVG/ErrorIcon';
import SuccessIcon from 'app/assets/SVG/SuccessIcon';
import { FormSelect } from 'app/components/form/FormSelect';
import { FormTextField } from 'app/components/form/FormTextField';
import { FormTextarea } from 'app/components/form/FormTextarea';
import { useFormState } from 'app/hooks/useFormState';
import { IJournalpostForm, IJournalpostRequest } from 'app/types/journalpost.types';
import Fagsak from 'app/types/Fagsak';
import { finnVisningsnavnForSakstype, post } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import { ERROR_MESSAGES, JOURNALPOST_DEFAULT_VALUES, VALIDATION_RULES } from './constants';

import './opprettJournalpost.less';

const OpprettJournalpost: React.FC = () => {
    const intl = useIntl();
    const methods = useForm<IJournalpostForm>({
        defaultValues: JOURNALPOST_DEFAULT_VALUES,
    });

    const { handleSubmit, watch } = methods;

    const {
        isSubmitting: isSubmittingJournalpost,
        isSuccess: submitSuccessful,
        error: submitError,
        setSubmitting: setIsSubmittingJournalpost,
        setSuccess: setSubmitSuccessful,
        setError: setSubmitError,
    } = useFormState();

    const {
        isSubmitting: isFetchingFagsaker,
        error: fagsakError,
        setSubmitting: setIsFetchingFagsaker,
        setError: setFagsakError,
    } = useFormState();

    const [opprettetJournalpostId, setOpprettetJournalpostId] = useState('');
    const [fagsaker, setFagsaker] = useState<Fagsak[]>([]);

    const søkersFødselsnummer = watch('søkersFødselsnummer');

    const hentFagsaker = (fnr: string) => {
        if (fnr.length !== 11) return;

        setFagsakError(null);
        setIsFetchingFagsaker(true);
        finnFagsaker(fnr, (response, data: Fagsak[]) => {
            setIsFetchingFagsaker(false);
            if (response.status === 200) {
                setFagsaker(data);
            } else {
                setFagsakError(ERROR_MESSAGES.henteFagsak);
            }
        });
    };

    const onSubmit = (values: IJournalpostForm) => {
        setSubmitError(null);
        setIsSubmittingJournalpost(true);

        const nyJournalpost: IJournalpostRequest = {
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
                setSubmitError(ERROR_MESSAGES.opprettJournalpost);
            }
        });
    };

    React.useEffect(() => {
        if (søkersFødselsnummer.length === 11) {
            hentFagsaker(søkersFødselsnummer);
        }
    }, [søkersFødselsnummer]);

    return (
        <div className="opprettJournalpost">
            <Heading size="medium" level="1">
                <FormattedMessage id={'opprettJournalpost.opprettJournalpost'} />
            </Heading>

            <div className="formContainer">
                <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <FormTextField
                            name="søkersFødselsnummer"
                            className="w-64"
                            label={intlHelper(intl, 'opprettJournalpost.søkersFødselsnummer')}
                            maxLength={11}
                            rules={VALIDATION_RULES.søkersFødselsnummer}
                            errorMessage={ERROR_MESSAGES.søkersFødselsnummer}
                        />

                        <div className="fagsagSelectContainer">
                            <FormSelect
                                name="fagsakId"
                                className="input select w-64"
                                label={intlHelper(intl, 'opprettJournalpost.velgFagsak')}
                                disabled={fagsaker.length === 0}
                                rules={VALIDATION_RULES.fagsakId}
                                errorMessage={ERROR_MESSAGES.fagsakId}
                            >
                                <option value="">
                                    <FormattedMessage id={'opprettJournalpost.velg'} />
                                </option>
                                {fagsaker.map(({ fagsakId, sakstype, reservert }) => (
                                    <option key={fagsakId} value={fagsakId}>
                                        {`${fagsakId} (K9 ${finnVisningsnavnForSakstype(sakstype)}) ${
                                            reservert ? '(reservert)' : ''
                                        }`}
                                    </option>
                                ))}
                            </FormSelect>
                            {isFetchingFagsaker && <Loader size="small" />}
                        </div>

                        {søkersFødselsnummer && fagsaker.length === 0 && !isFetchingFagsaker && (
                            <Alert
                                size="small"
                                variant="warning"
                                className="mb-4 max-w-[425px]"
                                data-test-id="opprettJournalpostAlertIngenFagsak"
                            >
                                <FormattedMessage id="opprettJournalpost.alert.ingenFagsak" />
                            </Alert>
                        )}

                        <FormTextField
                            name="tittel"
                            className="input w-[400px]"
                            label={intlHelper(intl, 'opprettJournalpost.tittel')}
                            maxLength={200}
                            rules={VALIDATION_RULES.tittel}
                            errorMessage={ERROR_MESSAGES.tittel}
                        />

                        <div className="notatContainer input">
                            <FormTextarea
                                name="notat"
                                className="notat"
                                label={intlHelper(intl, 'opprettJournalpost.notat')}
                                maxLength={100000}
                                rules={VALIDATION_RULES.notat}
                                errorMessage={ERROR_MESSAGES.notat}
                            />
                        </div>

                        {!submitSuccessful && (
                            <Button
                                size="small"
                                type="submit"
                                className="submitButton"
                                loading={isSubmittingJournalpost}
                                disabled={fagsaker.length === 0}
                            >
                                <FormattedMessage id={'opprettJournalpost.opprettJournalpost'} />
                            </Button>
                        )}

                        <div className="statusContainer">
                            {submitError && (
                                <>
                                    <ErrorIcon />
                                    <Label size="small" className="statusText">
                                        {submitError}
                                    </Label>
                                </>
                            )}

                            {fagsakError && (
                                <>
                                    <ErrorIcon />
                                    <Label size="small" className="statusText">
                                        {fagsakError}
                                    </Label>
                                </>
                            )}

                            {submitSuccessful && (
                                <>
                                    <SuccessIcon />
                                    <Label size="small" className="statusText">
                                        <FormattedMessage id={'opprettJournalpost.journalpostOpprettet'} />
                                    </Label>
                                </>
                            )}
                        </div>
                    </form>
                </FormProvider>

                {submitSuccessful && (
                    <Button
                        onClick={() => window.location.assign(`journalpost/${opprettetJournalpostId}`)}
                        type="button"
                        size="small"
                        className="submitButton"
                    >
                        <FormattedMessage id={'opprettJournalpost.gåTilJournalpost'} />
                    </Button>
                )}
            </div>
        </div>
    );
};

export default OpprettJournalpost;
