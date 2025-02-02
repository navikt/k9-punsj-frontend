import React, { useState, ChangeEvent } from 'react';

import { FormattedMessage, useIntl } from 'react-intl';
import { useFormContext, UseFormSetError } from 'react-hook-form';
import { BodyShort, VStack, Loader, ErrorMessage as ErrorMesageDs } from '@navikt/ds-react';

import ArbeidsgiverResponse from 'app/models/types/ArbeidsgiverResponse';
import { Person } from 'app/models/types';
import Organisasjon from 'app/models/types/Organisasjon';
import { ApiPath } from 'app/apiConfig';
import { get } from 'app/utils/apiUtils';
import { BrevFormKeys, IBrevForm } from './types';
import VerticalSpacer from '../VerticalSpacer';
import { getTypedFormComponents } from 'app/components/form/getTypedFormComponents';
import { useValidationRulesBrev } from './useValidationRules';

const { TypedFormSelect, TypedFormCheckbox, TypedFormTextField } = getTypedFormComponents<IBrevForm>();
interface Props {
    aktørId: string;
    arbeidsgivereMedNavn: Organisasjon[];
    orgInfoPending: boolean;
    person?: Person;
    errorOrgInfo?: string;

    setError: UseFormSetError<IBrevForm>;
    resetBrevStatus: () => void;
    setOrgInfoPending: (value: boolean) => void;
}

const MottakerVelger: React.FC<Props> = ({
    aktørId,
    arbeidsgivereMedNavn,
    orgInfoPending,
    person,
    errorOrgInfo,

    setError,
    resetBrevStatus,
    setOrgInfoPending,
}) => {
    const intl = useIntl();

    const { watch, setValue, getValues, trigger, clearErrors } = useFormContext<IBrevForm>();

    const [orgInfo, setOrgInfo] = useState<ArbeidsgiverResponse | undefined>();

    const velgAnnenMottaker = watch(BrevFormKeys.velgAnnenMottaker);
    const mottaker = watch(BrevFormKeys.mottaker);

    const { mottakerValidationRules, annenMottakerOrgNummerValidationRules } = useValidationRulesBrev();

    const hentOrgInfo = (orgnr: string) => {
        setOrgInfoPending(true);
        get(
            `${ApiPath.SØK_ORGNUMMER}?organisasjonsnummer=${orgnr}`,
            { norskIdent: aktørId },
            { 'X-Nav-NorskIdent': aktørId },
            (response, data: ArbeidsgiverResponse) => {
                if (response.ok && data?.navn) {
                    setOrgInfoPending(false);
                    clearErrors(BrevFormKeys.annenMottakerOrgNummer);
                    setOrgInfo(data);
                } else {
                    setOrgInfoPending(false);
                    setError(BrevFormKeys.annenMottakerOrgNummer, {
                        type: 'manual',
                        message: intl.formatMessage(
                            { id: 'noeGikkGalt' },
                            { error: response.statusText, status: response.status },
                        ),
                    });
                }
            },
        );
    };

    const handleVelgAnnenMottakerOnChange = () => {
        resetBrevStatus();
        setValue(BrevFormKeys.annenMottakerOrgNummer, '', { shouldValidate: false });
        setOrgInfoPending(false);
        setOrgInfo(undefined);
        clearErrors(BrevFormKeys.annenMottakerOrgNummer);

        const currentValue = !getValues(BrevFormKeys.velgAnnenMottaker);

        if (currentValue && mottaker) {
            setValue(BrevFormKeys.mottaker, '', { shouldValidate: false });
        }
    };

    const handleAnnenMottakerOrgNummerOnChange = async (event: ChangeEvent<HTMLInputElement>) => {
        let { value } = event.target;
        const digitsOnly = value.replace(/\D/g, '');

        if (digitsOnly.length <= 9) {
            value = digitsOnly.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
            event.target.value = value;
        }

        const cleanValue = value.replace(/\s/g, '');

        clearErrors(BrevFormKeys.annenMottakerOrgNummer);
        setOrgInfo(undefined);
        resetBrevStatus();

        if (!orgInfoPending && cleanValue.length === 9) {
            const isValid = await trigger(BrevFormKeys.annenMottakerOrgNummer);

            if (isValid) {
                hentOrgInfo(cleanValue);
            }
        }
    };

    return (
        <>
            <VerticalSpacer sixteenPx />

            <TypedFormSelect
                name={BrevFormKeys.mottaker}
                label={<FormattedMessage id="brevComponent.mottakerVelger.select.mottaker.label" />}
                className="w-[400px]"
                validate={mottakerValidationRules}
                onChange={() => {
                    resetBrevStatus();
                }}
                disabled={velgAnnenMottaker}
            >
                <option disabled key="default" value="">
                    <FormattedMessage id="brevComponent.mottakerVelger.select.mottaker.option.velg" />
                </option>

                {aktørId && person && (
                    <option value={aktørId}>{`${person.sammensattNavn} - ${person.identitetsnummer}`}</option>
                )}

                {arbeidsgivereMedNavn.map((arbeidsgiver) => (
                    <option key={arbeidsgiver.organisasjonsnummer} value={arbeidsgiver.organisasjonsnummer}>
                        {`${arbeidsgiver.navn} - ${arbeidsgiver.organisasjonsnummer}`}
                    </option>
                ))}
            </TypedFormSelect>

            <VerticalSpacer sixteenPx />

            <TypedFormCheckbox
                name={BrevFormKeys.velgAnnenMottaker}
                label={<FormattedMessage id="brevComponent.mottakerVelger.checkbox.velgAnnenMottaker.label" />}
                onChange={handleVelgAnnenMottakerOnChange}
            />

            {velgAnnenMottaker && (
                <div className="flex mt-4">
                    <TypedFormTextField
                        name={BrevFormKeys.annenMottakerOrgNummer}
                        label={
                            <FormattedMessage id="brevComponent.mottakerVelger.textField.annenMottakerOrgNummer.label" />
                        }
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9\s]*"
                        maxLength={11}
                        validate={annenMottakerOrgNummerValidationRules}
                        className="orgNrInput"
                        autoComplete="off"
                        readOnly={orgInfoPending}
                        onChange={handleAnnenMottakerOrgNummerOnChange}
                    />

                    {(orgInfo !== undefined || errorOrgInfo || orgInfoPending) && (
                        <VStack gap="2" className="ml-7">
                            {(orgInfo || orgInfoPending) && (
                                <BodyShort>
                                    <span className="navds-form-field__label navds-label navds-label--small">
                                        <FormattedMessage id="brevComponent.mottakerVelger.annenMottaker.navn" />
                                    </span>
                                </BodyShort>
                            )}

                            {orgInfoPending && <Loader size="small" title="venter..." />}

                            {errorOrgInfo && <ErrorMesageDs>{errorOrgInfo}</ErrorMesageDs>}

                            {orgInfo && <BodyShort>{orgInfo.navn}</BodyShort>}
                        </VStack>
                    )}
                </div>
            )}
        </>
    );
};

export default MottakerVelger;
