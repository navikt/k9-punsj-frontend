import React, { useEffect, useState } from 'react';

import { FormattedMessage } from 'react-intl';
import { Field, FieldArray, FieldProps, FormikProps, useFormikContext } from 'formik';
import { useQuery } from '@tanstack/react-query';
import { AddCircle, Delete } from '@navikt/ds-icons';
import { Button, Checkbox, Heading, Box } from '@navikt/ds-react';

import { finnArbeidsgivere } from 'app/api/api';
import VerticalSpacer from 'app/components/VerticalSpacer';
import TextFieldFormik from 'app/components/formikInput/TextFieldFormik';
import Organisasjonsvelger from 'app/components/organisasjon/Organisasjonvelger';
import Organisasjon from 'app/models/types/Organisasjon';

import { fravaersperiodeInitialValue } from '../initialValues';
import { aktivitetsFravær } from '../konstanter';
import { Arbeidstaker as ArbeidstakerType, IOMPUTSoknad } from '../types/OMPUTSoknad';
import Fravaersperiode from './Fravaersperiode';

import './arbeidsforhold.less';

interface Props {
    index: number;
    slettArbeidsforhold: () => void;
    antallArbeidsforhold: number;
    søknadsperiodeFraSak?: { fom: string; tom: string };
}

const Arbeidstaker = ({
    index: arbeidstakerIndex,
    slettArbeidsforhold,
    antallArbeidsforhold,
    søknadsperiodeFraSak,
}: Props) => {
    const [gjelderAnnenOrganisasjon, setGjelderAnnenOrganisasjon] = useState(false);

    const { values } = useFormikContext<IOMPUTSoknad>();

    const fom = søknadsperiodeFraSak?.fom;
    const tom = søknadsperiodeFraSak?.tom;

    const { data: organisasjoner } = useQuery<Organisasjon[]>({
        queryKey: ['organisasjoner'],
        queryFn: () =>
            finnArbeidsgivere(values.soekerId, undefined, fom, tom).then((response) => {
                if (response.ok) {
                    return response.json().then((json) => json.organisasjoner);
                }
                return [];
            }),

        staleTime: 1000 * 60 * 5,
    });

    useEffect(() => {
        if (organisasjoner) {
            const orgnr = values.opptjeningAktivitet.arbeidstaker[arbeidstakerIndex].organisasjonsnummer;
            if (orgnr && !organisasjoner.some((org) => org.organisasjonsnummer === orgnr)) {
                setGjelderAnnenOrganisasjon(true);
            }
        }
    }, [organisasjoner, values.opptjeningAktivitet.arbeidstaker, arbeidstakerIndex]);

    const harMinstToArbeidsforhold = antallArbeidsforhold > 1;

    const toggleGjelderAnnenOrganisasjon = (form: FormikProps<IOMPUTSoknad>) => {
        setGjelderAnnenOrganisasjon(!gjelderAnnenOrganisasjon);
        form.setFieldValue(`opptjeningAktivitet.arbeidstaker[${arbeidstakerIndex}].organisasjonsnummer`, '');
    };

    return (
        <Field name={`opptjeningAktivitet.arbeidstaker[${arbeidstakerIndex}]`}>
            {({ field: { value, name }, form }: FieldProps<ArbeidstakerType>) => (
                <div className="arbeidsforhold-container">
                    <Box className="container">
                        <div>
                            {harMinstToArbeidsforhold && (
                                <>
                                    <Heading size="xsmall" level="5">
                                        <FormattedMessage
                                            id="omsorgspenger.utbetaling.punchForm.arbeidstaker.arbeidsforhold"
                                            values={{ index: arbeidstakerIndex + 1 }}
                                        />
                                    </Heading>

                                    <VerticalSpacer twentyPx />
                                </>
                            )}
                            <Organisasjonsvelger
                                name={`opptjeningAktivitet.arbeidstaker[${arbeidstakerIndex}].organisasjonsnummer`}
                                disabled={gjelderAnnenOrganisasjon}
                                className="inline-block"
                                organisasjoner={organisasjoner}
                            />
                            {harMinstToArbeidsforhold && (
                                <Button
                                    variant="tertiary"
                                    size="small"
                                    className="slett"
                                    onClick={slettArbeidsforhold}
                                    icon={<Delete />}
                                >
                                    <FormattedMessage id="omsorgspenger.utbetaling.punchForm.arbeidstaker.fjernAF.btn" />
                                </Button>
                            )}
                            <Checkbox
                                onChange={() => toggleGjelderAnnenOrganisasjon(form)}
                                checked={gjelderAnnenOrganisasjon}
                            >
                                <FormattedMessage id="omsorgspenger.utbetaling.punchForm.arbeidstaker.gjelderAnnenOrg.checkbox" />
                            </Checkbox>

                            {gjelderAnnenOrganisasjon && (
                                <div className="input-row">
                                    <TextFieldFormik
                                        size="small"
                                        label="Organisasjonsnummer"
                                        name={`${name}.organisasjonsnummer`}
                                    />
                                </div>
                            )}
                        </div>

                        <hr />

                        <div className="mt-4">
                            <Heading size="small">
                                <FormattedMessage id="omsorgspenger.utbetaling.punchForm.arbeidstaker.infoOmfraværPerioder.tittel" />
                            </Heading>
                        </div>

                        <FieldArray
                            name={`${name}.fravaersperioder`}
                            render={(arrayHelpers) => (
                                <>
                                    {value.fravaersperioder?.map((fravaersperiode, fravaersperiodeIndex) => (
                                        <Fravaersperiode
                                            key={fravaersperiodeIndex}
                                            name={`${name}.fravaersperioder[${fravaersperiodeIndex}]`}
                                            antallFravaersperioder={value.fravaersperioder?.length}
                                            slettPeriode={() => arrayHelpers.remove(fravaersperiodeIndex)}
                                            visSoknadAarsak
                                        />
                                    ))}

                                    <Button
                                        variant="tertiary"
                                        size="small"
                                        onClick={() =>
                                            arrayHelpers.push({
                                                ...fravaersperiodeInitialValue,
                                                aktivitetsFravær: aktivitetsFravær.ARBEIDSTAKER,
                                            })
                                        }
                                        icon={<AddCircle />}
                                    >
                                        <FormattedMessage id="omsorgspenger.utbetaling.punchForm.arbeidstaker.leggTil.btn" />
                                    </Button>
                                </>
                            )}
                        />
                    </Box>
                </div>
            )}
        </Field>
    );
};

export default Arbeidstaker;
