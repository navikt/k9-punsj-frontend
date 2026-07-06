import React from 'react';

import { FieldArray, FieldArrayRenderProps } from 'formik';
import { FormattedMessage } from 'react-intl';
import { Box, Button, Label, VStack } from '@navikt/ds-react';

import { IPeriode } from '../../../models/types/Periode';
import { TrashIcon, PlusCircleIcon } from '@navikt/aksel-icons';
import PeriodevelgerFormik from 'app/components/period-input/PeriodevelgerFormik';
import { useDatoRestriksjoner } from 'app/hooks/useTillattePerioder';

const initialPeriode = { fom: '', tom: '' };

export interface IPeriodepanelerProps {
    periods: IPeriode[]; // Liste over periodisert informasjon
    onAdd?: () => any;
    onRemove?: () => any;
    label?: string;
    kanHaFlere: boolean;
    fieldName: string;
    separateCards?: boolean;
}

export const Periodepaneler: React.FunctionComponent<IPeriodepanelerProps> = (props: IPeriodepanelerProps) => {
    const { periods, kanHaFlere, fieldName, label, separateCards = false } = props;
    const { fromDate, toDate, disabled } = useDatoRestriksjoner();

    const renderPeriod = (index: number, arrayHelpers: FieldArrayRenderProps) => (
        <PeriodevelgerFormik
            name={`${fieldName}.${index}`}
            fromDate={fromDate}
            toDate={toDate}
            disabled={disabled}
            size="small"
            action={
                <Button
                    variant="tertiary"
                    size="small"
                    onClick={() => {
                        arrayHelpers.remove(index);
                        if (props.onRemove) {
                            props.onRemove();
                        }
                    }}
                    className="slett-knapp-med-icon-for-input"
                    icon={<TrashIcon title="slett periode" />}
                    data-color="danger"
                >
                    Fjern periode
                </Button>
            }
        />
    );

    return (
        <>
            {separateCards ? (
                <div className="mt-4">
                    {label && <Label size="small">{label}</Label>}
                    <FieldArray
                        name={fieldName}
                        render={(arrayHelpers) => (
                            <VStack gap="space-16">
                                {periods.map((_, index) => (
                                    <Box key={index} padding="space-16" borderRadius="8" background="neutral-soft">
                                        {renderPeriod(index, arrayHelpers)}
                                    </Box>
                                ))}

                                {kanHaFlere && (
                                    <div className="flex flex-wrap">
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
                            </VStack>
                        )}
                    />
                </div>
            ) : (
                <Box padding="space-16" borderRadius="8" background="neutral-soft" className="mt-4">
                    {label && <Label size="small">{label}</Label>}
                    <FieldArray
                        name={fieldName}
                        render={(arrayHelpers) => (
                            <>
                                {periods.map((_, index) => (
                                    <div className="flex flex-col gap-4" key={index}>
                                        {renderPeriod(index, arrayHelpers)}
                                    </div>
                                ))}

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
            )}
        </>
    );
};
