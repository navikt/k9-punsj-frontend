import React, { useRef } from 'react';

import { PlusCircleIcon, TrashIcon } from '@navikt/aksel-icons';
import { Box, Button } from '@navikt/ds-react';
import { FieldArray, useFormikContext } from 'formik';
import { FormattedMessage } from 'react-intl';

import PeriodevelgerFormik from 'app/components/skjema/Datovelger/PeriodevelgerFormik';
import usePrevious from 'app/hooks/usePrevious';
import useFocus from '../../../hooks/useFocus';
import { refusjonskravFieldId, trekkperiodeFieldId } from '../containers/formFieldIds';
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
    const { values } = useFormikContext<KorrigeringAvInntektsmeldingFormValues>();
    const fomInputRef = useRef<HTMLInputElement>(null);
    const currentListLength = values[name]?.length;
    const previousListLength = usePrevious(currentListLength);

    useFocus(currentListLength, previousListLength, fomInputRef);

    return (
        <Box
            padding="space-16"
            borderRadius="8"
            background="neutral-soft"
            className="korrigering__panelsurface periodepanel"
        >
            <FieldArray name={name}>
                {({ push, remove }) => (
                    <>
                        {values[name]?.map((_, index: number) => {
                            const fieldName = `${name}.${index}`;
                            const isLastElement =
                                previousListLength !== undefined &&
                                previousListLength < currentListLength &&
                                index === currentListLength - 1;
                            const fomId =
                                name === KorrigeringAvInntektsmeldingFormFields.Trekkperioder
                                    ? trekkperiodeFieldId(index)
                                    : refusjonskravFieldId(index);
                            return (
                                <div className="flex items-start" key={index}>
                                    <PeriodevelgerFormik
                                        name={fieldName}
                                        fomId={fomId}
                                        fomInputRef={isLastElement ? fomInputRef : undefined}
                                    />

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
