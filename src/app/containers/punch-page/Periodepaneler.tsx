import {PeriodInput}            from 'app/components/period-input/PeriodInput';
import {IPeriode, IPeriodeinfo} from 'app/models/types';
import intlHelper               from 'app/utils/intlUtils';
import classNames               from 'classnames';
import {Knapp}                  from 'nav-frontend-knapper';
import {Panel}                  from 'nav-frontend-paneler';
import * as React               from 'react';
import {IntlShape}              from 'react-intl';

export interface IPeriodepanelerProps {
    intl: IntlShape;
    periods: IPeriodeinfo[]; // Liste over periodisert informasjon
    component: (info: IPeriodeinfo,
                periodeindex: number,
                updatePeriodeinfoInSoknad: (info: Partial<IPeriodeinfo>) => any,
                updatePeriodeinfoInSoknadState: (info: Partial<IPeriodeinfo>) => any) => React.ReactElement; // Skal returnere et React-element for en gitt periode i lista
    panelid: (periodeindex: number) => string; // String som skal brukes til å identifisere hvert enkelt element
    initialPeriodeinfo: IPeriodeinfo; // Objektet som legges til når man legger til en ny periode i lista
    editSoknad: (periodeinfo: IPeriodeinfo[]) => any; // Funksjon som skal kalles for å sende en put-spørring med oppdatert info og oppdatere Redux-store deretter (brukes i hovedsak på onBlur)
    editSoknadState: (periodeinfo: IPeriodeinfo[]) => any; // Funskjon som skal kalles for å oppdatere state på PunchForm (må brukes på onChange)
    textLeggTil?: string;
    textFjern?: string;
    panelClassName?: string;
}

export const Periodepaneler: React.FunctionComponent<IPeriodepanelerProps> = (props: IPeriodepanelerProps) => {

    const periods = !!props.periods ? props.periods : [];
    const {intl, editSoknad, editSoknadState} = props;

    const editInfo: (index: number, periodeinfo: Partial<IPeriodeinfo>) => IPeriodeinfo[] = (index: number, periodeinfo: Partial<IPeriodeinfo>) => {
        const newInfo: IPeriodeinfo = {...props.periods[index], ...periodeinfo};
        const newArray = periods;
        newArray[index] = newInfo;
        return newArray;
    };

    const editPeriode = (index: number, periode: IPeriode) => editInfo(index, {periode});

    const addPeriode = () => {
        const newArray = periods;
        newArray.push(props.initialPeriodeinfo);
        return newArray;
    };

    const removePeriode = (index: number) => {
        const newArray = periods;
        newArray.splice(index, 1);
        return newArray;
    };

    return <>
        {!!props.periods && props.periods!.map((periodeinfo, periodeindex) => {
            const panelid = props.panelid(periodeindex);
            return <Panel className={classNames('periodepanel', props.panelClassName)} border={true} id={panelid} key={periodeindex}>
                <PeriodInput
                    periode={periodeinfo.periode}
                    intl={props.intl}
                    onChange={(periode) => {editSoknadState(editPeriode(periodeindex, periode))}}
                    onBlur={(periode) => {editSoknad(editPeriode(periodeindex, periode))}}
                />
                {props.component(
                    periodeinfo,
                    periodeindex,
                    info => editSoknad(editInfo(periodeindex, info)),
                    info => editSoknadState(editInfo(periodeindex, info))
                )}
                <div className="periodebunn">
                    <Knapp
                        onClick={() => {
                            const newArray: IPeriodeinfo[] = removePeriode(periodeindex);
                            editSoknadState(newArray);
                            editSoknad(newArray);
                        }}
                        className="fjernperiodeknapp"
                    >
                        {intlHelper(intl, props.textFjern || 'skjema.perioder.fjern')}
                    </Knapp>
                </div>
            </Panel>
        })}
        <Knapp
            onClick={() => {
                const newArray: IPeriodeinfo[] = addPeriode();
                editSoknadState(newArray);
                editSoknad(newArray);
            }}
            className="leggtilperiodeknapp"
        >
            {intlHelper(intl, props.textLeggTil || 'skjema.perioder.legg_til')}
        </Knapp>
    </>;
};