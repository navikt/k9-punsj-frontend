import { Field, FieldArray, FieldProps, useFormikContext } from 'formik';
import { capitalize } from 'lodash';
import React from 'react';
import { useIntl } from 'react-intl';

import { AddCircle } from '@navikt/ds-icons';
import { Button, Heading, Panel } from '@navikt/ds-react';

import VerticalSpacer from 'app/components/VerticalSpacer';
import DatoInputFormik from 'app/components/formikInput/DatoInputFormik';
import RadioFormik from 'app/components/formikInput/RadioFormik';
import RadioGroupFormik from 'app/components/formikInput/RadioGroupFormik';
import RadioPanelGruppeFormik from 'app/components/formikInput/RadioPanelGruppeFormik';
import { JaNei } from 'app/models/enums';
import intlHelper from 'app/utils/intlUtils';

import { fravaersperiodeInitialValue } from '../initialValues';
import { aktivitetsFravær } from '../konstanter';
import { IOMPUTSoknad } from '../types/OMPUTSoknad';
import Fravaersperiode from './Fravaersperiode';
import './arbeidsforhold.less';

export default function Frilanser() {
    const { values } = useFormikContext<IOMPUTSoknad>();
    const intl = useIntl();
    const {
        opptjeningAktivitet: { frilanser },
    } = values;

    return (
        <div className="arbeidsforhold-container">
            <Panel border>
                <Heading size="small" level="5">
                    Frilanser
                </Heading>
                <VerticalSpacer twentyPx />
                {!values.erKorrigering && (
                    <>
                        <Field name="metadata.harSoekerDekketOmsorgsdager">
                            {({ field, form }: FieldProps<boolean>) => (
                                <RadioPanelGruppeFormik
                                    legend={intlHelper(intl, 'skjema.harSoekerDekketOmsorgsdager')}
                                    description={intlHelper(intl, 'skjema.harSoekerDekketOmsorgsdager.hjelp')}
                                    name={field.name}
                                    options={Object.values(JaNei).map((v) => ({ value: v, label: capitalize(v) }))}
                                    onChange={(e, value) => form.setFieldValue(field.name, value)}
                                />
                            )}
                        </Field>
                        <VerticalSpacer sixteenPx />
                    </>
                )}
                <DatoInputFormik
                    label="Når startet søker som frilanser?"
                    name="opptjeningAktivitet.frilanser.startdato"
                />
                <VerticalSpacer twentyPx />

                <Field name="opptjeningAktivitet.frilanser.jobberFortsattSomFrilans">
                    {({ field, form }: FieldProps<string>) => (
                        <RadioGroupFormik
                            legend="Jobber søker fortsatt som frilanser?"
                            size="small"
                            name={field.name}
                            value={field.value ? 'ja' : 'nei'}
                        >
                            <RadioFormik
                                name={field.name}
                                value="ja"
                                onChange={() => form.setFieldValue(field.name, true)}
                            >
                                Ja
                            </RadioFormik>
                            <RadioFormik
                                name={field.name}
                                value="nei"
                                onChange={() => form.setFieldValue(field.name, false)}
                            >
                                Nei
                            </RadioFormik>
                        </RadioGroupFormik>
                    )}
                </Field>
                <VerticalSpacer twentyPx />

                {!frilanser.jobberFortsattSomFrilans && (
                    <>
                        <DatoInputFormik
                            label="Når sluttet søker som frilanser?"
                            name="opptjeningAktivitet.frilanser.sluttdato"
                        />
                        <VerticalSpacer twentyPx />
                    </>
                )}
                <hr />
                <Heading size="small">Informasjon om fraværsperioder</Heading>
                <FieldArray
                    name="opptjeningAktivitet.frilanser.fravaersperioder"
                    render={(arrayHelpers) => (
                        <>
                            {frilanser.fravaersperioder?.map((fravaersperiode, fravaersperiodeIndex) => (
                                <Fravaersperiode
                                    //  react/no-array-index-key
                                    key={fravaersperiodeIndex}
                                    name={`opptjeningAktivitet.frilanser.fravaersperioder[${fravaersperiodeIndex}]`}
                                    antallFravaersperioder={frilanser.fravaersperioder?.length}
                                    slettPeriode={() => arrayHelpers.remove(fravaersperiodeIndex)}
                                />
                            ))}
                            <Button
                                variant="tertiary"
                                size="small"
                                onClick={() =>
                                    arrayHelpers.push({
                                        ...fravaersperiodeInitialValue,
                                        aktivitetsFravær: aktivitetsFravær.FRILANSER,
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
    );
}
