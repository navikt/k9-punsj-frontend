import {UpdateListeinfoInSoknad, UpdateListeinfoInSoknadState} from 'app/containers/pleiepenger/Listepaneler';
import {GetErrorMessage, PeriodeComponent, Periodepaneler}     from 'app/containers/pleiepenger/Periodepaneler';
import {Arbeidstaker, IArbeidstaker, OrgOrPers}                from 'app/models/types';
import {stringToNumber}                                        from 'app/utils/formatUtils';
import intlHelper                                              from 'app/utils/intlUtils';
import {Input, RadioPanelGruppe, SkjemaGruppe}                 from 'nav-frontend-skjema';
import * as React                                              from 'react';
import {Col, Container, Row}                                   from 'react-bootstrap';
import {IntlShape}                                             from 'react-intl';
import {ArbeidstakerV2, IArbeidstakerV2} from "../../models/types/ArbeidstakerV2";

export function pfArbeidstaker(tgStrings: string[][],
                               setTgStringsInParentState: (tgStrings: string[][]) => any,
                               generateTgStrings: () => string[][]): PeriodeComponent<IArbeidstakerV2> {

    return (
        arbeidstaker: ArbeidstakerV2,
        listeelementindex: number,
        updateListeinfoInSoknad: UpdateListeinfoInSoknad<IArbeidstakerV2>,
        updateListeinfoInSoknadState: UpdateListeinfoInSoknadState<IArbeidstakerV2>,
        feilprefiks: string,
        getErrorMessage: GetErrorMessage,
        intl: IntlShape
    ) => {

        const updateOrgOrPers = (orgOrPers: OrgOrPers) => {
            let organisasjonsnummer: string | null;
            let norskIdentitetsnummer: string | null;
            if (orgOrPers === 'o') {
                organisasjonsnummer = '';
                norskIdentitetsnummer = null;
            } else {
                organisasjonsnummer = null;
                norskIdentitetsnummer = '';
            }
            updateListeinfoInSoknadState({organisasjonsnummer, norskIdentitetsnummer});
            updateListeinfoInSoknad({organisasjonsnummer, norskIdentitetsnummer});
        };

        const selectedType: OrgOrPers = arbeidstaker.orgOrPers();

        return <SkjemaGruppe feil={getErrorMessage(`${feilprefiks}.${selectedType === 'o' ? 'norskIdent' : 'organisasjonsnummer'}`)}>
            <Container className="infoContainer">
                <Row noGutters={true}>
                    <Col>
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
                    </Col>
                </Row>
                <Row noGutters={true}>
                    <Col>
                        {selectedType === 'o'
                            && <Input label={intlHelper(intl, 'skjema.arbeid.arbeidstaker.orgnr')}
                                      value={arbeidstaker.organisasjonsnummer || ''}
                                      className="arbeidstaker-organisasjonsnummer"
                                      onChange={event => updateListeinfoInSoknadState({organisasjonsnummer: event.target.value})}
                                      onBlur={event => updateListeinfoInSoknad({organisasjonsnummer: event.target.value})}
                                      feil={getErrorMessage(`[${listeelementindex}].organisasjonsnummer`)}/>}
                    </Col>
                    <Col>
                        {selectedType === 'p'
                            && <Input label={intlHelper(intl, 'skjema.arbeid.arbeidstaker.ident')}
                                      value={arbeidstaker.norskIdentitetsnummer || ''}
                                      className="arbeidstaker-norskIdent"
                                      onChange={event => updateListeinfoInSoknadState({norskIdentitetsnummer: event.target.value})}
                                      onBlur={event => updateListeinfoInSoknad({norskIdentitetsnummer: event.target.value})}
                                      feil={getErrorMessage(`[${listeelementindex}].norskIdent`)}/>}
                    </Col>
                </Row>
            </Container>
            <Periodepaneler
                intl={intl}
                periods={arbeidstaker.arbeidstidInfo.perioder}
                panelid={i => `arbeidstakerpanel_${listeelementindex}_${i}`}
                initialPeriodeinfo={{grad: 0, periode: {fraOgMed: '', tilOgMed: ''}}}
  //              editSoknad={arbeidstidInfo => updateListeinfoInSoknad({arbeidstidInfo : {perioder: arbeidstidInfo}})}
  //              editSoknadState={arbeidstidInfo => updateListeinfoInSoknadState({arbeidstidInfo : {perioder: arbeidstidInfo}})}
                editSoknad={() => undefined}
                editSoknadState={() => undefined}
                component={(info, periodeindex, updatePeriodeinfoInSoknad, updatePeriodeinfoInSoknadState, feilkodeprefiksMedIndeks) => <Input
                    label={intlHelper(intl, 'skjema.arbeid.arbeidstaker.grad')}
                    value={tgStrings[listeelementindex][periodeindex]}
                    className="arbeidstaker-tilstedevaerelse"
                    onChange={event => {
                        updatePeriodeinfoInSoknadState({grad: stringToNumber(event.target.value)});
                        tgStrings[listeelementindex][periodeindex] = event.target.value;
                        setTgStringsInParentState(tgStrings);
                    }}
                    onBlur={event => {
                        updatePeriodeinfoInSoknad({grad: stringToNumber(event.target.value)});
                        setTgStringsInParentState(generateTgStrings());
                    }}
                    onFocus={event => event.target.selectionStart = 0}
                    feil={getErrorMessage(`${feilkodeprefiksMedIndeks}.grad`)}
                />}
                minstEn={true}
                textFjern="skjema.arbeid.arbeidstaker.fjernperiode"
                getErrorMessage={getErrorMessage}
                feilkodeprefiks={`[${listeelementindex}].skalJobbeProsent`}
            />
        </SkjemaGruppe>;
    };
}
