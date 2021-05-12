import {UpdateListeinfoInSoknad, UpdateListeinfoInSoknadState} from 'app/containers/pleiepenger/Listepaneler';
import {GetErrorMessage, PeriodeinfoPaneler} from 'app/containers/pleiepenger/PeriodeinfoPaneler';
import intlHelper from 'app/utils/intlUtils';
import {CheckboksPanelGruppe, Input, RadioPanelGruppe, SkjemaGruppe} from 'nav-frontend-skjema';
import * as React from 'react';
import {Container, Row} from 'react-bootstrap';
import {IntlShape} from 'react-intl';
import {Virksomhetstyper} from "../../models/enums/Virksomhetstyper";
import {JaNei} from "../../models/enums";
import {
    ISelvstendigNaeringsdrivendeOpptjening,
    SelvstendigNaeringsdrivendeOpptjening
} from "../../models/types/PSBSoknad";
import {CountrySelect} from "../../components/country-select/CountrySelect";


export function pfSelvstendigNæringsdrivende(): (sn: SelvstendigNaeringsdrivendeOpptjening, listeelementindex: number, updateListeinfoInSoknad: UpdateListeinfoInSoknad<ISelvstendigNaeringsdrivendeOpptjening>, updateListeinfoInSoknadState: UpdateListeinfoInSoknadState<ISelvstendigNaeringsdrivendeOpptjening>, feilprefiks: string, getErrorMessage: GetErrorMessage, intl: IntlShape) => JSX.Element {

    return (
        sn: SelvstendigNaeringsdrivendeOpptjening,
        listeelementindex: number,
        updateListeinfoInSoknad: UpdateListeinfoInSoknad<ISelvstendigNaeringsdrivendeOpptjening>,
        updateListeinfoInSoknadState: UpdateListeinfoInSoknadState<ISelvstendigNaeringsdrivendeOpptjening>,
        feilprefiks: string,
        getErrorMessage: GetErrorMessage,
        intl: IntlShape,
    ) => {

        const updateVirksomhetstyper = (v: Virksomhetstyper, checked: boolean, index: number) => {
            if (checked && !sn.perioder[index].virksomhetstyper.some((vtype) => vtype === v)) {
                sn.perioder[index].virksomhetstyper.push(v);
            } else {
                if (sn.perioder[index].virksomhetstyper.some((vtype) => vtype === v)) {
                    sn.perioder[index].virksomhetstyper.splice(sn.perioder[index].virksomhetstyper.indexOf(v), 1);
                }
            }
        }

        return <SkjemaGruppe className={"sn-panel"}>
            <Container className="infoContainer">
                <div className={"generelleopplysiniger"}>
                    <Row>
                        <Input label={intlHelper(intl, 'skjema.arbeid.sn.virksomhetsnavn')}
                               bredde={"M"}
                               value={sn.virksomhetNavn || ''}
                               className="virksomhetsNavn"
                               onChange={event => updateListeinfoInSoknadState({virksomhetNavn: event.target.value})}
                               onBlur={event => updateListeinfoInSoknad({virksomhetNavn: event.target.value})}
                               feil={getErrorMessage(`[${listeelementindex}].virksomhetNavn`)}/>
                    </Row>
                    <Row>
                        <Input label={intlHelper(intl, 'skjema.arbeid.arbeidstaker.orgnr')}
                               bredde={"M"}
                               value={sn.organisasjonsnummer || ''}
                               className="sn-organisasjonsnummer"
                               onChange={event => updateListeinfoInSoknadState({organisasjonsnummer: event.target.value})}
                               onBlur={event => updateListeinfoInSoknad({organisasjonsnummer: event.target.value})}
                               feil={getErrorMessage(`[${listeelementindex}].organisasjonsnummer`)}/>
                    </Row>
                </div>
            </Container>
            <PeriodeinfoPaneler
                intl={intl}
                periods={sn.perioder}
                panelid={i => `selvstendignæringsdrivendepanel_${listeelementindex}_${i}`}
                initialPeriodeinfo={{periode: {fom: '', tom: ''}}}
                editSoknad={(perioder) => updateListeinfoInSoknad({perioder})}
                editSoknadState={(perioder) => updateListeinfoInSoknadState({perioder})}
                component={(info, periodeindex, updatePeriodeinfoInSoknad, updatePeriodeinfoInSoknadState, feilkodeprefiksMedIndeks) =>
                    <>
                        <CheckboksPanelGruppe
                            checkboxes={Object.values(Virksomhetstyper).map((v) => ({
                                label: v,
                                value: v,
                                onChange: (e) => updateVirksomhetstyper(v, e.target.checked, periodeindex),
                                checked: sn.perioder[periodeindex].virksomhetstyper.some(vt => vt === v)
                            }))}
                            onChange={() => undefined}/>
                        <RadioPanelGruppe
                            className="horizontalRadios"
                            name={"virksomhetRegistrertINorge"}
                            radios={Object.values(JaNei).map((jn) => ({
                                label: intlHelper(intl, jn),
                                value: jn,
                            }))}
                            legend={intlHelper(intl, 'skjema.sn.registrertINorge')}
                            checked={!sn.perioder[periodeindex].registrertIUtlandet ? JaNei.JA : JaNei.NEI}
                            onChange={event => {
                                updatePeriodeinfoInSoknadState({
                                    registrertIUtlandet:
                                        ((event.target as HTMLInputElement).value as JaNei) === JaNei.NEI ? true : false
                                });
                            }}/>
                        {sn.perioder[periodeindex].registrertIUtlandet &&
                        <CountrySelect
                            value={sn.perioder[periodeindex].landkode}
                            label={intlHelper(intl, 'skjema.sn.registrertLand')}
                            onChange={event => {
                                updatePeriodeinfoInSoknadState({landkode: event.target.value})
                                updatePeriodeinfoInSoknad({landkode: event.target.value})
                            }}
                        />
                        }
                        <Input
                            label={intlHelper(intl, 'skjema.sn.bruttoinntekt')}
                            bredde={"M"}
                            value={sn.perioder[periodeindex].bruttoInntekt}
                            onChange={event => {
                                updatePeriodeinfoInSoknadState({bruttoInntekt: event.target.value});
                            }}
                            onBlur={event => {
                                updatePeriodeinfoInSoknad({bruttoInntekt: event.target.value});
                            }}
                            onFocus={event => event.target.selectionStart = 0}
                        />
                    </>}
                minstEn={true}
                textFjern="skjema.arbeid.arbeidstaker.fjernperiode"
                getErrorMessage={getErrorMessage}
                feilkodeprefiks={`[${listeelementindex}].timerfaktisk`}
                kanHaFlere={true}
                utenPeriode={true}
            />
        </SkjemaGruppe>;
    };
}
