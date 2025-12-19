import React from 'react';
import { v4 as uuidv4 } from 'uuid';

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

    // Lagrer berikede perioder lokalt
    const [localPeriods, setLocalPeriods] = React.useState<IPeriode[]>([]);

    // Synkroniser med innkommende periods og berik med __clientId ved behov
    React.useEffect(() => {
        // Sjekk om periods har endret seg (i lengde eller innhold)
        const needsUpdate =
            periods.length !== localPeriods.length ||
            periods.some((p, i) => p.fom !== localPeriods[i]?.fom || p.tom !== localPeriods[i]?.tom);

        if (needsUpdate) {
            // Berik perioder, behold eksisterende __clientId
            const enriched = periods.map((p: any, i) => {
                // Hvis periode allerede har __clientId - behold den
                if (p.__clientId) return p;
                // Hvis det finnes tilsvarende lokal periode - bruk dens __clientId
                if (localPeriods[i] && p.fom === localPeriods[i].fom && p.tom === localPeriods[i].tom) {
                    return { ...p, __clientId: (localPeriods[i] as any).__clientId };
                }
                // Ellers generer ny
                return { ...p, __clientId: uuidv4() };
            });
            setLocalPeriods(enriched);
        }
    }, [periods]);

    const editInfo: (index: number, periodeinfo: Partial<IPeriode>) => IPeriode[] = (
        index: number,
        periodeinfo: Partial<IPeriode>,
    ) => {
        const existing = localPeriods[index] as any;
        // Behold __clientId ved oppdatering
        const newInfo = { ...localPeriods[index], ...periodeinfo, __clientId: existing?.__clientId };
        const newArray = [...localPeriods];
        newArray[index] = newInfo as IPeriode;
        setLocalPeriods(newArray);

        return newArray;
    };

    const editPeriode = (index: number, periode: IPeriode) => editInfo(index, periode);

    const addItem = () => {
        const newArray = [...localPeriods];
        // Legger til __clientId ved opprettelse
        const newPeriod = { ...initialPeriode, __clientId: uuidv4() };
        newArray.push(newPeriod as IPeriode);
        setLocalPeriods(newArray);

        return newArray;
    };

    const removeItem = (index: number) => {
        const newArray = [...localPeriods];
        newArray.splice(index, 1);
        setLocalPeriods(newArray);

        return newArray;
    };

    return (
        <Box padding="4" borderWidth={doNotShowBorders ? undefined : '1'} borderRadius="small" className="periodepanel">
            {localPeriods.map((p, i) => (
                <div className="flex items-start" key={(p as any).__clientId || i} data-testid={`periodpaneler_${i}`}>
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

                    <Button
                        id="slett"
                        className={
                            getErrorMessage!(feilkodeprefiks!, i) ? 'fjern-feil ' : 'slett-knapp-med-icon-for-input'
                        }
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
                        icon={<TrashIcon title="slettPeriode" />}
                        variant="tertiary"
                    >
                        <FormattedMessage id={textFjern || 'skjema.liste.fjern'} />
                    </Button>
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
