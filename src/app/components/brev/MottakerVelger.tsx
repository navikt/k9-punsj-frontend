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
import { getOrgInfo } from 'app/utils';
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
    const [orgInfo, setOrgInfo] = useState<OrgInfo | undefined>();
    const [errorOrgInfo, setErrorOrgInfo] = useState<string | undefined>();

    const hentOrgInfo = (orgnummer: string) => {
        setOrgInfoPending(true);
        getOrgInfo(orgnummer, (response, data: OrgInfo) => {
            if (response.status === 200) {
                setOrgInfoPending(false);
                setErrorOrgInfo(undefined);
                setOrgInfo(data);
            } else {
                setOrgInfoPending(false);
                setErrorOrgInfo(intl.formatMessage({ id: 'orgNumberHasInvalidFormat' }));
            }
        });
    };
    if (values.velgAnnetMottaker === false && orgInfoPending) {
        setOrgInfoPending(false);
    }
    return (
        <>
            <VerticalSpacer sixteenPx />
            <Field
                name={BrevFormKeys.mottaker}
                validate={(value: string) => {
                    if (values.velgAnnetMottaker) {
                        return undefined;
                    }
                    return requiredValue(value);
                }}
            >
                {({ field, meta }: FieldProps) => (
                    <Select
                        {...field}
                        label={intl.formatMessage({ id: 'Messages.ChooseRecipient' })}
                        placeholder={intl.formatMessage({ id: 'Messages.ChooseRecipient' })}
                        className="w-[400px] "
                        error={meta.touched && meta.error && <ErrorMessage name={field.name} />}
                        onChange={(event) => {
                            setFieldValue(field.name, event.target.value);
                            resetBrevStatus();
                        }}
                        disabled={values.velgAnnetMottaker === true}
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
            <Field name={BrevFormKeys.velgAnnetMottaker}>
                {({ field }: FieldProps) => (
                    <Checkbox {...field}>
                        <FormattedMessage id="Messages.velgAnnetMottaker" />
                    </Checkbox>
                )}
            </Field>
            {values.velgAnnetMottaker && (
                <div className="annetMottakerInfo">
                    <Field
                        name={BrevFormKeys.orgNummer}
                        validate={(value: string) => {
                            const error = getOrgNumberValidator({ required: true })(value);
                            if (orgInfo && orgInfo.konkurs) {
                                return intl.formatMessage({ id: 'ValidationMessage.brev.orgNummer.konkurs' });
                            }

                            if (errorOrgInfo) {
                                return intl.formatMessage({ id: 'orgNumberHasInvalidFormat' });
                            }
                            return error ? intl.formatMessage({ id: error }) : undefined;
                        }}
                    >
                        {({ field, meta }: FieldProps) => (
                            <TextField
                                label={intl.formatMessage({ id: 'Messages.orgNummer' })}
                                {...field}
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
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
                                    <FormattedMessage id="Messages.annetMottaker.navn" />
                                </span>
                            </BodyShort>
                            {orgInfoPending && <Loader size="small" title="venter..." />}
                            {errorOrgInfo && <ErrorMesageDs>{errorOrgInfo}</ErrorMesageDs>}
                            {orgInfo && (
                                <BodyShort>
                                    {orgInfo.navn}{' '}
                                    {orgInfo.konkurs && (
                                        <span className="text-red-600">
                                            <FormattedMessage id="Messages.annetMottaker.konkurs" />
                                        </span>
                                    )}
                                </BodyShort>
                            )}
                        </VStack>
                    )}
                </div>
            )}
        </>
    );
};

export default MottakerVelger;
