import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { Fieldset, Panel } from '@navikt/ds-react';

import AddCircleSvg from 'app/assets/SVG/AddCircleSVG';
import BinSvg from 'app/assets/SVG/BinSVG';
import UhaanderteFeilmeldinger from 'app/components/skjema/UhaanderteFeilmeldinger';
import { ArbeidsgivereResponse } from 'app/models/types/ArbeidsgivereResponse';
import Organisasjon from 'app/models/types/Organisasjon';
import intlHelper from 'app/utils/intlUtils';

import { finnArbeidsgivere } from '../../api/api';
import { Arbeidstaker, IPeriode } from '../../models/types';
import { IPLSSoknad } from '../../søknader/pleiepenger-livets-sluttfase/types/PLSSoknad';
import ArbeidstakerComponent from './ArbeidstakerComponent';

type ItemInfo = any;

interface ArbeidstakerperioderProps {
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
}: ArbeidstakerperioderProps): JSX.Element => {
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
        <Fieldset className="listepaneler">
            {items?.map((currentItem, currentItemIndex) => {
                const panelid = `arbeidstakerpanel_${currentItemIndex}`;
                const getHarDuplikatOrgnr = () =>
                    items.filter(
                        (item) =>
                            item.organisasjonsnummer && item.organisasjonsnummer === currentItem.organisasjonsnummer,
                    ).length > 1;
                return (
                    <Panel
                        className={classNames('listepanel', 'arbeidstakerpanel')}
                        border={false}
                        id={panelid}
                        key={panelid}
                    >
                        <Fieldset>
                            {itemsWithInitialItem.length > 1 && (
                                <h2>
                                    <FormattedMessage
                                        id="skjema.arbeidsforhold.teller"
                                        values={{ indeks: currentItemIndex + 1 }}
                                    />
                                </h2>
                            )}
                            {itemsWithInitialItem.length > 1 && (
                                <div className="listepanelbunn">
                                    <button
                                        id="slett"
                                        className="fjernlisteelementknapp"
                                        type="button"
                                        onClick={() => removeItemHandler(currentItemIndex)}
                                        tabIndex={0}
                                    >
                                        <div className="slettIcon">
                                            <BinSvg title="fjern" />
                                        </div>
                                        {intlHelper(intl, 'skjema.arbeid.arbeidstaker.fjernarbeidsgiver')}
                                    </button>
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
                                        getUhaandterteFeil(
                                            `ytelse.arbeidstid.arbeidstakerList[${currentItemIndex}]`,
                                        )) ||
                                    []
                                }
                            />
                        </Fieldset>
                    </Panel>
                );
            })}
            <button
                id="leggtillisteelementknapp"
                className="leggtillisteelementknapp"
                type="button"
                onClick={addItemHandler}
            >
                <div className="leggtilperiodeIcon">
                    <AddCircleSvg title="leggtil" />
                </div>
                {intlHelper(intl, 'skjema.arbeid.arbeidstaker.leggtilperiode')}
            </button>
        </Fieldset>
    );
};
export default Arbeidstakerperioder;
