import React from 'react';
import { IntlShape } from 'react-intl';

import { Panel } from '@navikt/ds-react';

import { PeriodInput } from 'app/components/period-input/PeriodInput';
import UhaanderteFeilmeldinger from 'app/components/skjema/UhaanderteFeilmeldinger';
import { GetErrorMessage, GetUhaandterteFeil } from 'app/models/types';

import AddCircleSvg from '../../assets/SVG/AddCircleSVG';
import BinSvg from '../../assets/SVG/BinSVG';
import { IPeriode } from '../../models/types/Periode';
import intlHelper from '../../utils/intlUtils';

export interface IPeriodepanelerProps {
    intl: IntlShape;
    periods: IPeriode[]; // Liste over periodisert informasjon
    initialPeriode: IPeriode; // Objektet som legges til når man legger til en ny periode i lista
    editSoknad: (periodeinfo: IPeriode[]) => any; // Funksjon som skal kalles for å sende en put-spørring med oppdatert info og oppdatere Redux-store deretter (brukes i hovedsak på onBlur)
    editSoknadState?: (periodeinfo: IPeriode[], showStatus?: boolean) => any; // Funskjon som skal kalles for å oppdatere state på PunchFormOld (må brukes på onChange)
    textLeggTil?: string;
    textFjern?: string;
    getErrorMessage?: GetErrorMessage;
    getUhaandterteFeil?: GetUhaandterteFeil;
    feilkodeprefiks?: string;
    onAdd?: () => any;
    onRemove?: () => any;
    kanHaFlere: boolean;
}

export const Periodepaneler: React.FunctionComponent<IPeriodepanelerProps> = (props: IPeriodepanelerProps) => {
    const {
        periods,
        intl,
        editSoknad,
        editSoknadState,
        kanHaFlere,
        getErrorMessage,
        feilkodeprefiks,
        textLeggTil,
        getUhaandterteFeil,
    } = props;

    const editInfo: (index: number, periodeinfo: Partial<IPeriode>) => IPeriode[] = (
        index: number,
        periodeinfo: Partial<IPeriode>,
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
                //  react/no-array-index-key
                <div className="flex flex-wrap" key={i}>
                    <div className="periodepanel-input">
                        <PeriodInput
                            periode={p || {}}
                            intl={intl}
                            onChange={(periode) => {
                                if (editSoknadState) {
                                    editSoknadState(editPeriode(i, periode));
                                }
                            }}
                            onBlur={(periode) => {
                                editSoknad(editPeriode(i, periode));
                            }}
                            errorMessage={feilkodeprefiks && getErrorMessage!(`${feilkodeprefiks}.perioder[${i}]`)}
                            errorMessageFom={getErrorMessage!(`[${i}].periode.fom`)}
                            errorMessageTom={getErrorMessage!(`[${i}].periode.tom`)}
                        />
                        <span className="mr-3" />
                        <button
                            id="slett"
                            className={getErrorMessage!(feilkodeprefiks!, i) ? 'fjern-feil ' : 'fjern'}
                            type="button"
                            onClick={() => {
                                const newArray: IPeriode[] = removeItem(i);
                                if (editSoknadState) {
                                    editSoknadState(newArray);
                                }
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
                    </div>
                </div>
            ))}
            {feilkodeprefiks && (
                <UhaanderteFeilmeldinger
                    getFeilmeldinger={() => (getUhaandterteFeil && getUhaandterteFeil(feilkodeprefiks)) || []}
                />
            )}

            {kanHaFlere && (
                <div className="flex flex-wrap">
                    <button
                        id="leggtilperiode"
                        className="leggtilperiode"
                        type="button"
                        onClick={() => {
                            const newArray: IPeriode[] = addItem();
                            if (editSoknadState) {
                                editSoknadState(newArray);
                            }
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
                </div>
            )}
        </Panel>
    );
};
