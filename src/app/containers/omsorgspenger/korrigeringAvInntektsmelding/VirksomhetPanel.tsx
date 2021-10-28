/* eslint-disable react/jsx-props-no-spreading */
import { ExternalLink } from '@navikt/ds-icons';
import { finnArbeidsgivere } from 'app/api/api';
import Organisasjon from 'app/models/types/Organisasjon';
import intlHelper from 'app/utils/intlUtils';
import { Field, FieldProps } from 'formik';
import Lenke from 'nav-frontend-lenker';
import Panel from 'nav-frontend-paneler';
import { Input, Select, SkjemaGruppe } from 'nav-frontend-skjema';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { AAREG_URL } from '../../../constants/eksterneLenker';
import { ArbeidsgivereResponse } from '../../../models/types/ArbeidsgivereResponse';
import './virksomhetPanel.less';
import { KorrigeringAvInntektsmeldingFormFields } from './KorrigeringAvInntektsmeldingFormFieldsValues';

interface IVirksomhetPanelProps {
    søkerId?: string;
}
export default function VirksomhetPanel({ søkerId }: IVirksomhetPanelProps): JSX.Element {
    const [arbeidsgivere, setArbeidsgivere] = useState<Organisasjon[]>([]);
    const intl = useIntl();

    useEffect(() => {
        if (søkerId) {
            finnArbeidsgivere(søkerId, (response, data: ArbeidsgivereResponse) => {
                setArbeidsgivere(data?.organisasjoner || []);
            });
        }
    }, [søkerId]);

    return (
        <SkjemaGruppe
            legend={
                <h4 className="korrigering-legend">
                    {intlHelper(intl, 'omsorgspenger.korrigeringAvInntektsmelding.korrigerFravaer.legend')}
                </h4>
            }
        >
            <Panel className="listepanel virksomhetPanel">
                <Field name={KorrigeringAvInntektsmeldingFormFields.VIRKSOMHET}>
                    {({ field }: FieldProps) => (
                        <Select
                            bredde="l"
                            label={intlHelper(
                                intl,
                                'omsorgspenger.korrigeringAvInntektsmelding.korrigerFravaer.velgVirksomhet'
                            )}
                            {...field}
                        >
                            <option key="default" value="" label="" aria-label="Tomt valg" />)
                            {arbeidsgivere.map((arbeidsgiver) => (
                                <option key={arbeidsgiver.organisasjonsnummer} value={arbeidsgiver.organisasjonsnummer}>
                                    {`${arbeidsgiver.navn} - ${arbeidsgiver.organisasjonsnummer}`}
                                </option>
                            ))}
                        </Select>
                    )}
                </Field>
                <Lenke className="eksternLenke" href={AAREG_URL}>
                    <span>Aa-registeret</span> <ExternalLink />
                </Lenke>
                <Field name={KorrigeringAvInntektsmeldingFormFields.ARBEIDSFORHOLD_ID}>
                    {({ field }: FieldProps) => (
                        <Input
                            bredde="L"
                            label={intlHelper(
                                intl,
                                'omsorgspenger.korrigeringAvInntektsmelding.korrigerFravaer.arbeidsforholdId'
                            )}
                            {...field}
                        />
                    )}
                </Field>
            </Panel>
        </SkjemaGruppe>
    );
}
