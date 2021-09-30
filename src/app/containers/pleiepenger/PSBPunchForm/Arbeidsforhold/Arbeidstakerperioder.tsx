/* eslint-disable @typescript-eslint/no-explicit-any */
import AddCircleSvg from 'app/assets/SVG/AddCircleSVG';
import BinSvg from 'app/assets/SVG/BinSVG';
import { ArbeidsgivereResponse } from 'app/models/types/ArbeidsgivereResponse';
import Organisasjon from 'app/models/types/Organisasjon';
import { get } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import classNames from 'classnames';
import Panel from 'nav-frontend-paneler';
import { SkjemaGruppe } from 'nav-frontend-skjema';
import React, { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { ApiPath } from '../../../../apiConfig';
import { Arbeidstaker } from '../../../../models/types/Arbeidstaker';
import { IPSBSoknad } from '../../../../models/types/PSBSoknad';
import PfArbeidstaker from './Arbeidstaker/Arbeidstaker';

type ItemInfo = any;

interface ArbeidstakerperioderProps {
    soknad: IPSBSoknad;
    initialArbeidstaker: Arbeidstaker;
    updateSoknad: (soknad: Partial<IPSBSoknad>) => (dispatch: any) => Promise<Response>;
    updateSoknadState: (soknad: Partial<IPSBSoknad>, showStatus?: boolean) => void;
    getErrorMessage: (attribute: string, indeks?: number) => string | undefined;
}

const Arbeidstakerperioder = ({
    soknad,
    initialArbeidstaker,
    updateSoknad,
    updateSoknadState,
    getErrorMessage,
}: ArbeidstakerperioderProps): JSX.Element => {
    const intl = useIntl();
    const [arbeidsgivere, setArbeidsgivere] = useState<Organisasjon[]>([]);
    const { arbeidstid, soekerId } = soknad;

    const finnArbeidsgivere = () => {
        if (soekerId) {
            get(
                ApiPath.FINN_ARBEIDSGIVERE,
                { norskIdent: soekerId },
                { 'X-Nav-NorskIdent': soekerId },
                (response, data: ArbeidsgivereResponse) => {
                    setArbeidsgivere(data?.organisasjoner || []);
                }
            );
        }
    };

    useEffect(() => {
        finnArbeidsgivere();
    }, []);

    const items = arbeidstid?.arbeidstakerList || [];
    const itemsWithInitialItem = items.length > 0 ? items : [initialArbeidstaker];
    const getErrorMessageWithPrefix = (code: string) =>
        getErrorMessage ? getErrorMessage(`arbeidstid.arbeidstaker${code}`) : undefined;

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
        <SkjemaGruppe feil={getErrorMessageWithPrefix('')} className="listepaneler">
            {items?.map((itemInfo, itemIndex) => {
                const panelid = `arbeidstakerpanel_${itemIndex}`;
                const panelErrorMessage = getErrorMessage(`[${panelid}]`);
                return (
                    <Panel
                        className={classNames('listepanel', 'arbeidstakerpanel')}
                        border={false}
                        id={panelid}
                        key={panelid}
                    >
                        <SkjemaGruppe feil={panelErrorMessage}>
                            {itemsWithInitialItem.length > 1 && (
                                <h2>
                                    <FormattedMessage
                                        id="skjema.arbeidsforhold.teller"
                                        values={{ indeks: itemIndex + 1 }}
                                    />
                                </h2>
                            )}
                            {itemsWithInitialItem.length > 1 && (
                                <div className="listepanelbunn">
                                    <button
                                        id="slett"
                                        className="fjernlisteelementknapp"
                                        type="button"
                                        onClick={() => removeItemHandler(itemIndex)}
                                        tabIndex={0}
                                    >
                                        <div className="slettIcon">
                                            <BinSvg title="fjern" />
                                        </div>
                                        {intlHelper(intl, 'skjema.arbeid.arbeidstaker.fjernarbeidsgiver')}
                                    </button>
                                </div>
                            )}
                            <PfArbeidstaker
                                søkerId={soknad.soekerId}
                                arbeidstaker={itemInfo as Arbeidstaker}
                                listeelementindex={itemIndex}
                                updateListeinfoInSoknad={(info: Partial<ItemInfo>) =>
                                    editSoknad(editItem(itemIndex, info))
                                }
                                updateListeinfoInSoknadState={(info: Partial<ItemInfo>, showStatus: boolean) =>
                                    editSoknadState(editItem(itemIndex, info), showStatus)
                                }
                                feilprefiks={`arbeidstid.arbeidstaker[${itemIndex}]`}
                                getErrorMessage={getErrorMessageWithPrefix}
                                intl={intl}
                                arbeidsgivere={arbeidsgivere}
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
