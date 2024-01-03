import { ErrorMessage, Field, FieldProps, useFormikContext } from 'formik';
import React, { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    BodyShort,
    Checkbox,
    Select,
    TextField,
    VStack,
    Loader,
    ErrorMessage as ErrorMesageDs,
} from '@navikt/ds-react';

import BrevFormKeys from 'app/models/enums/BrevFormKeys';
import { Person } from 'app/models/types';
import Organisasjon from 'app/models/types/Organisasjon';
import { requiredValue } from 'app/utils/validationHelpers';
import getOrgNumberValidator from 'app/utils/getOrgNumberValidator';
import BrevFormValues from 'app/models/types/brev/BrevFormValues';
import ArbeidsgiverResponse from 'app/models/types/ArbeidsgiverResponse';
import { get } from 'app/utils/apiUtils';
import { ApiPath } from 'app/apiConfig';
import VerticalSpacer from '../VerticalSpacer';

export interface OrgInfo {
    organisasjonsnummer: string;
    navn: string;
    konkurs: boolean;
}

interface MottakerVelgerProps {
    resetBrevStatus: () => void;
    aktørId: string;
    person?: Person;
    orgInfoPending: boolean;
    setOrgInfoPending: (value: boolean) => void;
    arbeidsgivereMedNavn: Organisasjon[];
}

const MottakerVelger: React.FC<MottakerVelgerProps> = ({
    resetBrevStatus,
    aktørId,
    person,
    orgInfoPending,
    setOrgInfoPending,
    arbeidsgivereMedNavn,
}) => {
    const intl = useIntl();
    const { values, setFieldValue } = useFormikContext<BrevFormValues>();
    const [orgInfo, setOrgInfo] = useState<ArbeidsgiverResponse | undefined>();
    const [errorOrgInfo, setErrorOrgInfo] = useState<string | undefined>();

    const hentOrgInfo = (orgnr: string) => {
        setOrgInfoPending(true);
        get(
            `${ApiPath.SØK_ORGNUMMER}?organisasjonsnummer=${orgnr}`,
            { norskIdent: aktørId },
            { 'X-Nav-NorskIdent': aktørId },
            (response, data: ArbeidsgiverResponse) => {
                if (response.status === 200) {
                    if (data.navn) {
                        setOrgInfoPending(false);
                        setErrorOrgInfo(undefined);
                        setOrgInfo(data);
                    }
                }
                if (response.status === 404) {
                    setOrgInfoPending(false);
                    setErrorOrgInfo(intl.formatMessage({ id: 'orgNumberHasInvalidFormat' }, { orgnr }));
                }
            },
        );
    };

    if (values.velgAnnenMottaker === false && orgInfoPending) {
        setOrgInfoPending(false);
    }
    return (
        <>
            <VerticalSpacer sixteenPx />
            <Field
                name={BrevFormKeys.mottaker}
                validate={(value: string) => {
                    if (values.velgAnnenMottaker) {
                        return undefined;
                    }
                    return requiredValue(value);
                }}
            >
                {({ field, meta }: FieldProps) => (
                    <Select
                        {...field}
                        size="small"
                        label={intl.formatMessage({ id: 'Messages.ChooseRecipient' })}
                        className="w-[400px] "
                        error={meta.touched && meta.error && <ErrorMessage name={field.name} />}
                        onChange={(event) => {
                            setFieldValue(field.name, event.target.value);
                            resetBrevStatus();
                        }}
                        disabled={values.velgAnnenMottaker === true}
                    >
                        <option disabled key="default" value="" label="">
                            Velg
                        </option>
                        {aktørId && person && (
                            <option value={aktørId}>{`${person.sammensattNavn} - ${person.identitetsnummer}`}</option>
                        )}
                        {arbeidsgivereMedNavn.map((arbeidsgiver) => (
                            <option key={arbeidsgiver.organisasjonsnummer} value={arbeidsgiver.organisasjonsnummer}>
                                {`${arbeidsgiver.navn} - ${arbeidsgiver.organisasjonsnummer}`}
                            </option>
                        ))}
                    </Select>
                )}
            </Field>
            <VerticalSpacer sixteenPx />
            <Field name={BrevFormKeys.velgAnnenMottaker}>
                {({ field }: FieldProps) => (
                    <Checkbox {...field} size="small">
                        <FormattedMessage id="Messages.velgAnnenMottaker" />
                    </Checkbox>
                )}
            </Field>
            {values.velgAnnenMottaker && (
                <div className="flex">
                    <Field
                        name={BrevFormKeys.orgNummer}
                        validate={(value: string) => {
                            const error = getOrgNumberValidator({ required: true })(value);

                            if (errorOrgInfo) {
                                return intl.formatMessage({ id: 'orgNumberHasInvalidFormat' }, { orgnr: value });
                            }
                            return error ? intl.formatMessage({ id: error }, { orgnr: value }) : undefined;
                        }}
                    >
                        {({ field, meta }: FieldProps) => (
                            <TextField
                                label={intl.formatMessage({ id: 'Messages.orgNummer' })}
                                {...field}
                                type="text"
                                size="small"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={9}
                                autoComplete="off"
                                readOnly={orgInfoPending}
                                onChange={(event) => {
                                    setFieldValue(field.name, event.target.value);
                                    setErrorOrgInfo(undefined);
                                    setOrgInfo(undefined);
                                    resetBrevStatus();
                                    const { value } = event.target;
                                    if (
                                        !orgInfoPending &&
                                        value.length === 9 &&
                                        getOrgNumberValidator({ required: true })(value) === undefined
                                    ) {
                                        hentOrgInfo(value);
                                    }
                                }}
                                error={meta.touched && meta.error && <ErrorMessage name={field.name} />}
                            />
                        )}
                    </Field>
                    {(orgInfo !== undefined || errorOrgInfo || orgInfoPending) && (
                        <VStack gap="2" className="ml-7">
                            <BodyShort>
                                <span className="font-extrabold">
                                    <FormattedMessage id="Messages.annenMottaker.navn" />
                                </span>
                            </BodyShort>
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
