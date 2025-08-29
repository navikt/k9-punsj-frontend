import React, { useEffect, useState } from 'react';

import classNames from 'classnames';
import { FormattedMessage, useIntl } from 'react-intl';
import { Fieldset, Box, Button, Heading } from '@navikt/ds-react';
import { PlusCircleIcon, TrashIcon } from '@navikt/aksel-icons';

import UhaanderteFeilmeldinger from 'app/components/skjema/UhaanderteFeilmeldinger';
import { ArbeidsgivereResponse } from 'app/models/types/ArbeidsgivereResponse';
import Organisasjon from 'app/models/types/Organisasjon';

import { finnArbeidsgivere } from '../../../api/api';
import { Arbeidstaker, IPeriode } from '../../../models/types';
import { IPLSSoknad } from '../../../søknader/pleiepenger-livets-sluttfase/types/PLSSoknad';
import ArbeidstakerComponent from './ArbeidstakerComponent';

type ItemInfo = any;

interface Props {
    soknad: IPLSSoknad;
    eksisterendeSoknadsperioder: IPeriode[];
    initialArbeidstaker: Arbeidstaker;
    updateSoknad: (soknad: Partial<IPLSSoknad>) => (dispatch: any) => Promise<Response>;
    updateSoknadState: (soknad: Partial<IPLSSoknad>, showStatus?: boolean) => void;
    getErrorMessage: (attribute: string, indeks?: number) => string | undefined;
    getUhaandterteFeil: (kode: string) => (string | undefined)[];
}

const Arbeidstakerperioder = ({
    soknad,
    eksisterendeSoknadsperioder,
    initialArbeidstaker,
    updateSoknad,
    updateSoknadState,
    getErrorMessage,
    getUhaandterteFeil,
}: Props): JSX.Element => {
    const intl = useIntl();

    const [arbeidsgivere, setArbeidsgivere] = useState<Organisasjon[]>([]);

    const { arbeidstid, soekerId } = soknad;

    useEffect(() => {
        if (soekerId) {
            finnArbeidsgivere(soekerId, (response, data: ArbeidsgivereResponse) => {
                setArbeidsgivere(data?.organisasjoner || []);
            });
        }
    }, []);

    const items = arbeidstid?.arbeidstakerList || [];
    const itemsWithInitialItem = items.length > 0 ? items : [initialArbeidstaker];

    const editItem: (index: number, iteminfo: Partial<ItemInfo>) => ItemInfo[] = (
        index: number,
        iteminfo: Partial<ItemInfo>,
    ) => {
        const newInfo: ItemInfo = { ...items[index], ...iteminfo };
        const newArray = itemsWithInitialItem;
        newArray[index] = newInfo;
        return newArray;
    };

    const addItem = () => {
        const newArray = itemsWithInitialItem;
        newArray.push(initialArbeidstaker);
        return newArray;
    };

    const removeItem = (index: number) => {
        const newArray = itemsWithInitialItem;
        newArray.splice(index, 1);
        return newArray;
    };

    const editSoknadState = (arbeidstakerList: ItemInfo[], showStatus?: boolean) =>
        updateSoknadState(
            {
                arbeidstid: {
                    ...arbeidstid,
                    arbeidstakerList,
                },
            },
            showStatus,
        );

    const editSoknad = (arbeidstakerList: ItemInfo[]) =>
        updateSoknad({
            arbeidstid: {
                ...arbeidstid,
                arbeidstakerList,
            },
        });

    const removeItemHandler = (itemIndex: number) => {
        const newArray: ItemInfo[] = removeItem(itemIndex);
        editSoknadState(newArray);
        editSoknad(newArray);
    };

    const addItemHandler = () => {
        const newArray: ItemInfo[] = addItem();
        editSoknadState(newArray);
        editSoknad(newArray);
    };

    return (
        <Fieldset className="listepaneler" legend="" hideLegend>
            {items?.map((currentItem, currentItemIndex) => {
                const panelid = `arbeidstakerpanel_${currentItemIndex}`;

                const getHarDuplikatOrgnr = () =>
                    items.filter(
                        (item) =>
                            item.organisasjonsnummer && item.organisasjonsnummer === currentItem.organisasjonsnummer,
                    ).length > 1;

                return (
                    <Box
                        padding="4"
                        className={classNames('listepanel', 'arbeidstakerpanel')}
                        id={panelid}
                        key={panelid}
                    >
                        {itemsWithInitialItem.length > 1 && (
                            <div className="flex justify-between items-center">
                                <Heading size="small" level="2">
                                    <FormattedMessage
                                        id="skjema.arbeidsforhold.teller"
                                        values={{ indeks: currentItemIndex + 1 }}
                                    />
                                </Heading>

                                <Button
                                    id="slett"
                                    className="slett-knapp-med-icon"
                                    type="button"
                                    onClick={() => removeItemHandler(currentItemIndex)}
                                    tabIndex={0}
                                    icon={<TrashIcon title="slett" />}
                                    variant="tertiary"
                                >
                                    <FormattedMessage id="skjema.arbeid.arbeidstaker.fjernarbeidsgiver" />
                                </Button>
                            </div>
                        )}

                        <ArbeidstakerComponent
                            søkerId={soknad.soekerId}
                            arbeidstaker={currentItem as Arbeidstaker}
                            listeelementindex={currentItemIndex}
                            nyeSoknadsperioder={soknad.soeknadsperiode || []}
                            eksisterendeSoknadsperioder={eksisterendeSoknadsperioder}
                            updateListeinfoInSoknad={(info: Partial<ItemInfo>) =>
                                editSoknad(editItem(currentItemIndex, info))
                            }
                            updateListeinfoInSoknadState={(info: Partial<ItemInfo>, showStatus: boolean) =>
                                editSoknadState(editItem(currentItemIndex, info), showStatus)
                            }
                            feilkodeprefiks={`ytelse.arbeidstid.arbeidstakerList[${currentItemIndex}]`}
                            getErrorMessage={getErrorMessage}
                            intl={intl}
                            arbeidsgivere={arbeidsgivere}
                            harDuplikatOrgnr={getHarDuplikatOrgnr()}
                        />

                        <UhaanderteFeilmeldinger
                            getFeilmeldinger={() =>
                                (getUhaandterteFeil &&
                                    getUhaandterteFeil(`ytelse.arbeidstid.arbeidstakerList[${currentItemIndex}]`)) ||
                                []
                            }
                        />
                    </Box>
                );
            })}

            <Button
                id="leggtillisteelementknapp"
                className="leggtillisteelementknapp"
                type="button"
                onClick={addItemHandler}
                icon={<PlusCircleIcon title="leggTill" fontSize="2rem" color="#0067C5" />}
            >
                <FormattedMessage id="skjema.arbeid.arbeidstaker.leggtilperiode" />
            </Button>
        </Fieldset>
    );
};
export default Arbeidstakerperioder;
