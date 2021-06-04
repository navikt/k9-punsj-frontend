import {UpdateListeinfoInSoknad, UpdateListeinfoInSoknadState} from 'app/containers/pleiepenger/Listepaneler';
import {GetErrorMessage, PeriodeinfoPaneler} from 'app/containers/pleiepenger/PeriodeinfoPaneler';
import intlHelper from 'app/utils/intlUtils';
import {Input, RadioPanelGruppe, SkjemaGruppe} from 'nav-frontend-skjema';
import * as React from 'react';
import { Container, Row} from 'react-bootstrap';
import {FormattedMessage, IntlShape} from 'react-intl';
import {ArbeidstakerV2, IArbeidstakerV2, OrgOrPers} from "../../models/types/ArbeidstakerV2";
import {arbeidstidInformasjon} from "./ArbeidstidInfo";
import {pfArbeidstider} from "./pfArbeidstider";


export function pfArbeidstaker(): (arbeidstaker: ArbeidstakerV2, listeelementindex: number, updateListeinfoInSoknad: UpdateListeinfoInSoknad<IArbeidstakerV2>, updateListeinfoInSoknadState: UpdateListeinfoInSoknadState<IArbeidstakerV2>, feilprefiks: string, getErrorMessage: GetErrorMessage, intl: IntlShape) => JSX.Element {

    return (
        arbeidstaker: ArbeidstakerV2,
        listeelementindex: number,
        updateListeinfoInSoknad: UpdateListeinfoInSoknad<IArbeidstakerV2>,
        updateListeinfoInSoknadState: UpdateListeinfoInSoknadState<IArbeidstakerV2>,
        feilprefiks: string,
        getErrorMessage: GetErrorMessage,
        intl: IntlShape,
    ) => {

        const updateOrgOrPers = (orgOrPers: OrgOrPers) => {
            let organisasjonsnummer: string | null;
            let norskIdent: string | null;
            if (orgOrPers === 'o') {
                organisasjonsnummer = '';
                norskIdent = null;
            } else {
                organisasjonsnummer = null;
                norskIdent = '';
            }
            updateListeinfoInSoknadState({organisasjonsnummer, norskIdent});
            updateListeinfoInSoknad({organisasjonsnummer, norskIdent});
        };

        const selectedType: OrgOrPers = arbeidstaker.orgOrPers();

        return <SkjemaGruppe className={"arbeidstaker-panel"}
                             feil={getErrorMessage(`${feilprefiks}.${selectedType === 'o' ? 'norskIdent' : 'organisasjonsnummer'}`)}>
            <Container>
                    <Row noGutters={true}>
                        <RadioPanelGruppe
                            className="horizontalRadios"
                            radios={[
                                {label: intlHelper(intl, 'skjema.arbeid.arbeidstaker.org'), value: 'o'},
                                {label: intlHelper(intl, 'skjema.arbeid.arbeidstaker.pers'), value: 'p'}
                            ]}
                            name={`arbeidsgivertype_${1}_${listeelementindex}`}
                            legend={intlHelper(intl, 'skjema.arbeid.arbeidstaker.type')}
                            onChange={event => updateOrgOrPers((event.target as HTMLInputElement).value as OrgOrPers)}
                            checked={selectedType}
                        />

                    </Row>
                    <Row noGutters={true}>
                        <div className={"input-row"}>
                            {selectedType === 'o'
                            && <Input label={intlHelper(intl, 'skjema.arbeid.arbeidstaker.orgnr')}
                                      bredde={"M"}
                                      value={arbeidstaker.organisasjonsnummer || ''}
                                      className="arbeidstaker-organisasjonsnummer"
                                      onChange={event => updateListeinfoInSoknadState({organisasjonsnummer: event.target.value})}
                                      onBlur={event => updateListeinfoInSoknad({organisasjonsnummer: event.target.value})}
                                      feil={getErrorMessage(`[${listeelementindex}].organisasjonsnummer`)}/>}
                            {selectedType === 'p'
                            && <Input label={intlHelper(intl, 'skjema.arbeid.arbeidstaker.ident')}
                                      value={arbeidstaker.norskIdent || ''}
                                      bredde={"M"}
                                      className="arbeidstaker-norskIdent"
                                      onChange={event => updateListeinfoInSoknadState({norskIdent: event.target.value})}
                                      onBlur={event => updateListeinfoInSoknad({norskIdent: event.target.value})}
                                      feil={getErrorMessage(`[${listeelementindex}].norskIdent`)}/>}
                        </div>
                    </Row>
                    {arbeidstidInformasjon(intl)}
                <PeriodeinfoPaneler
                    intl={intl}
                    periods={arbeidstaker.arbeidstidInfo.perioder}
                    panelid={i => `arbeidstakerpanel_${listeelementindex}_${i}`}
                    initialPeriodeinfo={{faktiskArbeidTimerPerDag: '', periode: {fom: '', tom: ''}}}
                    editSoknad={(arbeidstidInfo) => updateListeinfoInSoknad({
                        arbeidstidInfo: {
                            ...arbeidstaker.arbeidstidInfo,
                            perioder: arbeidstidInfo
                        }
                    })}
                    editSoknadState={(arbeidstidInfo) => updateListeinfoInSoknadState({
                        arbeidstidInfo: {
                            ...arbeidstaker.arbeidstidInfo,
                            perioder: arbeidstidInfo
                        }
                    })}
                    component={pfArbeidstider()}
                    minstEn={true}
                    textFjern="skjema.arbeid.arbeidstaker.fjernperiode"
                    getErrorMessage={getErrorMessage}
                    feilkodeprefiks={`[${listeelementindex}].timerfaktisk`}
                    kanHaFlere={true}
                    medSlettKnapp={false}
                />

            </Container>
        </SkjemaGruppe>;
    };
}
