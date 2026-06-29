import { ErrorMessage, Field, FieldProps, useFormikContext } from 'formik';
import React, { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { ExternalLinkIcon } from '@navikt/aksel-icons';
import { Box, ErrorMessage as AkselErrorMessage, Heading, Label, Link, Select, TextField, VStack } from '@navikt/ds-react';

import { finnArbeidsgivere } from 'app/api/api';
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
import { arbeidsforholdIdFieldId, virksomhetFieldId } from '../formFieldIds';

import './virksomhetPanel.css';

interface Props {
    søkerId: string;
}

const findYearForKorrigering = (values: KorrigeringAvInntektsmeldingFormValues) =>
    values.Trekkperioder.find((periode) => periode.fom)?.fom?.slice(0, 4) ||
    values.PerioderMedRefusjonskrav.find((periode) => periode.fom)?.fom?.slice(0, 4) ||
    values.DagerMedDelvisFravær.find((dag) => dag.dato)?.dato?.slice(0, 4) ||
    values.OpplysningerOmKorrigering.dato?.slice(0, 4) ||
    '';

const VirksomhetPanel = ({ søkerId }: Props) => {
    const intl = useIntl();

    const [arbeidsgivereMedNavn, setArbeidsgivereMedNavn] = useState<Organisasjon[]>([]);
    const [arbeidsgivereMedId, setArbeidsgivereMedId] = useState<OrganisasjonMedArbeidsforhold[] | null>(null);
    const [hasFetchArbeidsgiverIdError, setHasFetchArbeidsgiverIdError] = useState(false);
    const [årstallForKorrigering, setÅrstallForKorrigering] = useState<string>('');

    const { values, setFieldValue } = useFormikContext<KorrigeringAvInntektsmeldingFormValues>();
    const previousValgtVirksomhet = usePrevious(values.Virksomhet);

    useEffect(() => {
        if (årstallForKorrigering.length === 4) {
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
    }, [søkerId, årstallForKorrigering]);

    useEffect(() => {
        if (årstallForKorrigering) {
            return;
        }

        const derivedYear = findYearForKorrigering(values);
        if (derivedYear) {
            setÅrstallForKorrigering(derivedYear);
        }
    }, [values, årstallForKorrigering]);

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
                return intlHelper(
                    intl,
                    'omsorgspenger.korrigeringAvInntektsmelding.korrigerFravaer.validering.arbeidsforholdID',
                );
            }
        }
        return '';
    };

    return (
        <div className="korrigering__seksjon">
            <Box padding="space-16" borderWidth="1" borderRadius="8">
                <VStack gap="space-16">
                    <Heading size="small" level="3">
                        <FormattedMessage id="omsorgspenger.korrigeringAvInntektsmelding.korrigerFravaer.legend" />
                    </Heading>

                    <Box borderRadius="8" background="neutral-soft" className="virksomhetPanel">
                        <VStack gap="space-16">
                            <div>
                                <Label>Årstallet korrigeringen gjelder for</Label>
                                <TextField
                                    className="w-18 mt-2"
                                    label="Årstallet korrigeringen gjelder for"
                                    hideLabel
                                    value={årstallForKorrigering}
                                    onChange={(event) => {
                                        setÅrstallForKorrigering(event.target.value);
                                    }}
                                />
                            </div>

                            {hasFetchArbeidsgiverIdError && (
                                <div className="virksomhetPanel feilmelding">
                                    <AkselErrorMessage showIcon>
                                        {intlHelper(
                                            intl,
                                            'omsorgspenger.korrigeringAvInntektsmelding.korrigerFravaer.hasFetchArbeidsgiverIdError',
                                        )}
                                    </AkselErrorMessage>
                                </div>
                            )}

                            <Field name={KorrigeringAvInntektsmeldingFormFields.Virksomhet}>
                                {({ field, meta }: FieldProps) => (
                                    <Select
                                        id={virksomhetFieldId}
                                        className="w-64"
                                        label={intlHelper(
                                            intl,
                                            'omsorgspenger.korrigeringAvInntektsmelding.korrigerFravaer.velgVirksomhet',
                                        )}
                                        disabled={!arbeidsgivereMedId}
                                        {...field}
                                        error={
                                            meta.touched &&
                                            meta.error && (
                                                <ErrorMessage name={KorrigeringAvInntektsmeldingFormFields.Virksomhet} />
                                            )
                                        }
                                    >
                                        <option disabled key="default" value="" label="">
                                            <FormattedMessage id="omsorgspenger.korrigeringAvInntektsmelding.korrigerFravaer.velg" />
                                        </option>

                                        {arbeidsgivereMedNavn.map((arbeidsgiver) => (
                                            <option
                                                key={arbeidsgiver.organisasjonsnummer}
                                                value={arbeidsgiver.organisasjonsnummer}
                                            >
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
                                        id={arbeidsforholdIdFieldId}
                                        className="w-64"
                                        label={intlHelper(
                                            intl,
                                            'omsorgspenger.korrigeringAvInntektsmelding.korrigerFravaer.arbeidsforholdId',
                                        )}
                                        disabled={finnArbeidsforholdIdForValgtArbeidsgiver().length === 0}
                                        error={
                                            meta.touched &&
                                            meta.error && (
                                                <ErrorMessage
                                                    name={KorrigeringAvInntektsmeldingFormFields.ArbeidsforholdId}
                                                />
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
                        </VStack>
                    </Box>
                </VStack>
            </Box>
        </div>
    );
};

export default VirksomhetPanel;
