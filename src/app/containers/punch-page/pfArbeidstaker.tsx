import {
    GetErrorMessage,
    PeriodeComponent,
    UpdatePeriodeinfoInSoknad,
    UpdatePeriodeinfoInSoknadState
}                                               from 'app/containers/punch-page/Periodepaneler';
import {Arbeidstaker, IArbeidstaker, OrgOrPers} from 'app/models/types';
import {stringToNumber}                         from 'app/utils/formatUtils';
import intlHelper                               from 'app/utils/intlUtils';
import {Input, RadioPanelGruppe, SkjemaGruppe}  from 'nav-frontend-skjema';
import * as React                               from 'react';
import {Col, Container, Row}                    from 'react-bootstrap';
import {IntlShape}                              from 'react-intl';

export function pfArbeidstaker(tgStrings: string[],
                               setTgStringsInParentState: (tgStrings: string[]) => any,
                               generateTgStrings: () => string[],
                               sokernr: 1 | 2): PeriodeComponent<IArbeidstaker> {

    return (
        arbeidstaker: Arbeidstaker,
        periodeindex: number,
        updatePeriodeinfoInSoknad: UpdatePeriodeinfoInSoknad<IArbeidstaker>,
        updatePeriodeinfoInSoknadState: UpdatePeriodeinfoInSoknadState<IArbeidstaker>,
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
            updatePeriodeinfoInSoknadState({organisasjonsnummer, norskIdent});
            updatePeriodeinfoInSoknad({organisasjonsnummer, norskIdent});
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
                            name={`arbeidsgivertype_${sokernr}_${periodeindex}`}
                            legend={intlHelper(intl, 'skjema.arbeid.arbeidstaker.type')}
                            onChange={event => updateOrgOrPers((event.target as HTMLInputElement).value as OrgOrPers)}
                            checked={selectedType}
                        />
                    </Col>
                </Row>
                <Row noGutters={true}>
                    <Col>
                        <Input
                            label={intlHelper(intl, 'skjema.arbeid.arbeidstaker.grad')}
                            value={tgStrings[periodeindex]}
                            className="arbeidstaker-tilstedevaerelse"
                            onChange={event => {
                                updatePeriodeinfoInSoknadState({skalJobbeProsent: stringToNumber(event.target.value)});
                                tgStrings[periodeindex] = event.target.value;
                                setTgStringsInParentState(tgStrings);
                            }}
                            onBlur={event => {
                                updatePeriodeinfoInSoknad({skalJobbeProsent: stringToNumber(event.target.value)});
                                setTgStringsInParentState(generateTgStrings());
                            }}
                            onFocus={event => event.target.selectionStart = 0}
                            feil={getErrorMessage(`${feilprefiks}.skalJobbeProsent`)}
                        />
                    </Col>
                    <Col>
                        {selectedType === 'o'
                            ? <Input label={intlHelper(intl, 'skjema.arbeid.arbeidstaker.orgnr')}
                                     value={arbeidstaker.organisasjonsnummer || ''}
                                     className="arbeidstaker-organisasjonsnummer"
                                     onChange={event => updatePeriodeinfoInSoknadState({organisasjonsnummer: event.target.value})}
                                     onBlur={event => updatePeriodeinfoInSoknad({organisasjonsnummer: event.target.value})}
                                     feil={getErrorMessage(`${feilprefiks}.organisasjonsnummer`)}/>
                            : <Input label={intlHelper(intl, 'skjema.arbeid.arbeidstaker.ident')}
                                     value={arbeidstaker.norskIdent || ''}
                                     className="arbeidstaker-norskIdent"
                                     onChange={event => updatePeriodeinfoInSoknadState({norskIdent: event.target.value})}
                                     onBlur={event => updatePeriodeinfoInSoknad({norskIdent: event.target.value})}
                                     feil={getErrorMessage(`${feilprefiks}.norskIdent`)}/>}
                    </Col>
                </Row>
            </Container>
        </SkjemaGruppe>;
    };
}