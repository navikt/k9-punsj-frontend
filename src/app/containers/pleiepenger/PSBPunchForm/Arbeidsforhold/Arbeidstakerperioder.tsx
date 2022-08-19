/* eslint-disable @typescript-eslint/no-explicit-any */
import AddCircleSvg from 'app/assets/SVG/AddCircleSVG';
import BinSvg from 'app/assets/SVG/BinSVG';
import UhaanderteFeilmeldinger from 'app/components/skjema/UhaanderteFeilmeldinger';
import { ArbeidsgivereResponse } from 'app/models/types/ArbeidsgivereResponse';
import Organisasjon from 'app/models/types/Organisasjon';
import intlHelper from 'app/utils/intlUtils';
import classNames from 'classnames';
import Panel from 'nav-frontend-paneler';
import { SkjemaGruppe } from 'nav-frontend-skjema';
import React, { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { finnArbeidsgivere } from '../../../../api/api';
import { Arbeidstaker } from '../../../../models/types/Arbeidstaker';
import { IPSBSoknad } from '../../../../models/types/PSBSoknad';
import ArbeidstakerComponent from './Arbeidstaker/Arbeidstaker';

type ItemInfo = any;

interface ArbeidstakerperioderProps {
    soknad: IPSBSoknad;
    initialArbeidstaker: Arbeidstaker;
    updateSoknad: (soknad: Partial<IPSBSoknad>) => (dispatch: any) => Promise<Response>;
    updateSoknadState: (soknad: Partial<IPSBSoknad>, showStatus?: boolean) => void;
    getErrorMessage: (attribute: string, indeks?: number) => string | undefined;
    getUhaandterteFeil: (kode: string) => (string | undefined)[];
}

const Arbeidstakerperioder = ({
    soknad,
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
        iteminfo: Partial<ItemInfo>
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
            showStatus
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
        <SkjemaGruppe className="listepaneler">
            {items?.map((currentItem, currentItemIndex) => {
                const panelid = `arbeidstakerpanel_${currentItemIndex}`;
                const getHarDuplikatOrgnr = () =>
                    items.filter(
                        (item) =>
                            item.organisasjonsnummer && item.organisasjonsnummer === currentItem.organisasjonsnummer
                    ).length > 1;
                return (
                    <Panel
                        className={classNames('listepanel', 'arbeidstakerpanel')}
                        border={false}
                        id={panelid}
                        key={panelid}
                    >
                        <SkjemaGruppe>
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
                                updateListeinfoInSoknad={(info: Partial<ItemInfo>) =>
                                    editSoknad(editItem(currentItemIndex, info))
                                }
                                updateListeinfoInSoknadState={(info: Partial<ItemInfo>, showStatus: boolean) =>
                                    editSoknadState(editItem(currentItemIndex, info), showStatus)
                                }
                                feilkodeprefiks={`ytelse.arbeidstid.arbeidstakerList[${currentItemIndex}]`}
                                getErrorMessage={getErrorMessage}
                                getUhaandterteFeil={getUhaandterteFeil}
                                intl={intl}
                                arbeidsgivere={arbeidsgivere}
                                harDuplikatOrgnr={getHarDuplikatOrgnr()}
                                gyldigePerioder={soknad.soeknadsperiode}
                            />
                            <UhaanderteFeilmeldinger
                                getFeilmeldinger={() =>
                                    (getUhaandterteFeil &&
                                        getUhaandterteFeil(
                                            `ytelse.arbeidstid.arbeidstakerList[${currentItemIndex}]`
                                        )) ||
                                    []
                                }
                            />
                        </SkjemaGruppe>
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
        </SkjemaGruppe>
    );
};
export default Arbeidstakerperioder;
