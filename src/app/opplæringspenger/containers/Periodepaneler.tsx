import { Panel } from '@navikt/ds-react';
import { PeriodInput } from 'app/components/period-input/PeriodInput';
import { Field, FieldProps } from 'formik';
import * as React from 'react';
import { Row } from 'react-bootstrap';
import { IntlShape } from 'react-intl';
import AddCircleSvg from '../../assets/SVG/AddCircleSVG';
import BinSvg from '../../assets/SVG/BinSVG';
import { IPeriode } from '../../models/types/Periode';
import intlHelper from '../../utils/intlUtils';

export interface IPeriodepanelerProps {
    intl: IntlShape;
    periods: IPeriode[]; // Liste over periodisert informasjon
    initialPeriode: IPeriode; // Objektet som legges til når man legger til en ny periode i lista
    editSoknad: (periodeinfo: IPeriode[]) => any; // Funksjon som skal kalles for å sende en put-spørring med oppdatert info og oppdatere Redux-store deretter (brukes i hovedsak på onBlur)
    textLeggTil?: string;
    textFjern?: string;
    feilkodeprefiks?: string;
    onAdd?: () => any;
    onRemove?: () => any;
    kanHaFlere: boolean;
}

export const Periodepaneler: React.FunctionComponent<IPeriodepanelerProps> = (props: IPeriodepanelerProps) => {
    const { periods, intl, editSoknad, kanHaFlere, feilkodeprefiks, textLeggTil } = props;

    const editInfo: (index: number, periodeinfo: Partial<IPeriode>) => IPeriode[] = (
        index: number,
        periodeinfo: Partial<IPeriode>
    ) => {
        const newInfo: IPeriode = { ...props.periods[index], ...periodeinfo };
        const newArray = periods || [];
        newArray[index] = newInfo;
        return newArray;
    };

    const editPeriode = (index: number, periode: IPeriode) => editInfo(index, periode);

    const addItem = () => {
        const newArray = periods || [];
        newArray.push(props.initialPeriode);
        return newArray;
    };

    const removeItem = (index: number) => {
        const newArray = periods || [];
        newArray.splice(index, 1);
        return newArray;
    };

    return (
        <Panel className="periodepanel">
            {periods.map((p, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <Row noGutters key={i}>
                    <div className="periodepanel-input">
                        <Field name="soeknadsperiode">
                            {({ field, form, meta }: FieldProps<string>) => (
                                <>
                                    <PeriodInput
                                        periode={p || {}}
                                        intl={intl}
                                        onChange={(periode) => {
                                            editSoknad(editPeriode(i, periode));
                                        }}
                                        onBlur={(periode) => {
                                            editSoknad(editPeriode(i, periode));
                                        }}
                                        errorMessage={meta.touched && meta.error}
                                    />
                                    <button
                                        id="slett"
                                        className={meta.touched && meta.error ? 'fjern-feil' : 'fjern'}
                                        type="button"
                                        onClick={() => {
                                            const newArray: IPeriode[] = removeItem(i);
                                            editSoknad(newArray);
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
                                </>
                            )}
                        </Field>
                    </div>
                </Row>
            ))}
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
                            const newArray: IPeriode[] = addItem();
                            editSoknad(newArray);
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
        </Panel>
    );
};
