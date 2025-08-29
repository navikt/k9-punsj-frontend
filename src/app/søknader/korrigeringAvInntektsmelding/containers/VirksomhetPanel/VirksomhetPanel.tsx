import { ErrorMessage, Field, FieldProps, useFormikContext } from 'formik';
import React, { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { ExternalLinkIcon } from '@navikt/aksel-icons';
import { Box, Fieldset, Heading, Link, Select, TextField } from '@navikt/ds-react';

import { finnArbeidsgivere } from 'app/api/api';
import Feilmelding from 'app/components/Feilmelding';
import usePrevious from 'app/hooks/usePrevious';
import { ArbeidsgivereResponse } from 'app/models/types/ArbeidsgivereResponse';
import Organisasjon from 'app/models/types/Organisasjon';
import OrganisasjonMedArbeidsforhold from 'app/models/types/OrganisasjonMedArbeidsforhold';
import { hentArbeidsgivereMedId } from 'app/state/actions/OMSPunchFormActions';
import intlHelper from 'app/utils/intlUtils';

import { AAREG_URL } from 'app/constants/eksterneLenker';
import {
    KorrigeringAvInntektsmeldingFormFields,
    KorrigeringAvInntektsmeldingFormValues,
} from '../../types/KorrigeringAvInntektsmeldingFormFieldsValues';

import './virksomhetPanel.less';

interface Props {
    søkerId: string;
}

const VirksomhetPanel = ({ søkerId }: Props) => {
    const intl = useIntl();

    const [arbeidsgivereMedNavn, setArbeidsgivereMedNavn] = useState<Organisasjon[]>([]);
    const [arbeidsgivereMedId, setArbeidsgivereMedId] = useState<OrganisasjonMedArbeidsforhold[] | null>(null);
    const [hasFetchArbeidsgiverIdError, setHasFetchArbeidsgiverIdError] = useState(false);
    const [årstallForKorrigering, setÅrstallForKorrigering] = useState<string>('');

    const { values, setFieldValue } = useFormikContext<KorrigeringAvInntektsmeldingFormValues>();
    const previousValgtVirksomhet = usePrevious(values.Virksomhet);

    useEffect(() => {
        if (årstallForKorrigering) {
            finnArbeidsgivere(
                søkerId,
                (response, data: ArbeidsgivereResponse) => {
                    setArbeidsgivereMedNavn(data?.organisasjoner || []);
                },
                `${årstallForKorrigering}-01-01`,
                `${årstallForKorrigering}-12-31`,
            );

            hentArbeidsgivereMedId(søkerId, årstallForKorrigering)
                .then((response) => response.json())
                .then((data) => {
                    if (data.exceptionId) {
                        setHasFetchArbeidsgiverIdError(true);
                    } else {
                        setArbeidsgivereMedId(data);
                    }
                });
        }
    }, [årstallForKorrigering]);

    useEffect(() => {
        if (previousValgtVirksomhet !== undefined && values.Virksomhet !== previousValgtVirksomhet) {
            setFieldValue(KorrigeringAvInntektsmeldingFormFields.ArbeidsforholdId, '');
        }
    }, [values.Virksomhet]);

    const finnArbeidsforholdIdForValgtArbeidsgiver = () =>
        arbeidsgivereMedId
            ?.filter((item) => {
                if (!item.arbeidsforholdId?.length) {
                    return false;
                }
                if (item.arbeidsforholdId?.length === 1 && item.arbeidsforholdId[0] === null) {
                    return false;
                }
                return true;
            })
            .find((item) => item.orgNummerEllerAktørID === values.Virksomhet)?.arbeidsforholdId || [];

    const validateArbeidsforholdId = (value: string) => {
        if (arbeidsgivereMedId && arbeidsgivereMedId.length > 0) {
            const arbeidsforholdIDerForValgtArbeidsgiver = finnArbeidsforholdIdForValgtArbeidsgiver();
            if (arbeidsforholdIDerForValgtArbeidsgiver.length > 0 && !value) {
                return (
                    <FormattedMessage id="omsorgspenger.korrigeringAvInntektsmelding.korrigerFravaer.validering.arbeidsforholdID" />
                );
            }
        }
        return '';
    };

    return (
        <Fieldset
            legend={
                <Heading size="small" level="3">
                    <FormattedMessage id="omsorgspenger.korrigeringAvInntektsmelding.korrigerFravaer.legend" />
                </Heading>
            }
        >
            <Box className="listepanel virksomhetPanel">
                <TextField
                    className="w-12"
                    label="Årstallet korrigeringen gjelder for"
                    onChange={(event) => {
                        const targetValue = event.target.value;
                        if (targetValue.length === 4) {
                            setÅrstallForKorrigering(targetValue);
                        }
                    }}
                />

                {hasFetchArbeidsgiverIdError && (
                    <div className="virksomhetPanel feilmelding">
                        <Feilmelding
                            feil={intlHelper(
                                intl,
                                'omsorgspenger.korrigeringAvInntektsmelding.korrigerFravaer.hasFetchArbeidsgiverIdError',
                            )}
                        />
                    </div>
                )}

                <Field name={KorrigeringAvInntektsmeldingFormFields.Virksomhet}>
                    {({ field, meta }: FieldProps) => (
                        <Select
                            className="w-64 mt-4"
                            label={intlHelper(
                                intl,
                                'omsorgspenger.korrigeringAvInntektsmelding.korrigerFravaer.velgVirksomhet',
                            )}
                            disabled={!arbeidsgivereMedId}
                            {...field}
                            error={
                                meta.touched &&
                                meta.error && <ErrorMessage name={KorrigeringAvInntektsmeldingFormFields.Virksomhet} />
                            }
                        >
                            <option disabled key="default" value="" label="">
                                <FormattedMessage id="omsorgspenger.korrigeringAvInntektsmelding.korrigerFravaer.velg" />
                            </option>

                            {arbeidsgivereMedNavn.map((arbeidsgiver) => (
                                <option key={arbeidsgiver.organisasjonsnummer} value={arbeidsgiver.organisasjonsnummer}>
                                    {`${arbeidsgiver.navn} - ${arbeidsgiver.organisasjonsnummer}`}
                                </option>
                            ))}
                        </Select>
                    )}
                </Field>

                <Link className="eksternLenke" href={AAREG_URL}>
                    <span>
                        <FormattedMessage id="omsorgspenger.korrigeringAvInntektsmelding.aaRegisteret" />
                    </span>

                    <ExternalLinkIcon />
                </Link>

                <Field
                    name={KorrigeringAvInntektsmeldingFormFields.ArbeidsforholdId}
                    validate={validateArbeidsforholdId}
                >
                    {({ field, meta }: FieldProps) => (
                        <Select
                            className="w-64 mt-4"
                            label={intlHelper(
                                intl,
                                'omsorgspenger.korrigeringAvInntektsmelding.korrigerFravaer.arbeidsforholdId',
                            )}
                            disabled={finnArbeidsforholdIdForValgtArbeidsgiver().length === 0}
                            error={
                                meta.touched &&
                                meta.error && (
                                    <ErrorMessage name={KorrigeringAvInntektsmeldingFormFields.ArbeidsforholdId} />
                                )
                            }
                            {...field}
                        >
                            <option disabled key="default" value="" label="">
                                <FormattedMessage id="omsorgspenger.korrigeringAvInntektsmelding.korrigerFravaer.velg" />
                            </option>

                            {finnArbeidsforholdIdForValgtArbeidsgiver().map((arbeidsforholdId, index) => {
                                if (arbeidsforholdId === null) {
                                    return (
                                        <option key={`null-${index}`} value="null">
                                            <FormattedMessage id="omsorgspenger.korrigeringAvInntektsmelding.korrigerFravaer.utenarbeidsforholdId" />
                                        </option>
                                    );
                                }
                                return (
                                    <option key={arbeidsforholdId} value={arbeidsforholdId}>
                                        {arbeidsforholdId}
                                    </option>
                                );
                            })}
                        </Select>
                    )}
                </Field>
            </Box>
        </Fieldset>
    );
};

export default VirksomhetPanel;
