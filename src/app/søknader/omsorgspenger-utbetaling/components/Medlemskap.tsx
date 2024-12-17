import React, { useEffect } from 'react';

import { Field, FieldArray, FieldProps, useFormikContext } from 'formik';
import { FormattedMessage, useIntl } from 'react-intl';
import { AddCircle, Delete } from '@navikt/ds-icons';
import { Box, Button, Heading } from '@navikt/ds-react';
import VerticalSpacer from 'app/components/VerticalSpacer';
import { CountrySelect } from 'app/components/country-select/CountrySelect';
import RadioPanelGruppeFormik from 'app/components/formikInput/RadioPanelGruppeFormik';
import intlHelper from 'app/utils/intlUtils';
import { utenlandsoppholdInitialValue } from '../initialValues';
import { IOMPUTSoknad } from '../types/OMPUTSoknad';
import { JaNeiIkkeOpplyst } from 'app/models/enums/JaNeiIkkeOpplyst';
import DatoInputFormikNew from 'app/components/formikInput/DatoInputFormikNew';

const Medlemskap: React.FC = () => {
    const intl = useIntl();

    const { values, setFieldValue } = useFormikContext<IOMPUTSoknad>();

    const options = [
        { value: JaNeiIkkeOpplyst.JA, label: intlHelper(intl, 'ja') },
        { value: JaNeiIkkeOpplyst.NEI, label: intlHelper(intl, 'nei') },
        { value: JaNeiIkkeOpplyst.IKKE_OPPLYST, label: intlHelper(intl, 'ikkeOpplyst') },
    ];

    useEffect(() => {
        if (values.bosteder.length && values.metadata.medlemskap !== 'ja') {
            setFieldValue('bosteder', []);
        }

        if (!values.bosteder.length && values.metadata.medlemskap === 'ja') {
            setFieldValue('bosteder', [utenlandsoppholdInitialValue]);
        }
    }, [values.metadata.medlemskap]);

    return (
        <Box padding="4" borderWidth="1" borderRadius="small">
            <Heading size="small" level="5">
                <FormattedMessage id="omsorgspenger.utbetaling.medlemskap.tittel" />
            </Heading>

            <VerticalSpacer twentyPx />

            <RadioPanelGruppeFormik
                legend={intlHelper(intl, 'skjema.medlemskap.harbodd')}
                name="metadata.medlemskap"
                options={options}
            />

            <VerticalSpacer twentyPx />

            {values.metadata.medlemskap === JaNeiIkkeOpplyst.JA && (
                <Box padding="4" borderRadius="small" style={{ backgroundColor: '#eaeaea' }}>
                    <FieldArray
                        name="bosteder"
                        render={(arrayHelpers) => (
                            <>
                                {values.bosteder?.map((_, bostedIndex, array) => (
                                    <div key={bostedIndex}>
                                        <div className="fom-tom-rad">
                                            <DatoInputFormikNew
                                                label={intlHelper(
                                                    intl,
                                                    'omsorgspenger.utbetaling.medlemskap.fom.tittel',
                                                )}
                                                name={`bosteder[${bostedIndex}].periode.fom`}
                                            />

                                            <DatoInputFormikNew
                                                label={intlHelper(
                                                    intl,
                                                    'omsorgspenger.utbetaling.medlemskap.tom.tittel',
                                                )}
                                                name={`bosteder[${bostedIndex}].periode.tom`}
                                            />

                                            {array.length > 1 && (
                                                <Button
                                                    variant="tertiary"
                                                    size="small"
                                                    onClick={() => arrayHelpers.remove(bostedIndex)}
                                                    style={{ float: 'right' }}
                                                    icon={<Delete />}
                                                >
                                                    <FormattedMessage id="omsorgspenger.utbetaling.medlemskap.fjernPeriode.btn" />
                                                </Button>
                                            )}
                                        </div>

                                        <VerticalSpacer sixteenPx />

                                        <div style={{ maxWidth: '25%' }}>
                                            <Field name={`bosteder[${bostedIndex}].land`}>
                                                {({ field }: FieldProps<string>) => (
                                                    <CountrySelect
                                                        label
                                                        selectedcountry={field.value}
                                                        unselectedoption={intlHelper(
                                                            intl,
                                                            'omsorgspenger.utbetaling.medlemskap.unselectedoption',
                                                        )}
                                                        {...field}
                                                    />
                                                )}
                                            </Field>
                                        </div>
                                    </div>
                                ))}

                                <VerticalSpacer sixteenPx />

                                <Button
                                    variant="tertiary"
                                    size="small"
                                    onClick={() => arrayHelpers.push(utenlandsoppholdInitialValue)}
                                    icon={<AddCircle />}
                                >
                                    <FormattedMessage id="omsorgspenger.utbetaling.medlemskap.leggTilPeriode.btn" />
                                </Button>
                            </>
                        )}
                    />
                </Box>
            )}
        </Box>
    );
};

export default Medlemskap;
