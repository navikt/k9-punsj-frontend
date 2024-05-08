import { Field, FieldArray, FieldProps, FormikProps, useFormikContext } from 'formik';
import React, { useState } from 'react';
import { useQuery } from 'react-query';

import { AddCircle, Delete } from '@navikt/ds-icons';
import { Button, Checkbox, Heading, Panel } from '@navikt/ds-react';

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

interface OwnProps {
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
}: OwnProps) => {
    const [gjelderAnnenOrganisasjon, setGjelderAnnenOrganisasjon] = useState(false);
    const { values } = useFormikContext<IOMPUTSoknad>();
    const fom = søknadsperiodeFraSak?.fom;
    const tom = søknadsperiodeFraSak?.tom;

    const { data: organisasjoner } = useQuery<Organisasjon[]>(
        ['organisasjoner'],
        () =>
            finnArbeidsgivere(values.soekerId, undefined, fom, tom).then((response) => {
                if (response.ok) {
                    return response.json().then((json) => json.organisasjoner);
                }
                return [];
            }),
        {
            onSuccess: (data) => {
                const orgnr = values.opptjeningAktivitet.arbeidstaker[arbeidstakerIndex].organisasjonsnummer;
                if (orgnr && !data.some((org) => org.organisasjonsnummer === orgnr)) {
                    setGjelderAnnenOrganisasjon(true);
                }
            },
            staleTime: 1000 * 60 * 5,
        },
    );

    const harMinstToArbeidsforhold = antallArbeidsforhold > 1;

    const toggleGjelderAnnenOrganisasjon = (form: FormikProps<IOMPUTSoknad>) => {
        setGjelderAnnenOrganisasjon(!gjelderAnnenOrganisasjon);
        form.setFieldValue(`opptjeningAktivitet.arbeidstaker[${arbeidstakerIndex}].organisasjonsnummer`, '');
    };
    return (
        <Field name={`opptjeningAktivitet.arbeidstaker[${arbeidstakerIndex}]`}>
            {({ field: { value, name }, form }: FieldProps<ArbeidstakerType>) => (
                <div className="arbeidsforhold-container">
                    <Panel className="container">
                        <div>
                            {harMinstToArbeidsforhold && (
                                <>
                                    <Heading size="xsmall" level="5">{`Arbeidsforhold ${
                                        arbeidstakerIndex + 1
                                    }`}</Heading>
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
                                    Fjern arbeidsforhold
                                </Button>
                            )}
                            <Checkbox
                                onChange={() => toggleGjelderAnnenOrganisasjon(form)}
                                checked={gjelderAnnenOrganisasjon}
                            >
                                Gjelder annen organisasjon
                            </Checkbox>
                            {gjelderAnnenOrganisasjon && (
                                <TextFieldFormik
                                    size="small"
                                    label="Organisasjonsnummer"
                                    name={`${name}.organisasjonsnummer`}
                                />
                            )}
                        </div>
                        <hr />
                        <Heading size="small">Informasjon om fraværsperioder</Heading>
                        <FieldArray
                            name={`${name}.fravaersperioder`}
                            render={(arrayHelpers) => (
                                <>
                                    {value.fravaersperioder?.map((fravaersperiode, fravaersperiodeIndex) => (
                                        <Fravaersperiode
                                            // eslint-disable-next-line react/no-array-index-key
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
                                        Legg til periode
                                    </Button>
                                </>
                            )}
                        />
                    </Panel>
                </div>
            )}
        </Field>
    );
};

export default Arbeidstaker;
