import {UpdateListeinfoInSoknad, UpdateListeinfoInSoknadState} from 'app/containers/punch-page/Listepaneler';
import {GetErrorMessage, PeriodeComponent, Periodepaneler}     from 'app/containers/punch-page/Periodepaneler';
import {Arbeidstaker, IArbeidstaker, OrgOrPers}                from 'app/models/types';
import {stringToNumber}                                        from 'app/utils/formatUtils';
import intlHelper                                              from 'app/utils/intlUtils';
import {Input, RadioPanelGruppe, SkjemaGruppe}                 from 'nav-frontend-skjema';
import * as React                                              from 'react';
import {Col, Container, Row}                                   from 'react-bootstrap';
import {IntlShape}                                             from 'react-intl';

export function pfArbeidstaker(tgStrings: string[][],
                               setTgStringsInParentState: (tgStrings: string[][]) => any,
                               generateTgStrings: () => string[][],
                               sokernr: 1 | 2): PeriodeComponent<IArbeidstaker> {

    return (
        arbeidstaker: Arbeidstaker,
        listeelementindex: number,
        updateListeinfoInSoknad: UpdateListeinfoInSoknad<IArbeidstaker>,
        updateListeinfoInSoknadState: UpdateListeinfoInSoknadState<IArbeidstaker>,
        feilprefiks: string,
        getErrorMessage: GetErrorMessage,
        intl: IntlShape
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
                            name={`arbeidsgivertype_${sokernr}_${listeelementindex}`}
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
                                      value={arbeidstaker.norskIdent || ''}
                                      className="arbeidstaker-norskIdent"
                                      onChange={event => updateListeinfoInSoknadState({norskIdent: event.target.value})}
                                      onBlur={event => updateListeinfoInSoknad({norskIdent: event.target.value})}
                                      feil={getErrorMessage(`[${listeelementindex}].norskIdent`)}/>}
                    </Col>
                </Row>
            </Container>
            <Periodepaneler
                intl={intl}
                periods={arbeidstaker.skalJobbeProsent}
                panelid={i => `arbeidstakerpanel_${listeelementindex}_${i}`}
                initialPeriodeinfo={{grad: 0, periode: {fraOgMed: '', tilOgMed: ''}}}
                editSoknad={skalJobbeProsent => updateListeinfoInSoknad({skalJobbeProsent})}
                editSoknadState={skalJobbeProsent => updateListeinfoInSoknadState({skalJobbeProsent})}
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