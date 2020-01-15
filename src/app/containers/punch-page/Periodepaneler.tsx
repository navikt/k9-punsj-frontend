import {PeriodInput}                                               from 'app/components/period-input/PeriodInput';
import {IPeriode, IPeriodeinfo, Periodeinfo, PeriodeinfoExtension} from 'app/models/types';
import intlHelper                                                  from 'app/utils/intlUtils';
import classNames                                                  from 'classnames';
import {Knapp}                                                     from 'nav-frontend-knapper';
import {Panel}                                                     from 'nav-frontend-paneler';
import {SkjemaGruppe}                                              from 'nav-frontend-skjema';
import {SkjemaelementFeil}                                         from 'nav-frontend-skjema/lib/skjemaelement-feilmelding';
import * as React                                                  from 'react';
import {IntlShape}                                                 from 'react-intl';

export type PeriodeComponent<T> = (info: Periodeinfo<T>,
                                   periodeindex: number,
                                   updatePeriodeinfoInSoknad: (info: Partial<Periodeinfo<T>>) => any,
                                   updatePeriodeinfoInSoknadState: (info: Partial<Periodeinfo<T>>, showStatus?: boolean) => any,
                                   feilkodeprefiksMedIndeks?: string) => React.ReactElement;

export interface IPeriodepanelerProps {
    intl: IntlShape;
    periods: IPeriodeinfo[]; // Liste over periodisert informasjon
    component?: PeriodeComponent<PeriodeinfoExtension>; // Skal returnere et React-element for en gitt periode i lista
    panelid: (periodeindex: number) => string; // String som skal brukes til å identifisere hvert enkelt element
    initialPeriodeinfo: Periodeinfo<PeriodeinfoExtension>; // Objektet som legges til når man legger til en ny periode i lista
    editSoknad: (periodeinfo: IPeriodeinfo[]) => any; // Funksjon som skal kalles for å sende en put-spørring med oppdatert info og oppdatere Redux-store deretter (brukes i hovedsak på onBlur)
    editSoknadState: (periodeinfo: IPeriodeinfo[], showStatus?: boolean) => any; // Funskjon som skal kalles for å oppdatere state på PunchForm (må brukes på onChange)
    className?: string;
    textLeggTil?: string;
    textFjern?: string;
    panelClassName?: string;
    getErrorMessage?: (kode: string) => (SkjemaelementFeil | undefined);
    feilkodeprefiks?: string;
    minstEn?: boolean;
}

export const Periodepaneler: React.FunctionComponent<IPeriodepanelerProps> = (props: IPeriodepanelerProps) => {

    const periods = !!props.periods ? props.periods : [];
    const {intl, component, editSoknad, editSoknadState, getErrorMessage, feilkodeprefiks} = props;

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

    return <SkjemaGruppe
        feil={getErrorMessage && feilkodeprefiks && getErrorMessage(feilkodeprefiks) || undefined}
        className={classNames('periodepaneler', props.className)}
    >
        {!!props.periods && props.periods!.map((periodeinfo, periodeindex) => {
            const panelid = props.panelid(periodeindex);
            return <Panel
                className={classNames('periodepanel', props.panelClassName, !component ? 'kunperiode' : '')}
                border={true}
                id={panelid}
                key={periodeindex}
            >
                <SkjemaGruppe feil={getErrorMessage && feilkodeprefiks && getErrorMessage(`${feilkodeprefiks}[${periodeindex}]`) || undefined}>
                    <PeriodInput
                        periode={periodeinfo.periode || {}}
                        intl={props.intl}
                        onChange={(periode) => {editSoknadState(editPeriode(periodeindex, periode))}}
                        onBlur={(periode) => {editSoknad(editPeriode(periodeindex, periode))}}
                    />
                    {!!component && component(
                        periodeinfo,
                        periodeindex,
                        info => editSoknad(editInfo(periodeindex, info)),
                        (info, showStatus) => editSoknadState(editInfo(periodeindex, info), showStatus),
                        `${feilkodeprefiks}[${periodeindex}]`
                    )}
                    <div className="periodebunn">
                        <Knapp
                            onClick={() => {
                                const newArray: IPeriodeinfo[] = removePeriode(periodeindex);
                                editSoknadState(newArray);
                                editSoknad(newArray);
                            }}
                            className="fjernperiodeknapp"
                            disabled={props.minstEn && props.periods.length < 2}
                        >
                            {intlHelper(intl, props.textFjern || 'skjema.perioder.fjern')}
                        </Knapp>
                    </div>
                </SkjemaGruppe>
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
    </SkjemaGruppe>;
};