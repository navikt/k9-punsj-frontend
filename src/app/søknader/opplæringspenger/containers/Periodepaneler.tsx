import React from 'react';

import { FieldArray, useFormikContext } from 'formik';
import { FormattedMessage, useIntl } from 'react-intl';
import { Box, Button } from '@navikt/ds-react';
import { PeriodInput } from 'app/components/period-input/PeriodInput';
import { OLPSoknad } from 'app/models/types/OLPSoknad';

import AddCircleSvg from '../../../assets/SVG/AddCircleSVG';
import { IPeriode } from '../../../models/types/Periode';
import { TrashIcon } from '@navikt/aksel-icons';

const initialPeriode = { fom: '', tom: '' };

export interface IPeriodepanelerProps {
    periods: IPeriode[]; // Liste over periodisert informasjon
    textLeggTil?: string;
    textFjern?: string;
    onAdd?: () => any;
    onRemove?: () => any;
    kanHaFlere: boolean;
    fieldName: string;
}

export const Periodepaneler: React.FunctionComponent<IPeriodepanelerProps> = (props: IPeriodepanelerProps) => {
    const intl = useIntl();

    const { periods, kanHaFlere, textLeggTil, fieldName } = props;

    const { setFieldValue, setFieldTouched, getFieldMeta } = useFormikContext<OLPSoknad>();

    return (
        <Box padding="4" borderWidth="1" borderRadius="small" className="periodepanel">
            <FieldArray
                name={fieldName}
                render={(arrayHelpers) => (
                    <>
                        {periods.map((period, index) => {
                            const fieldMeta = getFieldMeta(fieldName);

                            return (
                                <div className="flex flex-wrap" key={index}>
                                    <div className="periodepanel-input">
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
                                            errorMessage={fieldMeta.touched && fieldMeta.error}
                                        />

                                        <Button
                                            id="slett"
                                            className={fieldMeta.touched && fieldMeta.error ? 'fjern-feil' : 'fjern'}
                                            type="button"
                                            onClick={() => {
                                                arrayHelpers.remove(index);
                                                if (props.onRemove) {
                                                    props.onRemove();
                                                }
                                            }}
                                        >
                                            <div className="slettIcon">
                                                <TrashIcon fontSize="2rem" color="#C30000" />
                                            </div>

                                            <FormattedMessage id={props.textFjern || 'skjema.liste.fjern'} />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}

                        {kanHaFlere && (
                            <div className="flex flex-wrap">
                                <Button
                                    id="leggtilperiode"
                                    className="leggtilperiode"
                                    type="button"
                                    onClick={() => {
                                        arrayHelpers.push(initialPeriode);
                                        if (props.onAdd) {
                                            props.onAdd();
                                        }
                                    }}
                                >
                                    <div className="leggtilperiodeIcon">
                                        <AddCircleSvg title="leggtil" />
                                    </div>

                                    <FormattedMessage id={textLeggTil || 'skjema.periodepanel.legg_til'} />
                                </Button>
                            </div>
                        )}
                    </>
                )}
            />
        </Box>
    );
};
