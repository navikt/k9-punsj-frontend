import {UpdateListeinfoInSoknad, UpdateListeinfoInSoknadState} from 'app/containers/pleiepenger/Listepaneler';
import {GetErrorMessage, PeriodeinfoComponent, PeriodeinfoPaneler} from 'app/containers/pleiepenger/PeriodeinfoPaneler';
import {stringToNumber} from 'app/utils/formatUtils';
import intlHelper from 'app/utils/intlUtils';
import {Input, RadioPanelGruppe, SkjemaGruppe} from 'nav-frontend-skjema';
import * as React from 'react';
import {Col, Container, Row} from 'react-bootstrap';
import {IntlShape} from 'react-intl';
import {ArbeidstakerV2, IArbeidstakerV2, OrgOrPers} from "../../models/types/ArbeidstakerV2";
import {ArbeidstidinfoPaneler} from "./ArbeidstidinfoPaneler";

export function pfArbeidstaker(tgStrings: string[][],
                               setTgStringsInParentState: (tgStrings: string[][]) => any,
                               generateTgStrings: () => string[][]): (arbeidstaker: ArbeidstakerV2, listeelementindex: number, updateListeinfoInSoknad: UpdateListeinfoInSoknad<IArbeidstakerV2>, updateListeinfoInSoknadState: UpdateListeinfoInSoknadState<IArbeidstakerV2>, feilprefiks: string, getErrorMessage: GetErrorMessage, intl: IntlShape, fjernKnapp: (itemIndex: number) => React.ReactElement) => JSX.Element {

    return (
        arbeidstaker: ArbeidstakerV2,
        listeelementindex: number,
        updateListeinfoInSoknad: UpdateListeinfoInSoknad<IArbeidstakerV2>,
        updateListeinfoInSoknadState: UpdateListeinfoInSoknadState<IArbeidstakerV2>,
        feilprefiks: string,
        getErrorMessage: GetErrorMessage,
        intl: IntlShape,
        fjernKnapp:  (itemIndex: number) => React.ReactElement,
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
            <Container className="infoContainer">
                <div className={"o-p-container"}>
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

                        <Input
                            label={intlHelper(intl, 'skjema.arbeid.arbeidstaker.timernormalt')}
                            className={"right"}
                            bredde={"XS"}
                            value={arbeidstaker.arbeidstidInfo.jobberNormaltTimerPerDag}
                            onChange={event => {
                                updateListeinfoInSoknadState({arbeidstidInfo: {jobberNormaltTimerPerDag: event.target.value}});
                            }}
                            onBlur={event => {
                                updateListeinfoInSoknad({arbeidstidInfo: {jobberNormaltTimerPerDag: event.target.value}});
                            }}
                            onFocus={event => event.target.selectionStart = 0}
                        />
                    </div>
                </Row>
                </div>
                <ArbeidstidinfoPaneler
                    intl={intl}
                    periods={arbeidstaker.arbeidstidInfo.perioder}
                    panelid={i => `arbeidstakerpanel_${listeelementindex}_${i}`}
                    initialPeriodeinfo={{periode: {fom: '', tom: ''}, faktiskArbeidTimerPerDag: ''}}
                    editSoknad={arbeidstidInfo => updateListeinfoInSoknad({arbeidstidInfo: {perioder: arbeidstidInfo}})}
                    editSoknadState={arbeidstidInfo => updateListeinfoInSoknadState({arbeidstidInfo: {perioder: arbeidstidInfo}})}
                    /*component={(info, periodeindex, updatePeriodeinfoInSoknad, updatePeriodeinfoInSoknadState, feilkodeprefiksMedIndeks) =>
                        <Input
                            label={intlHelper(intl, 'skjema.arbeid.arbeidstaker.timerfaktisk')}
                            value={tgStrings[listeelementindex][periodeindex]}
                            className="arbeidstaker-tilstedevaerelse"
                            onChange={event => {
                                updatePeriodeinfoInSoknadState({faktiskArbeidTimerPerDag: event.target.value});
                                tgStrings[listeelementindex][periodeindex] = event.target.value;
                                setTgStringsInParentState(tgStrings);
                            }}
                            onBlur={event => {
                                updatePeriodeinfoInSoknad({faktiskArbeidTimerPerDag: event.target.value});
                                setTgStringsInParentState(generateTgStrings());
                            }}
                            onFocus={event => event.target.selectionStart = 0}
                            feil={getErrorMessage(`${feilkodeprefiksMedIndeks}.grad`)}
                        />} */
                    minstEn={true}
                    textFjern="skjema.arbeid.arbeidstaker.fjernperiode"
                    getErrorMessage={getErrorMessage}
                    feilkodeprefiks={`[${listeelementindex}].skalJobbeProsent`}
                    kanHaFlere={true}
                    fjernKnapp={fjernKnapp}
                />
            </Container>
        </SkjemaGruppe>;
    };
}
