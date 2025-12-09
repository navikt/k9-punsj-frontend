import React from 'react';

import { FieldArray, useFormikContext } from 'formik';
import { FormattedMessage, useIntl } from 'react-intl';
import { Box, Button } from '@navikt/ds-react';
import { PlusCircleIcon, TrashIcon } from '@navikt/aksel-icons';

import Periodevelger from 'app/components/skjema/Datovelger/Periodevelger';
import { IPeriode } from 'app/models/types';
import {
    KorrigeringAvInntektsmeldingFormFields,
    KorrigeringAvInntektsmeldingFormValues,
} from '../types/KorrigeringAvInntektsmeldingFormFieldsValues';

export interface IPeriodepanelerProps {
    name:
        | KorrigeringAvInntektsmeldingFormFields.PerioderMedRefusjonskrav
        | KorrigeringAvInntektsmeldingFormFields.Trekkperioder;

    textLeggTil?: string;
}

/** Variant av periodepanel som baserer seg på Formik */
export const Periodepanel: React.FC<IPeriodepanelerProps> = ({ name, textLeggTil }: IPeriodepanelerProps) => {
    const intl = useIntl();

    const { values } = useFormikContext<KorrigeringAvInntektsmeldingFormValues>();

    return (
        <Box padding="4" borderWidth="1" borderRadius="small" className="periodepanel">
            <FieldArray name={name}>
                {({ push, remove }) => (
                    <>
                        {values[name]?.map((_: IPeriode, index: number) => {
                            const fieldName = `${name}.${index}`;
                            return (
                                <div className="flex items-start" key={index}>
                                    <Periodevelger name={fieldName} />

                                    <Button
                                        id="slett"
                                        className="slett-knapp-med-icon-for-input"
                                        type="button"
                                        onClick={() => {
                                            remove(index);
                                        }}
                                        icon={<TrashIcon title="slettPeriode" />}
                                        variant="tertiary"
                                    >
                                        <FormattedMessage id="skjema.liste.fjern_periode" />
                                    </Button>
                                </div>
                            );
                        })}

                        <div className="flex flex-wrap">
                            <button
                                id="leggtilperiode"
                                className="leggtilperiode"
                                type="button"
                                onClick={() => {
                                    push({ fom: '', tom: '' });
                                }}
                            >
                                <div className="leggtilperiodeIcon">
                                    <PlusCircleIcon title="leggTill" fontSize="2rem" color="#0067C5" />
                                </div>

                                <FormattedMessage id={textLeggTil || 'skjema.periodepanel.legg_til_dag_periode'} />
                            </button>
                        </div>
                    </>
                )}
            </FieldArray>
        </Box>
    );
};
