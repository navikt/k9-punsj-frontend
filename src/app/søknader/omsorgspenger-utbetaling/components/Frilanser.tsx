import React from 'react';

import { PlusCircleIcon } from '@navikt/aksel-icons';
import { Box, Button, Heading } from '@navikt/ds-react';
import LegacyJaNeiRadioGroupFormik from 'app/components/formikInput/LegacyJaNeiRadioGroupFormik';
import DatovelgerFormik from 'app/components/skjema/Datovelger/DatovelgerFormik';
import VerticalSpacer from 'app/components/VerticalSpacer';
import { JaNei } from 'app/models/enums';
import intlHelper from 'app/utils/intlUtils';
import { Field, FieldArray, FieldProps, useFormikContext } from 'formik';
import { FormattedMessage, useIntl } from 'react-intl';
import { fravaersperiodeInitialValue } from '../initialValues';
import { aktivitetsFravær } from '../konstanter';
import { IOMPUTSoknad } from '../types/OMPUTSoknad';
import Fravaersperiode from './Fravaersperiode';

export default function Frilanser() {
    const intl = useIntl();

    const { values } = useFormikContext<IOMPUTSoknad>();

    const {
        opptjeningAktivitet: { frilanser },
    } = values;

    return (
        <Box padding="space-16" background="neutral-soft" borderRadius="8">
            <Box padding="space-16">
                {!values.erKorrigering && (
                    <>
                        <Field name="metadata.harSoekerDekketOmsorgsdager">
                            {({ field, form }: FieldProps<boolean>) => (
                                <LegacyJaNeiRadioGroupFormik
                                    legend={intlHelper(intl, 'skjema.harSoekerDekketOmsorgsdager')}
                                    description={intlHelper(intl, 'skjema.harSoekerDekketOmsorgsdager.hjelp')}
                                    name={field.name}
                                    onChange={(e, value) => form.setFieldValue(field.name, value)}
                                />
                            )}
                        </Field>

                        <VerticalSpacer sixteenPx />
                    </>
                )}

                <DatovelgerFormik
                    label={intlHelper(intl, 'omsorgspenger.utbetaling.frilanser.startDato.spm')}
                    name="opptjeningAktivitet.frilanser.startdato"
                    size="small"
                />

                <VerticalSpacer twentyPx />

                <Field name="opptjeningAktivitet.frilanser.jobberFortsattSomFrilans">
                    {({ field, form }: FieldProps<boolean>) => (
                        <LegacyJaNeiRadioGroupFormik
                            legend={intlHelper(intl, 'omsorgspenger.utbetaling.frilanser.jobberFortsatt.spm')}
                            name={field.name}
                            checked={field.value ? JaNei.JA : JaNei.NEI}
                            onChange={(e, value) => form.setFieldValue(field.name, value === JaNei.JA)}
                        />
                    )}
                </Field>

                <VerticalSpacer twentyPx />

                {!frilanser.jobberFortsattSomFrilans && (
                    <>
                        <DatovelgerFormik
                            label={intlHelper(intl, 'omsorgspenger.utbetaling.frilanser.sluttDato.spm')}
                            name="opptjeningAktivitet.frilanser.sluttdato"
                            size="small"
                        />

                        <VerticalSpacer twentyPx />
                    </>
                )}

                <hr />

                <Heading size="small" className="mt-4 mb-4">
                    <FormattedMessage id="omsorgspenger.utbetaling.frilanser.fravaersperioder.tittel" />
                </Heading>

                <FieldArray
                    name="opptjeningAktivitet.frilanser.fravaersperioder"
                    render={(arrayHelpers) => (
                        <>
                            {frilanser.fravaersperioder?.map((fravaersperiode, fravaersperiodeIndex) => (
                                <Fravaersperiode
                                    key={fravaersperiodeIndex}
                                    index={fravaersperiodeIndex}
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
                                icon={<PlusCircleIcon />}
                            >
                                <FormattedMessage id="omsorgspenger.utbetaling.frilanser.fravaersperioder.leggTil.btn" />
                            </Button>
                        </>
                    )}
                />
            </Box>
        </Box>
    );
}
