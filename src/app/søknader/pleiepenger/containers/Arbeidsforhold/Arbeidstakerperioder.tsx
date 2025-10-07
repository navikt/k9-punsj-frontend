import React, { useEffect, useState } from 'react';

import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import { Box, Button, Heading } from '@navikt/ds-react';
import { PlusCircleIcon, TrashIcon } from '@navikt/aksel-icons';

import UhaanderteFeilmeldinger from 'app/components/skjema/UhaanderteFeilmeldinger';
import { IPeriode } from 'app/models/types';
import { ArbeidsgivereResponse } from 'app/models/types/ArbeidsgivereResponse';
import Organisasjon from 'app/models/types/Organisasjon';

import {
    getMaxDatoFraSøknadsperioder,
    getMinDatoFraSøknadsperioder,
} from 'app/utils/date-utils/src/minMaxDatesInPerioder';
import { finnArbeidsgivere } from '../../../../api/api';
import { Arbeidstaker } from '../../../../models/types/Arbeidstaker';
import { IPSBSoknad } from '../../../../models/types/PSBSoknad';
import ArbeidstakerComponent from './Arbeidstaker/Arbeidstaker';

type ItemInfo = any;

interface Props {
    soknad: IPSBSoknad;
    søknadsperioder: IPeriode[];
    initialArbeidstaker: Arbeidstaker;
    updateSoknad: (soknad: Partial<IPSBSoknad>) => (dispatch: any) => Promise<Response>;
    updateSoknadState: (soknad: Partial<IPSBSoknad>, showStatus?: boolean) => void;
    getErrorMessage: (attribute: string, indeks?: number) => string | undefined;
    getUhaandterteFeil: (kode: string) => (string | undefined)[];
}

const Arbeidstakerperioder = ({
    soknad,
    initialArbeidstaker,
    søknadsperioder,
    updateSoknad,
    updateSoknadState,
    getErrorMessage,
    getUhaandterteFeil,
}: Props): JSX.Element => {
    const [arbeidsgivere, setArbeidsgivere] = useState<Organisasjon[]>([]);

    const { arbeidstid, soekerId } = soknad;

    const fom = getMinDatoFraSøknadsperioder(søknadsperioder);
    const tom = getMaxDatoFraSøknadsperioder(søknadsperioder);

    useEffect(() => {
        if (soekerId) {
            finnArbeidsgivere(
                soekerId,
                (response, data: ArbeidsgivereResponse) => {
                    setArbeidsgivere(data?.organisasjoner || []);
                },
                fom,
                tom,
            );
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
        <div className="listepaneler">
            {items?.map((currentItem, currentItemIndex) => {
                const panelid = `arbeidstakerpanel_${currentItemIndex}`;

                const getHarDuplikatOrgnr = () =>
                    items.filter(
                        (item) =>
                            item.organisasjonsnummer && item.organisasjonsnummer === currentItem.organisasjonsnummer,
                    ).length > 1;

                return (
                    <Box
                        borderRadius="small"
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
                                    variant="tertiary"
                                    icon={<TrashIcon title="fjernarbeidsgiver" />}
                                >
                                    <FormattedMessage id="skjema.arbeid.arbeidstaker.fjernarbeidsgiver" />
                                </Button>
                            </div>
                        )}

                        <ArbeidstakerComponent
                            søkerId={soekerId}
                            arbeidstaker={currentItem as Arbeidstaker}
                            listeelementindex={currentItemIndex}
                            updateListeinfoInSoknad={(info: Partial<ItemInfo>) =>
                                editSoknad(editItem(currentItemIndex, info))
                            }
                            updateListeinfoInSoknadState={(info: Partial<ItemInfo>, showStatus: boolean) =>
                                editSoknadState(editItem(currentItemIndex, info), showStatus)
                            }
                            feilkodeprefiks={`ytelse.arbeidstid.arbeidstakerList[${currentItemIndex}]`}
                            getErrorMessage={getErrorMessage}
                            arbeidsgivere={arbeidsgivere}
                            harDuplikatOrgnr={getHarDuplikatOrgnr()}
                            søknadsperioder={søknadsperioder}
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
        </div>
    );
};
export default Arbeidstakerperioder;
