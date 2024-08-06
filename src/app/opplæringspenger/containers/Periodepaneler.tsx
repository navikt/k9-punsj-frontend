import { FieldArray, useFormikContext } from 'formik';
import * as React from 'react';
import { useIntl } from 'react-intl';

import { Panel } from '@navikt/ds-react';

import { PeriodInput } from 'app/components/period-input/PeriodInput';
import { OLPSoknad } from 'app/models/types/OLPSoknad';

import AddCircleSvg from '../../assets/SVG/AddCircleSVG';
import BinSvg from '../../assets/SVG/BinSVG';
import { IPeriode } from '../../models/types/Periode';
import intlHelper from '../../utils/intlUtils';

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
        <Panel className="periodepanel">
            <FieldArray
                name={fieldName}
                render={(arrayHelpers) => (
                    <>
                        {periods.map((period, index) => {
                            const fieldMeta = getFieldMeta(fieldName);
                            return (
                                 react/no-array-index-key
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
                                        <button
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
                                                <BinSvg title="fjern" />
                                            </div>
                                            {intlHelper(intl, props.textFjern || 'skjema.liste.fjern')}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        {/* {feilkodeprefiks && (
                <UhaanderteFeilmeldinger
                    getFeilmeldinger={() => (getUhaandterteFeil && getUhaandterteFeil(feilkodeprefiks)) || []}
                />
            )} */}

                        {kanHaFlere && (
                            <div className="flex flex-wrap">
                                <button
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
                                    {intlHelper(intl, textLeggTil || 'skjema.periodepanel.legg_til')}
                                </button>
                            </div>
                        )}
                    </>
                )}
            />
        </Panel>
    );
};
