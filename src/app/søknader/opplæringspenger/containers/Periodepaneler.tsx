import React from 'react';

import { FieldArray, useFormikContext } from 'formik';
import { FormattedMessage, useIntl } from 'react-intl';
import { Box, Button, Label } from '@navikt/ds-react';

import { PeriodInput } from 'app/components/period-input/PeriodInput';
import { OLPSoknad } from 'app/models/types/OLPSoknad';
import { IPeriode } from '../../../models/types/Periode';
import { TrashIcon, PlusCircleIcon } from '@navikt/aksel-icons';

const initialPeriode = { fom: '', tom: '' };

export interface IPeriodepanelerProps {
    periods: IPeriode[]; // Liste over periodisert informasjon
    onAdd?: () => any;
    onRemove?: () => any;
    kanHaFlere: boolean;
    fieldName: string;
}

export const Periodepaneler: React.FunctionComponent<IPeriodepanelerProps> = (props: IPeriodepanelerProps) => {
    const intl = useIntl();

    const { periods, kanHaFlere, fieldName } = props;

    const { setFieldValue, setFieldTouched } = useFormikContext<OLPSoknad>();

    return (
        <Box padding="4" borderRadius="large" className="periodepanel">
            <Label size="small">
                Hvilke perioder vil du <span className="endringAvSøknadsperioder__underscore">fjerne</span>?
            </Label>
            <FieldArray
                name={fieldName}
                render={(arrayHelpers) => (
                    <>
                        {periods.map((period, index) => {
                            return (
                                <div className="flex flex-col gap-4" key={index}>
                                    <div className="flex justify-between">
                                        <PeriodInput
                                            className="mr-3"
                                            periode={period || {}}
                                            intl={intl}
                                            onChange={(periode) => {
                                                setFieldValue(`${fieldName}.${index}`, periode);
                                            }}
                                            onBlur={() => {
                                                setFieldTouched(`${fieldName}.${index}.fom`);
                                                setFieldTouched(`${fieldName}.${index}.tom`);
                                            }}
                                        />
                                        <div className="block content-center">
                                            <Button
                                                variant="tertiary"
                                                size="small"
                                                onClick={() => {
                                                    arrayHelpers.remove(index);
                                                    if (props.onRemove) {
                                                        props.onRemove();
                                                    }
                                                }}
                                                className="slett-knapp-med-icon-for-input !mt-10"
                                                icon={<TrashIcon title="slett periode" />}
                                            >
                                                Fjern periode
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {kanHaFlere && (
                            <div className="mt-4">
                                <Button
                                    id="leggtilperiode"
                                    variant="tertiary"
                                    size="small"
                                    onClick={() => {
                                        arrayHelpers.push(initialPeriode);
                                        if (props.onAdd) {
                                            props.onAdd();
                                        }
                                    }}
                                    icon={<PlusCircleIcon title="legg til periode" />}
                                >
                                    <FormattedMessage id="skjema.utenlandsopphold.utenlandsoppholdContainer.leggTil.btn" />
                                </Button>
                            </div>
                        )}
                    </>
                )}
            />
        </Box>
    );
};
