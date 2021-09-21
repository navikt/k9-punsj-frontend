import intlHelper from 'app/utils/intlUtils';
import classNames from 'classnames';
import Panel from 'nav-frontend-paneler';
import { SkjemaGruppe } from 'nav-frontend-skjema';
import * as React from 'react';
import { FormattedMessage, IntlShape } from 'react-intl';
import AddCircleSvg from '../../assets/SVG/AddCircleSVG';
import BinSvg from '../../assets/SVG/BinSVG';

export type UpdateListeinfoInSoknad<T> = (info: Partial<T>) => any;
export type UpdateListeinfoInSoknadState<T> = (info: Partial<T>, showStatus?: boolean) => any;
export type GetErrorMessage = (kode: string) => React.ReactNode | boolean | undefined;

export type ListeComponent<T> = (
    itemInfo: T,
    itemIndex: number,
    updateListeinfoInSoknad: UpdateListeinfoInSoknad<T>,
    updateListeinfoInSoknadState: UpdateListeinfoInSoknadState<T>,
    feilkodeprefiksMedIndeks?: string,
    getErrorMessage?: GetErrorMessage,
    intl?: IntlShape
) => React.ReactElement;

export interface IListepanelerProps<T> {
    intl: IntlShape;
    items: T[]; // Liste
    component?: ListeComponent<T>; // Skal returnere et React-element for et gitt element i lista
    panelid: (itemIndex: number) => string; // String som skal brukes til å identifisere hvert enkelt element
    initialItem: T; // Objektet som legges til når man legger til et nytt element i lista
    editSoknad: (itemInfo: T[]) => any; // Funksjon som skal kalles for å sende en put-spørring med oppdatert info og oppdatere Redux-store deretter (brukes i hovedsak på onBlur)
    editSoknadState: (itemInfo: T[], showStatus?: boolean) => any; // Funskjon som skal kalles for å oppdatere state på PunchFormOld (må brukes på onChange)
    className?: string;
    textLeggTil?: string;
    textFjern?: string;
    panelClassName?: string;
    getErrorMessage?: GetErrorMessage;
    feilkodeprefiks?: string;
    minstEn?: boolean;
    onAdd?: () => any;
    onRemove?: () => any;
    kanHaFlere: boolean;
    medSlettKnapp: boolean;
}

type ItemInfo = any;

export const Listepaneler: React.FunctionComponent<IListepanelerProps<ItemInfo>> = (
    props: IListepanelerProps<ItemInfo>
) => {
    const { items, initialItem, className, textLeggTil } = props;
    const itemsWithInitialItem = items.length > 0 ? items : [initialItem];
    const { intl, component, editSoknad, editSoknadState, feilkodeprefiks, kanHaFlere, medSlettKnapp } = props;
    const getErrorMessage = (code: string) =>
        props.getErrorMessage && feilkodeprefiks ? props.getErrorMessage(`${feilkodeprefiks}${code}`) : undefined;

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
        newArray.push(initialItem);
        return newArray;
    };

    const removeItem = (index: number) => {
        const newArray = itemsWithInitialItem;
        newArray.splice(index, 1);
        return newArray;
    };

    const removeItemHandler = (itemIndex: number) => {
        const newArray: ItemInfo[] = removeItem(itemIndex);
        editSoknadState(newArray);
        editSoknad(newArray);

        if (props.onRemove) {
            props.onRemove();
        }
    };

    const addItemHandler = () => {
        const newArray: ItemInfo[] = addItem();
        editSoknadState(newArray);
        editSoknad(newArray);
        if (props.onAdd) {
            props.onAdd();
        }
    };

    return (
        <SkjemaGruppe feil={getErrorMessage('')} className={classNames('listepaneler', className)}>
            {!!items &&
                items!.map((itemInfo, itemIndex) => {
                    const panelid = props.panelid(itemIndex);
                    const panelErrorMessage =
                        feilkodeprefiks === 'perioder' ? undefined : getErrorMessage(`[${panelid}]`);
                    return (
                        <Panel
                            className={classNames('listepanel', props.panelClassName, !component ? 'kunperiode' : '')}
                            border={false}
                            id={panelid}
                            key={panelid}
                        >
                            <SkjemaGruppe feil={panelErrorMessage}>
                                {feilkodeprefiks === 'arbeidstid.arbeidstaker' && itemsWithInitialItem.length > 1 && (
                                    <h2>
                                        <FormattedMessage
                                            id="skjema.arbeidsforhold.teller"
                                            values={{ indeks: itemIndex + 1 }}
                                        />
                                    </h2>
                                )}
                                {!!medSlettKnapp && itemsWithInitialItem.length > 1 && (
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
                                            {intlHelper(intl, props.textFjern || 'skjema.liste.fjern')}
                                        </button>
                                    </div>
                                )}
                                {!!component &&
                                    component(
                                        itemInfo,
                                        itemIndex,
                                        (info) => editSoknad(editItem(itemIndex, info)),
                                        (info, showStatus) => editSoknadState(editItem(itemIndex, info), showStatus),
                                        `${feilkodeprefiks}[${itemIndex}]`,
                                        getErrorMessage,
                                        intl
                                    )}
                            </SkjemaGruppe>
                        </Panel>
                    );
                })}
            {kanHaFlere && (
                <button
                    id="leggtillisteelementknapp"
                    className="leggtillisteelementknapp"
                    type="button"
                    onClick={addItemHandler}
                >
                    <div className="leggtilperiodeIcon">
                        <AddCircleSvg title="leggtil" />
                    </div>
                    {intlHelper(intl, textLeggTil || 'skjema.liste.legg_til')}
                </button>
            )}
        </SkjemaGruppe>
    );
};
