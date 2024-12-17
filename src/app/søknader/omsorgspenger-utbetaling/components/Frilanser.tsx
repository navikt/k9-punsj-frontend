import React from 'react';

import { Field, FieldArray, FieldProps, useFormikContext } from 'formik';
import { capitalize } from 'lodash';
import { FormattedMessage, useIntl } from 'react-intl';
import { AddCircle } from '@navikt/ds-icons';
import { Box, Button, Heading } from '@navikt/ds-react';
import VerticalSpacer from 'app/components/VerticalSpacer';
import DatoInputFormikNew from 'app/components/formikInput/DatoInputFormikNew';
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
    const intl = useIntl();

    const { values } = useFormikContext<IOMPUTSoknad>();

    const {
        opptjeningAktivitet: { frilanser },
    } = values;

    return (
        <div className="arbeidsforhold-container">
            <Box style={{ backgroundColor: '#eaeaea' }} borderRadius="small">
                <Heading size="small" level="5">
                    <FormattedMessage id={'omsorgspenger.utbetaling.frilanser.tittel'} />
                </Heading>

                <Box padding="4">
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

                    <DatoInputFormikNew
                        label={intlHelper(intl, 'omsorgspenger.utbetaling.frilanser.startDato.spm')}
                        name="opptjeningAktivitet.frilanser.startdato"
                    />

                    <VerticalSpacer twentyPx />

                    <Field name="opptjeningAktivitet.frilanser.jobberFortsattSomFrilans">
                        {({ field, form }: FieldProps<string>) => (
                            <RadioGroupFormik
                                legend={intlHelper(intl, 'omsorgspenger.utbetaling.frilanser.jobberFortsatt.spm')}
                                size="small"
                                name={field.name}
                                value={field.value ? 'ja' : 'nei'}
                            >
                                <RadioFormik
                                    name={field.name}
                                    value="ja"
                                    onChange={() => form.setFieldValue(field.name, true)}
                                >
                                    <FormattedMessage id="omsorgspenger.utbetaling.frilanser.jobberFortsatt.ja" />
                                </RadioFormik>

                                <RadioFormik
                                    name={field.name}
                                    value="nei"
                                    onChange={() => form.setFieldValue(field.name, false)}
                                >
                                    <FormattedMessage id="omsorgspenger.utbetaling.frilanser.jobberFortsatt.nei" />
                                </RadioFormik>
                            </RadioGroupFormik>
                        )}
                    </Field>

                    <VerticalSpacer twentyPx />

                    {!frilanser.jobberFortsattSomFrilans && (
                        <>
                            <DatoInputFormikNew
                                label={intlHelper(intl, 'omsorgspenger.utbetaling.frilanser.sluttDato.spm')}
                                name="opptjeningAktivitet.frilanser.sluttdato"
                            />

                            <VerticalSpacer twentyPx />
                        </>
                    )}

                    <hr />

                    <VerticalSpacer twentyPx />

                    <Heading size="small">
                        <FormattedMessage id="omsorgspenger.utbetaling.frilanser.fravaersperioder.tittel" />
                    </Heading>

                    <FieldArray
                        name="opptjeningAktivitet.frilanser.fravaersperioder"
                        render={(arrayHelpers) => (
                            <>
                                {frilanser.fravaersperioder?.map((fravaersperiode, fravaersperiodeIndex) => (
                                    <Fravaersperiode
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
                                    <FormattedMessage id="omsorgspenger.utbetaling.frilanser.fravaersperioder.leggTil.btn" />
                                </Button>
                            </>
                        )}
                    />
                </Box>
            </Box>
        </div>
    );
}
