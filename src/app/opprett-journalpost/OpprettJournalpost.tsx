import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FormattedMessage, useIntl } from 'react-intl';
import { Alert, Button, Heading, Label, Loader } from '@navikt/ds-react';

import { finnFagsaker } from 'app/api/api';
import { ApiPath } from 'app/apiConfig';
import ErrorIcon from 'app/assets/SVG/ErrorIcon';
import SuccessIcon from 'app/assets/SVG/SuccessIcon';
import { FormProvider } from 'app/components/form/FormProvider';
import { FormSelect } from 'app/components/form/FormSelect';
import { FormTextField } from 'app/components/form/FormTextField';
import { FormTextarea } from 'app/components/form/FormTextarea';
import { IJournalpostForm, IJournalpostRequest } from 'app/types/journalpost.types';
import Fagsak from 'app/types/Fagsak';
import { finnVisningsnavnForSakstype, post } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import { ERROR_MESSAGES, JOURNALPOST_DEFAULT_VALUES } from './constants';

import './opprettJournalpost.less';

const OpprettJournalpost: React.FC = () => {
    const intl = useIntl();
    const [opprettetJournalpostId, setOpprettetJournalpostId] = useState('');
    const [fagsaker, setFagsaker] = useState<Fagsak[]>([]);
    const [isFetchingFagsaker, setIsFetchingFagsaker] = useState(false);
    const [fagsakError, setFagsakError] = useState<string | null>(null);

    const methods = useForm<IJournalpostForm>({
        defaultValues: JOURNALPOST_DEFAULT_VALUES,
        mode: 'onChange',
    });

    const {
        watch,
        setValue,
        formState: { isSubmitting, isSubmitSuccessful, errors },
    } = methods;
    const søkersFødselsnummer = watch('søkersFødselsnummer');

    const hentFagsaker = (fnr: string) => {
        if (fnr.length !== 11) return;

        setIsFetchingFagsaker(true);
        setFagsaker([]);
        setValue('fagsakId', '', { shouldValidate: true });
        setFagsakError(null);

        finnFagsaker(fnr, (response, data: Fagsak[]) => {
            setIsFetchingFagsaker(false);
            if (response.status === 200) {
                setFagsaker(data);
            } else {
                setFagsakError(ERROR_MESSAGES.henteFagsak);
            }
        });
    };

    useEffect(() => {
        if (søkersFødselsnummer?.length === 11) {
            hentFagsaker(søkersFødselsnummer);
        } else {
            setFagsaker([]);
            setValue('fagsakId', '', { shouldValidate: true });
            setFagsakError(null);
        }
    }, [søkersFødselsnummer, setValue]);

    const onSubmit = async (values: IJournalpostForm) => {
        const nyJournalpost: IJournalpostRequest = {
            søkerIdentitetsnummer: values.søkersFødselsnummer,
            fagsakId: values.fagsakId,
            tittel: values.tittel,
            notat: values.notat,
        };

        return new Promise<void>((resolve, reject) => {
            post(ApiPath.OPPRETT_NOTAT, undefined, undefined, nyJournalpost, (response, data) => {
                if (response.status === 201) {
                    setOpprettetJournalpostId(data.journalpostId);
                    resolve();
                } else {
                    reject(new Error(ERROR_MESSAGES.opprettJournalpost));
                }
            });
        });
    };

    const FormFields = () => (
        <>
            <FormTextField<IJournalpostForm>
                name="søkersFødselsnummer"
                className="w-64"
                label={intlHelper(intl, 'opprettJournalpost.søkersFødselsnummer')}
                maxLength={11}
                validate={(value) => {
                    if (!value) return 'Dette feltet er påkrevd';
                    if (value.length !== 11) return 'Fødselsnummer må være 11 siffer';
                    return undefined;
                }}
                onChange={(event) => {
                    const { value } = event.target;
                    if (value.length === 11) {
                        hentFagsaker(value);
                    }
                }}
            />

            <div className="fagsagSelectContainer">
                <FormSelect<IJournalpostForm>
                    name="fagsakId"
                    className="input select w-64"
                    label={intlHelper(intl, 'opprettJournalpost.velgFagsak')}
                    disabled={fagsaker.length === 0}
                    validate={(value) => {
                        if (!value) return 'Dette feltet er påkrevd';
                        return undefined;
                    }}
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

            <FormTextField<IJournalpostForm>
                name="tittel"
                className="input w-[400px]"
                label={intlHelper(intl, 'opprettJournalpost.tittel')}
                maxLength={200}
                validate={(value) => {
                    if (!value) return 'Dette feltet er påkrevd';
                    if (value.length < 3) return 'Tittel må være minst 3 tegn';
                    return undefined;
                }}
            />

            <div className="notatContainer input">
                <FormTextarea<IJournalpostForm>
                    name="notat"
                    className="notat"
                    label={intlHelper(intl, 'opprettJournalpost.notat')}
                    maxLength={100000}
                    validate={(value) => {
                        if (!value) return 'Dette feltet er påkrevd';
                        if (value.length < 3) return 'Notat må være minst 3 tegn';
                        return undefined;
                    }}
                />
            </div>

            {!isSubmitSuccessful && (
                <Button
                    size="small"
                    type="submit"
                    className="submitButton"
                    loading={isSubmitting}
                    disabled={fagsaker.length === 0 || Object.keys(errors).length > 0}
                >
                    <FormattedMessage id={'opprettJournalpost.opprettJournalpost'} />
                </Button>
            )}

            <div className="statusContainer">
                {errors.root?.message && (
                    <>
                        <ErrorIcon />
                        <Label size="small" className="statusText">
                            {errors.root.message}
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

                {isSubmitSuccessful && (
                    <>
                        <SuccessIcon />
                        <Label size="small" className="statusText">
                            <FormattedMessage id={'opprettJournalpost.journalpostOpprettet'} />
                        </Label>
                    </>
                )}
            </div>
        </>
    );

    return (
        <div className="opprettJournalpost">
            <Heading size="medium" level="1">
                <FormattedMessage id={'opprettJournalpost.opprettJournalpost'} />
            </Heading>

            <div className="formContainer">
                <FormProvider<IJournalpostForm> form={methods} onSubmit={onSubmit}>
                    <FormFields />
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
