import React, { useState, ChangeEvent } from 'react';

import { useForm } from 'react-hook-form';
import { FormattedMessage, useIntl } from 'react-intl';
import { Alert, Button, CopyButton, Heading, Label, Loader } from '@navikt/ds-react';
import { useNavigate } from 'react-router';

import { finnFagsaker } from 'app/api/api';
import { ApiPath } from 'app/apiConfig';
import ErrorIcon from 'app/assets/SVG/ErrorIcon';
import SuccessIcon from 'app/assets/SVG/SuccessIcon';
import Fagsak from 'app/types/Fagsak';
import { finnVisningsnavnForSakstype, post } from 'app/utils';
import { IOpprettJournalpostForm, OpprettJournalpostFormKeys } from './types';
import { getTypedFormComponents } from 'app/components/form/getTypedFormComponents';
import { useValidationRules } from './useValidationRules';

import './opprettJournalpost.less';

const { TypedFormProvider, TypedFormTextField, TypedFormSelect, TypedFormTextarea } =
    getTypedFormComponents<IOpprettJournalpostForm>();

export const defaultValues: IOpprettJournalpostForm = {
    søkerIdentitetsnummer: '',
    fagsakId: '',
    tittel: '',
    notat: '',
};

const OpprettJournalpost: React.FC = () => {
    const intl = useIntl();

    const navigate = useNavigate();

    const [opprettetJournalpostId, setOpprettetJournalpostId] = useState('');
    const [opprettJpError, setOpprettJpError] = useState<string>('');
    const [fagsaker, setFagsaker] = useState<Fagsak[]>([]);
    const [isFetchingFagsaker, setIsFetchingFagsaker] = useState(false);
    const [fetchFagsakError, setFetchFagsakError] = useState(false);

    const { søkerIdentitetsnummerValidator, fagsakIdValidator, tittelValidator, notatValidator } = useValidationRules();

    const methods = useForm<IOpprettJournalpostForm>({
        defaultValues: defaultValues,
        mode: 'onSubmit',
    });

    const {
        formState: { isSubmitting, isSubmitSuccessful, errors },

        watch,
        setValue,
        trigger,
        clearErrors,
        reset,
    } = methods;

    const søkersFødselsnummer = watch(OpprettJournalpostFormKeys.søkerIdentitetsnummer);

    const hentFagsaker = (fnr: string) => {
        setIsFetchingFagsaker(true);

        finnFagsaker(fnr, (response, data: Fagsak[]) => {
            setIsFetchingFagsaker(false);
            if (response.status === 200) {
                setFetchFagsakError(false);
                setFagsaker(data);
            } else {
                setFetchFagsakError(true);
            }
        });
    };

    const handleSøkerIdentitetsnummerChange = async (event: ChangeEvent<HTMLInputElement>) => {
        clearErrors(OpprettJournalpostFormKeys.søkerIdentitetsnummer);
        setFetchFagsakError(false);

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
        !fetchFagsakError &&
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
                    setOpprettJpError(intl.formatMessage({ id: 'opprettJournalpost.error' }));
                }
            });
        });
    };

    return (
        <div className="opprettJournalpost">
            <Heading size="medium" level="1">
                <FormattedMessage id="opprettJournalpost.tittel" />
            </Heading>

            <div className="formContainer">
                <TypedFormProvider form={methods} onSubmit={onSubmit}>
                    <TypedFormTextField
                        name={OpprettJournalpostFormKeys.søkerIdentitetsnummer}
                        label={<FormattedMessage id="opprettJournalpost.textField.søkerIdentitetsnummer.label" />}
                        className="fnrInput"
                        type="text"
                        inputMode="numeric"
                        autoComplete="off"
                        maxLength={11}
                        validate={søkerIdentitetsnummerValidator}
                        onChange={handleSøkerIdentitetsnummerChange}
                        readOnly={isSubmitSuccessful}
                        disabled={isFetchingFagsaker}
                        data-testid="opprettJournalpostFnrInput"
                    />

                    <div className="fagsakSelectContainer">
                        <TypedFormSelect
                            name={OpprettJournalpostFormKeys.fagsakId}
                            label={<FormattedMessage id="opprettJournalpost.select.fagsakId.label" />}
                            className="fagsakSelectOpprettJp"
                            validate={fagsakIdValidator}
                            readOnly={isSubmitSuccessful}
                            disabled={isFetchingFagsaker}
                            data-testid="opprettJournalpostFagsakSelect"
                        >
                            <option value="">
                                {fagsaker.length > 0 && (
                                    <FormattedMessage id="opprettJournalpost.select.fagsakId.option.velg" />
                                )}
                            </option>

                            {fagsaker.map(({ fagsakId, sakstype, reservert }) => (
                                <option key={fagsakId} value={fagsakId}>
                                    <FormattedMessage
                                        id="opprettJournalpost.select.fagsakId.option"
                                        values={{
                                            fagsakId,
                                            sakstype: finnVisningsnavnForSakstype(sakstype),
                                            reservert: reservert ? '(reservert)' : '',
                                        }}
                                    />
                                </option>
                            ))}
                        </TypedFormSelect>

                        {isFetchingFagsaker && <Loader size="small" />}
                    </div>

                    {fetchFagsakError && (
                        <Alert
                            size="small"
                            variant="error"
                            className="mb-4"
                            data-test-id="opprettJournalpostAlertHentFagsakerError"
                        >
                            <FormattedMessage id="opprettJournalpost.alert.hentFagsaker.error" />

                            <div className="mt-4">
                                <Button
                                    type="button"
                                    size="small"
                                    variant="secondary"
                                    className="mt-2"
                                    onClick={() => hentFagsaker(søkersFødselsnummer)}
                                >
                                    <FormattedMessage id="opprettJournalpost.btn.hentFagsaker" />
                                </Button>
                            </div>
                        </Alert>
                    )}

                    {visIngenFagsakAlert && (
                        <Alert
                            size="small"
                            variant="warning"
                            className="mb-4"
                            data-test-id="opprettJournalpostAlertIngenFagsak"
                        >
                            <FormattedMessage id="opprettJournalpost.alert.hentFagsaker.ingenFagsak" />
                        </Alert>
                    )}

                    <div className="notatContainer">
                        <TypedFormTextField
                            name={OpprettJournalpostFormKeys.tittel}
                            label={<FormattedMessage id="opprettJournalpost.textField.tittel.label" />}
                            className="input"
                            maxLength={200}
                            validate={tittelValidator}
                            autoComplete="off"
                            readOnly={isSubmitSuccessful}
                            data-testid="opprettJournalpostTittelInput"
                        />

                        <TypedFormTextarea
                            name={OpprettJournalpostFormKeys.notat}
                            className="input"
                            label={<FormattedMessage id="opprettJournalpost.textarea.notat.label" />}
                            maxLength={10000}
                            validate={notatValidator}
                            readOnly={isSubmitSuccessful}
                            data-testid="opprettJournalpostNotatTextarea"
                        />
                    </div>

                    {errors.root?.message && (
                        <div className="statusContainer">
                            <ErrorIcon />
                            <Label size="small" className="statusText">
                                {errors.root.message}
                            </Label>
                        </div>
                    )}

                    {opprettJpError && (
                        <div className="statusContainer">
                            <ErrorIcon />
                            <Label size="small" className="statusText">
                                {opprettJpError}
                            </Label>
                        </div>
                    )}

                    {isSubmitSuccessful && (
                        <div className="statusContainer">
                            <SuccessIcon />
                            <Label size="small" className="statusText flex items-center">
                                <FormattedMessage
                                    id="opprettJournalpost.opprettet"
                                    values={{ journalpostId: opprettetJournalpostId }}
                                />
                                <CopyButton size="xsmall" copyText={opprettetJournalpostId} className="ml-4" />
                            </Label>
                        </div>
                    )}

                    {!isSubmitSuccessful && (
                        <div className="mt-10">
                            <Button
                                type="submit"
                                size="small"
                                loading={isSubmitting}
                                disabled={isSubmitting || isFetchingFagsaker}
                                data-testid="opprettJournalpostSubmitButton"
                            >
                                <FormattedMessage id="opprettJournalpost.btn" />
                            </Button>
                        </div>
                    )}
                </TypedFormProvider>

                {isSubmitSuccessful && (
                    <div className="mt-4">
                        <Button
                            onClick={() => navigate(`/journalpost/${opprettetJournalpostId}`)}
                            type="button"
                            size="small"
                            data-testid="opprettJournalpostGåTilJournalpostButton"
                        >
                            <FormattedMessage id="opprettJournalpost.btn.gåTilJournalpost" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OpprettJournalpost;
