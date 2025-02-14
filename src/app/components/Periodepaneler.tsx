import React from 'react';

import { FormattedMessage, useIntl } from 'react-intl';
import { Box, Button } from '@navikt/ds-react';

import { PeriodInput } from 'app/components/period-input/PeriodInput';
import UhaanderteFeilmeldinger from 'app/components/skjema/UhaanderteFeilmeldinger';
import { GetErrorMessage, GetUhaandterteFeil } from 'app/models/types';
import { IPeriode } from '../models/types/Periode';
import { PlusCircleIcon, TrashIcon } from '@navikt/aksel-icons';

interface Props {
    periods: IPeriode[]; // Liste over periodisert informasjon
    initialPeriode: IPeriode;
    kanHaFlere: boolean; // Objektet som legges til når man legger til en ny periode i lista
    textLeggTil?: string;
    textFjern?: string;
    feilkodeprefiks?: string;
    doNotShowBorders?: boolean;

    editSoknad: (periodeinfo: IPeriode[]) => any; // Funksjon som skal kalles for å sende en put-spørring med oppdatert info og oppdatere Redux-store deretter (brukes i hovedsak på onBlur)
    editSoknadState?: (periodeinfo: IPeriode[], showStatus?: boolean) => any; // Funskjon som skal kalles for å oppdatere state på PunchFormOld (må brukes på onChange)
    getErrorMessage?: GetErrorMessage;
    getUhaandterteFeil?: GetUhaandterteFeil;
    onAdd?: () => any;
    onRemove?: () => any;
}

export const Periodepaneler: React.FC<Props> = ({
    periods,
    initialPeriode,
    kanHaFlere,
    textLeggTil,
    textFjern,
    feilkodeprefiks,
    doNotShowBorders,

    editSoknad,
    editSoknadState,
    getErrorMessage,
    getUhaandterteFeil,
    onAdd,
    onRemove,
}: Props) => {
    const intl = useIntl();

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
        <Box padding="4" borderWidth={doNotShowBorders ? undefined : '1'} borderRadius="small" className="periodepanel">
            {periods.map((p, i) => (
                <div className="flex flex-wrap" key={i} data-testid="periodpaneler_${i}">
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

                        <div className="ml-4">
                            <Button
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
                                icon={<TrashIcon fontSize="2rem" color="#C30000" title="slett" />}
                                size="small"
                            >
                                <FormattedMessage id={textFjern || 'skjema.liste.fjern'} />
                            </Button>
                        </div>
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
                    <Button
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
                        icon={<PlusCircleIcon title="leggTill" fontSize="2rem" color="#0067C5" />}
                        size="small"
                    >
                        <FormattedMessage id={textLeggTil || 'skjema.periodepanel.legg_til'} />
                    </Button>
                </div>
            )}
        </Box>
    );
};
