import { Panel } from '@navikt/ds-react';
import { PeriodInput } from 'app/components/period-input/PeriodInput';
import { OLPSoknad } from 'app/models/types/søknadTypes/OLPSoknad';
import { FieldArray, useFormikContext } from 'formik';
import * as React from 'react';
import { Row } from 'react-bootstrap';
import { useIntl } from 'react-intl';
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
                                // eslint-disable-next-line react/no-array-index-key
                                <Row noGutters key={index}>
                                    <div className="periodepanel-input">
                                        <PeriodInput
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
                                </Row>
                            );
                        })}
                        {/* {feilkodeprefiks && (
                <UhaanderteFeilmeldinger
                    getFeilmeldinger={() => (getUhaandterteFeil && getUhaandterteFeil(feilkodeprefiks)) || []}
                />
            )} */}

                        {kanHaFlere && (
                            <Row noGutters>
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
                            </Row>
                        )}
                    </>
                )}
            />
        </Panel>
    );
};
