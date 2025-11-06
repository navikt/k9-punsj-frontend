import React from 'react';

import { FieldArray } from 'formik';
import { FormattedMessage } from 'react-intl';
import { Box, Button, Label } from '@navikt/ds-react';

import { IPeriode } from '../../../models/types/Periode';
import { TrashIcon, PlusCircleIcon } from '@navikt/aksel-icons';
import DatovelgerFormik from 'app/components/skjema/Datovelger/DatovelgerFormik';

const initialPeriode = { fom: '', tom: '' };

export interface IPeriodepanelerProps {
    periods: IPeriode[]; // Liste over periodisert informasjon
    onAdd?: () => any;
    onRemove?: () => any;
    label?: string;
    kanHaFlere: boolean;
    fieldName: string;
}

export const Periodepaneler: React.FunctionComponent<IPeriodepanelerProps> = (props: IPeriodepanelerProps) => {
    const { periods, kanHaFlere, fieldName, label } = props;

    return (
        <Box padding="4" borderRadius="large" className="periodepanel">
            <Label size="small">{label}</Label>
            <FieldArray
                name={fieldName}
                render={(arrayHelpers) => (
                    <>
                        {periods.map((period, index) => {
                            return (
                                <div className="flex flex-col gap-4" key={index}>
                                    <div className="flex gap-4">
                                        <DatovelgerFormik label="Fra og med" name={`${fieldName}.${index}.fom`} />
                                        <DatovelgerFormik
                                            label="Til og med"
                                            name={`${fieldName}.${index}.tom`}
                                            fromDate={period.fom ? new Date(period.fom) : undefined}
                                            defaultMonth={period.fom ? new Date(period.fom) : undefined}
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
