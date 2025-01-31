import React, { useState } from 'react';

import { useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { Alert, Button, CopyButton, Heading, Label, Loader } from '@navikt/ds-react';

import { finnFagsaker } from 'app/api/api';
import { ApiPath } from 'app/apiConfig';
import ErrorIcon from 'app/assets/SVG/ErrorIcon';
import SuccessIcon from 'app/assets/SVG/SuccessIcon';
import { FormProvider, FormSelect, FormTextField, FormTextarea } from 'app/components/form';
import Fagsak from 'app/types/Fagsak';
import { finnVisningsnavnForSakstype, post } from 'app/utils';
import { ERROR_MESSAGES, JOURNALPOST_DEFAULT_VALUES } from './constants';
import { IOpprettJournalpostForm, OpprettJournalpostFormKeys } from './types';
import { validateNottatTittel, validateNotatText, validateSøkerIdentitetsnummer } from './utils';

import './opprettJournalpost.less';

const OpprettJournalpost: React.FC = () => {
    const [opprettetJournalpostId, setOpprettetJournalpostId] = useState('');
    const [opprettJpError, setOpprettJpError] = useState<string>('');

    const [fagsaker, setFagsaker] = useState<Fagsak[]>([]);

    const [isFetchingFagsaker, setIsFetchingFagsaker] = useState(false);
    const [fagsakError, setFagsakError] = useState(false);

    const methods = useForm<IOpprettJournalpostForm>({
        defaultValues: JOURNALPOST_DEFAULT_VALUES,
        mode: 'onSubmit',
    });

    const {
        watch,
        setValue,
        trigger,
        clearErrors,
        reset,
        formState: { isSubmitting, isSubmitSuccessful, errors },
    } = methods;

    const søkersFødselsnummer = watch(OpprettJournalpostFormKeys.søkerIdentitetsnummer);

    const hentFagsaker = (fnr: string) => {
        setIsFetchingFagsaker(true);

        finnFagsaker(fnr, (response, data: Fagsak[]) => {
            setIsFetchingFagsaker(false);
            if (response.status === 200) {
                setFagsakError(false);
                setFagsaker(data);
            } else {
                setFagsakError(true);
            }
        });
    };

    const handleSøkerIdentitetsnummerChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        clearErrors(OpprettJournalpostFormKeys.søkerIdentitetsnummer);
        setFagsakError(false);

        if (fagsaker.length > 0) {
            setFagsaker([]);
            setValue(OpprettJournalpostFormKeys.fagsakId, '');
        }

        const { value } = event.target;

        if (!isFetchingFagsaker && value.length === 11) {
            const isValid = await trigger(OpprettJournalpostFormKeys.søkerIdentitetsnummer);
            if (isValid) {
                hentFagsaker(value);
            }
        }
    };

    const visIngenFagsakAlert =
        !fagsakError &&
        søkersFødselsnummer.length === 11 &&
        !errors.søkerIdentitetsnummer &&
        !isFetchingFagsaker &&
        fagsaker.length === 0;

    const onSubmit = async (values: IOpprettJournalpostForm) => {
        setOpprettJpError('');
        return new Promise<void>((resolve) => {
            post(ApiPath.OPPRETT_NOTAT, undefined, undefined, values, (response, data) => {
                if (response.status === 201) {
                    setOpprettetJournalpostId(data.journalpostId);
                    resolve();
                } else {
                    reset(values, { keepValues: true, keepErrors: true, keepDirty: true, keepTouched: true });
                    setOpprettJpError(ERROR_MESSAGES.opprettJournalpost);
                }
            });
        });
    };

    return (
        <div className="opprettJournalpost">
            <Heading size="medium" level="1">
                <FormattedMessage id={'opprettJournalpost.opprettJournalpost'} />
            </Heading>

            <div className="formContainer">
                <FormProvider<IOpprettJournalpostForm> form={methods} onSubmit={onSubmit}>
                    <FormTextField<IOpprettJournalpostForm>
                        name={OpprettJournalpostFormKeys.søkerIdentitetsnummer}
                        label={<FormattedMessage id="opprettJournalpost.søkersFødselsnummer" />}
                        className="fnrInput"
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        maxLength={11}
                        onChange={handleSøkerIdentitetsnummerChange}
                        validate={validateSøkerIdentitetsnummer}
                        required
                        readOnly={isSubmitSuccessful}
                        disabled={isFetchingFagsaker || isSubmitting}
                    />

                    <div className="fagsakSelectContainer">
                        <FormSelect<IOpprettJournalpostForm>
                            name={OpprettJournalpostFormKeys.fagsakId}
                            label={<FormattedMessage id="opprettJournalpost.velgFagsak" />}
                            className="input fagsakSelect"
                            readOnly={isSubmitSuccessful}
                            disabled={isFetchingFagsaker || isSubmitting}
                            required
                        >
                            <option value="">
                                <FormattedMessage id="opprettJournalpost.velg" />
                            </option>

                            {fagsaker.map(({ fagsakId, sakstype, reservert }) => (
                                <option key={fagsakId} value={fagsakId}>
                                    <FormattedMessage
                                        id="opprettJournalpost.fagsakOption"
                                        values={{
                                            fagsakId,
                                            sakstype: finnVisningsnavnForSakstype(sakstype),
                                            reservert: reservert ? '(reservert)' : '',
                                        }}
                                    />
                                </option>
                            ))}
                        </FormSelect>

                        {isFetchingFagsaker && <Loader size="small" />}
                    </div>

                    {fagsakError && (
                        <Alert
                            size="small"
                            variant="error"
                            className="mb-4"
                            data-test-id="opprettJournalpost.hentFagsakError"
                        >
                            <FormattedMessage id="opprettJournalpost.hentFagsakError" />
                            <Button
                                type="button"
                                size="small"
                                variant="tertiary"
                                onClick={() => hentFagsaker(søkersFødselsnummer)}
                            >
                                <FormattedMessage id="opprettJournalpost.hentFagsakerPånytt.btn" />
                            </Button>
                        </Alert>
                    )}

                    {visIngenFagsakAlert && (
                        <Alert
                            size="small"
                            variant="warning"
                            className="mb-4"
                            data-test-id="opprettJournalpostAlertIngenFagsak"
                        >
                            <FormattedMessage id="opprettJournalpost.alert.ingenFagsak" />
                        </Alert>
                    )}

                    <div className="notatContainer">
                        <FormTextField<IOpprettJournalpostForm>
                            name={OpprettJournalpostFormKeys.tittel}
                            label={<FormattedMessage id="opprettJournalpost.tittel" />}
                            className="input"
                            maxLength={200}
                            autoComplete="off"
                            validate={validateNottatTittel}
                            readOnly={isSubmitSuccessful}
                            disabled={isSubmitting}
                        />

                        <FormTextarea<IOpprettJournalpostForm>
                            name={OpprettJournalpostFormKeys.notat}
                            className="input"
                            label={<FormattedMessage id="opprettJournalpost.notat" />}
                            maxLength={10000}
                            validate={validateNotatText}
                            readOnly={isSubmitSuccessful}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="statusContainer">
                        {errors.root?.message && (
                            <>
                                <ErrorIcon />
                                <Label size="small" className="statusText">
                                    {errors.root.message}
                                </Label>
                            </>
                        )}

                        {opprettJpError && (
                            <>
                                <ErrorIcon />
                                <Label size="small" className="statusText">
                                    {opprettJpError}
                                </Label>
                            </>
                        )}

                        {isSubmitSuccessful && (
                            <>
                                <SuccessIcon />
                                <Label size="small" className="statusText flex items-center">
                                    <FormattedMessage
                                        id="opprettJournalpost.journalpostOpprettet"
                                        values={{ journalpostId: opprettetJournalpostId }}
                                    />
                                    <CopyButton size="xsmall" copyText={opprettetJournalpostId} className="ml-4" />
                                </Label>
                            </>
                        )}
                    </div>

                    {!isSubmitSuccessful && (
                        <Button
                            size="small"
                            type="submit"
                            className="submitButton"
                            loading={isSubmitting}
                            disabled={isSubmitting || isFetchingFagsaker}
                        >
                            <FormattedMessage id={'opprettJournalpost.opprettJournalpost'} />
                        </Button>
                    )}
                </FormProvider>

                {isSubmitSuccessful && (
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
