import React from 'react';
import { IntlShape } from 'react-intl';

import { Box } from '@navikt/ds-react';

import { PeriodInput } from 'app/components/period-input/PeriodInput';
import UhaanderteFeilmeldinger from 'app/components/skjema/UhaanderteFeilmeldinger';
import { GetErrorMessage, GetUhaandterteFeil } from 'app/models/types';

import AddCircleSvg from '../../assets/SVG/AddCircleSVG';
import BinSvg from '../../assets/SVG/BinSVG';
import { IPeriode } from '../../models/types/Periode';
import intlHelper from '../../utils/intlUtils';

interface Props {
    intl: IntlShape;
    periods: IPeriode[]; // Liste over periodisert informasjon
    initialPeriode: IPeriode;
    kanHaFlere: boolean; // Objektet som legges til når man legger til en ny periode i lista
    textLeggTil?: string;
    textFjern?: string;
    feilkodeprefiks?: string;

    editSoknad: (periodeinfo: IPeriode[]) => any; // Funksjon som skal kalles for å sende en put-spørring med oppdatert info og oppdatere Redux-store deretter (brukes i hovedsak på onBlur)
    editSoknadState?: (periodeinfo: IPeriode[], showStatus?: boolean) => any; // Funskjon som skal kalles for å oppdatere state på PunchFormOld (må brukes på onChange)
    getErrorMessage?: GetErrorMessage;
    getUhaandterteFeil?: GetUhaandterteFeil;
    onAdd?: () => any;
    onRemove?: () => any;
}

export const Periodepaneler: React.FC<Props> = ({
    intl,
    periods,
    initialPeriode,
    kanHaFlere,
    textLeggTil,
    textFjern,
    feilkodeprefiks,

    editSoknad,
    editSoknadState,
    getErrorMessage,
    getUhaandterteFeil,
    onAdd,
    onRemove,
}: Props) => {
    const editInfo: (index: number, periodeinfo: Partial<IPeriode>) => IPeriode[] = (
        index: number,
        periodeinfo: Partial<IPeriode>,
    ) => {
        const newInfo: IPeriode = { ...periods[index], ...periodeinfo };
        const newArray = [...(periods || [])];
        newArray[index] = newInfo;
        return newArray;
    };

    const editPeriode = (index: number, periode: IPeriode) => editInfo(index, periode);

    const addItem = () => {
        const newArray = [...(periods || [])];
        newArray.push(initialPeriode);
        return newArray;
    };

    const removeItem = (index: number) => {
        const newArray = [...(periods || [])];
        newArray.splice(index, 1);
        return newArray;
    };

    return (
        <Box padding="4" borderWidth="1" borderRadius="small" className="periodepanel">
            {periods.map((p, i) => (
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
                            onBlur={(periode) => editSoknad(editPeriode(i, periode))}
                            errorMessage={feilkodeprefiks && getErrorMessage!(`${feilkodeprefiks}.perioder[${i}]`, i)}
                            errorMessageFom={getErrorMessage!(`[${i}].periode.fom`, i)}
                            errorMessageTom={getErrorMessage!(`[${i}].periode.tom`, i)}
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
                                if (onRemove) {
                                    onRemove();
                                }
                            }}
                        >
                            <div className="slettIcon">
                                <BinSvg title="fjern" />
                            </div>
                            {intlHelper(intl, textFjern || 'skjema.liste.fjern')}
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
                            if (onAdd) {
                                onAdd();
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
        </Box>
    );
};
