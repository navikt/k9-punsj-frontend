import React, { useState, ChangeEvent, useEffect } from 'react';

import { FormattedMessage, useIntl } from 'react-intl';
import { useFormContext } from 'react-hook-form';
import { BodyShort, VStack, Loader, ErrorMessage as ErrorMesageDs } from '@navikt/ds-react';

import ArbeidsgiverResponse from 'app/models/types/ArbeidsgiverResponse';
import { Person } from 'app/models/types';
import Organisasjon from 'app/models/types/Organisasjon';
import { ApiPath } from 'app/apiConfig';
import { get } from 'app/utils/apiUtils';
import getOrgNumberValidator from 'app/utils/getOrgNumberValidator';
import { BrevFormKeys, IBrevForm } from './types';
import VerticalSpacer from '../VerticalSpacer';
import { FormSelect, FormCheckbox, FormTextField } from 'app/components/form';

interface MottakerVelgerProps {
    aktørId: string;
    arbeidsgivereMedNavn: Organisasjon[];
    orgInfoPending: boolean;
    person?: Person;

    resetBrevStatus: () => void;
    setOrgInfoPending: (value: boolean) => void;
}

const MottakerVelger: React.FC<MottakerVelgerProps> = ({
    aktørId,
    arbeidsgivereMedNavn,
    orgInfoPending,
    person,

    resetBrevStatus,
    setOrgInfoPending,
}) => {
    const intl = useIntl();
    const { watch, setValue, getValues, trigger, clearErrors } = useFormContext<IBrevForm>();
    const [orgInfo, setOrgInfo] = useState<ArbeidsgiverResponse | undefined>();
    const [errorOrgInfo, setErrorOrgInfo] = useState<string | undefined>();

    const velgAnnenMottaker = watch(BrevFormKeys.velgAnnenMottaker);
    const mottaker = watch(BrevFormKeys.mottaker);

    useEffect(() => {
        if (!velgAnnenMottaker) {
            setValue(BrevFormKeys.orgNummer, '');
            setOrgInfo(undefined);
            setErrorOrgInfo(undefined);
        }
    }, [velgAnnenMottaker, setValue]);

    const hentOrgInfo = (orgnr: string) => {
        setOrgInfoPending(true);
        get(
            `${ApiPath.SØK_ORGNUMMER}?organisasjonsnummer=${orgnr}`,
            { norskIdent: aktørId },
            { 'X-Nav-NorskIdent': aktørId },
            (response, data: ArbeidsgiverResponse) => {
                if (response.ok && data?.navn) {
                    setOrgInfoPending(false);
                    setErrorOrgInfo(undefined);
                    setOrgInfo(data);
                } else {
                    setOrgInfoPending(false);
                    setErrorOrgInfo(
                        intl.formatMessage(
                            { id: 'noeGikkGalt' },
                            { error: response.statusText, status: response.status },
                        ),
                    );
                }
            },
        );
    };

    if (velgAnnenMottaker === false && orgInfoPending) {
        setOrgInfoPending(false);
    }

    return (
        <>
            <VerticalSpacer sixteenPx />

            <FormSelect<IBrevForm>
                name={BrevFormKeys.mottaker}
                label={<FormattedMessage id={`mottakerVelger.select.tittel`} />}
                className="w-[400px]"
                validate={(value: string | undefined) => {
                    if (velgAnnenMottaker) {
                        return undefined;
                    }
                    return value ? undefined : 'Dette feltet er påkrevd';
                }}
                onChange={() => {
                    resetBrevStatus();
                }}
                disabled={velgAnnenMottaker === true}
            >
                <option disabled key="default" value="">
                    <FormattedMessage id={`mottakerVelger.select.velg`} />
                </option>

                {aktørId && person && (
                    <option value={aktørId}>{`${person.sammensattNavn} - ${person.identitetsnummer}`}</option>
                )}

                {arbeidsgivereMedNavn.map((arbeidsgiver) => (
                    <option key={arbeidsgiver.organisasjonsnummer} value={arbeidsgiver.organisasjonsnummer}>
                        {`${arbeidsgiver.navn} - ${arbeidsgiver.organisasjonsnummer}`}
                    </option>
                ))}
            </FormSelect>

            <VerticalSpacer sixteenPx />

            <FormCheckbox<IBrevForm>
                name={BrevFormKeys.velgAnnenMottaker}
                label={<FormattedMessage id={`mottakerVelger.checkbox.velgAnnenMottaker`} />}
                onChange={() => {
                    resetBrevStatus();
                    const currentValue = !getValues(BrevFormKeys.velgAnnenMottaker);
                    if (currentValue && mottaker) {
                        setValue(BrevFormKeys.mottaker, '', { shouldValidate: true });
                    }
                }}
            />

            {velgAnnenMottaker && (
                <div className="flex mt-4">
                    <FormTextField<IBrevForm>
                        name={BrevFormKeys.orgNummer}
                        label={<FormattedMessage id="mottakerVelger.annenMottaker.orgNummer" />}
                        validate={(value: string) => {
                            const cleanValue = value.replace(/\s/g, '');
                            const error = getOrgNumberValidator({ required: true })(cleanValue);

                            if (errorOrgInfo) {
                                return intl.formatMessage({ id: 'orgNumberHasInvalidFormat' }, { orgnr: cleanValue });
                            }
                            return error ? intl.formatMessage({ id: error }, { orgnr: cleanValue }) : undefined;
                        }}
                        required
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9\s]*"
                        maxLength={11}
                        className="orgNrInput"
                        autoComplete="off"
                        readOnly={orgInfoPending}
                        onChange={async (event: ChangeEvent<HTMLInputElement>) => {
                            clearErrors(BrevFormKeys.orgNummer);
                            let { value } = event.target;

                            const digitsOnly = value.replace(/\D/g, '');

                            if (digitsOnly.length <= 9) {
                                value = digitsOnly.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
                                event.target.value = value;
                            }

                            const cleanValue = value.replace(/\s/g, '');

                            setErrorOrgInfo(undefined);
                            setOrgInfo(undefined);
                            resetBrevStatus();

                            if (!orgInfoPending && cleanValue.length === 9) {
                                const isValid = await trigger(BrevFormKeys.orgNummer);

                                if (isValid) {
                                    hentOrgInfo(cleanValue);
                                }
                            }
                        }}
                    />

                    {(orgInfo !== undefined || errorOrgInfo || orgInfoPending) && (
                        <VStack gap="2" className="ml-7">
                            {(orgInfo || orgInfoPending) && (
                                <BodyShort>
                                    <span className="navds-form-field__label navds-label navds-label--small">
                                        <FormattedMessage id="mottakerVelger.annenMottaker.navn" />
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
