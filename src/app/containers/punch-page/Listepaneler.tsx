import intlHelper          from 'app/utils/intlUtils';
import classNames          from 'classnames';
import {Knapp}             from 'nav-frontend-knapper';
import {Panel}             from 'nav-frontend-paneler';
import {SkjemaGruppe}      from 'nav-frontend-skjema';
import {SkjemaelementFeil} from 'nav-frontend-skjema/lib/skjemaelement-feilmelding';
import * as React          from 'react';
import {IntlShape}         from 'react-intl';

export type UpdateListeinfoInSoknad<T> = (info: Partial<T>) => any;
export type UpdateListeinfoInSoknadState<T> = (info: Partial<T>, showStatus?: boolean) => any;
export type GetErrorMessage = (kode: string) => (SkjemaelementFeil | undefined);

export type ListeComponent<T> = (itemInfo: T,
                                 itemIndex: number,
                                 updateListeinfoInSoknad: UpdateListeinfoInSoknad<T>,
                                 updateListeinfoInSoknadState: UpdateListeinfoInSoknadState<T>,
                                 feilkodeprefiksMedIndeks?: string,
                                 getErrorMessage?: GetErrorMessage,
                                 intl?: IntlShape) => React.ReactElement;

export interface IListepanelerProps<T> {
    intl: IntlShape;
    items: T[]; // Liste
    component?: ListeComponent<T>; // Skal returnere et React-element for et gitt element i lista
    panelid: (itemIndex: number) => string; // String som skal brukes til å identifisere hvert enkelt element
    initialItem: T; // Objektet som legges til når man legger til et nytt element i lista
    editSoknad: (itemInfo: T[]) => any; // Funksjon som skal kalles for å sende en put-spørring med oppdatert info og oppdatere Redux-store deretter (brukes i hovedsak på onBlur)
    editSoknadState: (itemInfo: T[], showStatus?: boolean) => any; // Funskjon som skal kalles for å oppdatere state på PunchForm (må brukes på onChange)
    className?: string;
    textLeggTil?: string;
    textFjern?: string;
    panelClassName?: string;
    getErrorMessage?: (kode: string) => (SkjemaelementFeil | undefined);
    feilkodeprefiks?: string;
    minstEn?: boolean;
    onAdd?: () => any;
    onRemove?: () => any;
    overridePanelErrorMessage?: (itemIndex: number) => (SkjemaelementFeil | undefined);
}

type ItemInfo = any;

export const Listepaneler: React.FunctionComponent<IListepanelerProps<ItemInfo>> = (props: IListepanelerProps<ItemInfo>) => {

    const items = !!props.items ? props.items : [];
    const {intl, component, editSoknad, editSoknadState, feilkodeprefiks} = props;
    const getErrorMessage = (code: string) => props.getErrorMessage && feilkodeprefiks ? props.getErrorMessage(`${feilkodeprefiks}${code}`) : undefined;

    const editItem: (index: number, iteminfo: Partial<ItemInfo>) => ItemInfo[] = (index: number, iteminfo: Partial<ItemInfo>) => {
        const newInfo: ItemInfo = {...props.items[index], ...iteminfo};
        const newArray = items;
        newArray[index] = newInfo;
        return newArray;
    };

    const addItem = () => {
        const newArray = items;
        newArray.push(props.initialItem);
        return newArray;
    };

    const removeItem = (index: number) => {
        const newArray = items;
        newArray.splice(index, 1);
        return newArray;
    };

    return <SkjemaGruppe
        feil={getErrorMessage('')}
        className={classNames('listepaneler', props.className)}
    >
        {!!props.items && props.items!.map((itemInfo, itemIndex) => {
            const panelErrorMessage = getErrorMessage(`[${itemIndex}]`);
            const panelid = props.panelid(itemIndex);
            return <Panel
                className={classNames('listepanel', props.panelClassName, !component ? 'kunperiode' : '')}
                border={true}
                id={panelid}
                key={itemIndex}
            >
                <SkjemaGruppe feil={props.overridePanelErrorMessage ? props.overridePanelErrorMessage(itemIndex) : panelErrorMessage || undefined}>
                    {!!component && component(
                        itemInfo,
                        itemIndex,
                        info => editSoknad(editItem(itemIndex, info)),
                        (info, showStatus) => editSoknadState(editItem(itemIndex, info), showStatus),
                        `${feilkodeprefiks}[${itemIndex}]`,
                        getErrorMessage,
                        intl
                    )}
                    <div className="listepanelbunn">
                        <Knapp
                            onClick={() => {
                                const newArray: ItemInfo[] = removeItem(itemIndex);
                                editSoknadState(newArray);
                                editSoknad(newArray);
                                !!props.onRemove && props.onRemove();
                            }}
                            className="fjernlisteelementknapp"
                            disabled={props.minstEn && props.items.length < 2}
                        >
                            {intlHelper(intl, props.textFjern || 'skjema.liste.fjern')}
                        </Knapp>
                    </div>
                </SkjemaGruppe>
            </Panel>
        })}
        <Knapp
            onClick={() => {
                const newArray: ItemInfo[] = addItem();
                editSoknadState(newArray);
                editSoknad(newArray);
                !!props.onAdd && props.onAdd();
            }}
            className="leggtillisteelementknapp"
        >
            {intlHelper(intl, props.textLeggTil || 'skjema.liste.legg_til')}
        </Knapp>
    </SkjemaGruppe>;
};