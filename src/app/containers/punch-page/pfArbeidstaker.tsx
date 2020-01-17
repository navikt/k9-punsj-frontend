import {
    GetErrorMessage,
    PeriodeComponent,
    UpdatePeriodeinfoInSoknad,
    UpdatePeriodeinfoInSoknadState
} from 'app/containers/punch-page/Periodepaneler';
import {IPunchFormComponentState}              from 'app/containers/punch-page/PunchForm';
import {IArbeidstaker, ISoknad, Periodeinfo}   from 'app/models/types';
import {stringToNumber}                        from 'app/utils/formatUtils';
import intlHelper                              from 'app/utils/intlUtils';
import {Input, RadioPanelGruppe, SkjemaGruppe} from 'nav-frontend-skjema';
import {SkjemaelementFeil}                     from 'nav-frontend-skjema/lib/skjemaelement-feilmelding';
import * as React                              from 'react';
import {Col, Container, Row}                   from 'react-bootstrap';
import {IntlShape}                             from 'react-intl';

export function pfArbeidstaker(parentState: IPunchFormComponentState,
                               setTgStringsInParentState: (tgStrings: string[]) => any,
                               generateTgStrings: (soknad: ISoknad) => string[]): PeriodeComponent<IArbeidstaker> {

    return (
        arbeidstaker: Periodeinfo<IArbeidstaker>,
        periodeindex: number,
        updatePeriodeinfoInSoknad: UpdatePeriodeinfoInSoknad<IArbeidstaker>,
        updatePeriodeinfoInSoknadState: UpdatePeriodeinfoInSoknadState<IArbeidstaker>,
        feilprefiks: string,
        getErrorMessage: GetErrorMessage,
        intl: IntlShape
    ) => {

        const {tgStrings} = parentState;

        type OrgOrPers = 'o' | 'p';

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

        const selectedType: OrgOrPers = arbeidstaker.organisasjonsnummer === null ? 'p' : 'o';

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
                            name={`arbeidsgivertype_${periodeindex}`}
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
                            onChange={event => {
                                updatePeriodeinfoInSoknadState({skalJobbeProsent: stringToNumber(event.target.value)});
                                tgStrings[periodeindex] = event.target.value;
                                setTgStringsInParentState(tgStrings);
                            }}
                            onBlur={event => {
                                updatePeriodeinfoInSoknad({skalJobbeProsent: stringToNumber(event.target.value)});
                                setTgStringsInParentState(generateTgStrings(parentState.soknad));
                            }}
                            onFocus={event => event.target.selectionStart = 0}
                            feil={getErrorMessage(`${feilprefiks}.skalJobbeProsent`)}
                        />
                    </Col>
                    <Col>
                        {selectedType === 'o'
                            ? <Input label={intlHelper(intl, 'skjema.arbeid.arbeidstaker.orgnr')}
                                     value={arbeidstaker.organisasjonsnummer || ''}
                                     onChange={event => updatePeriodeinfoInSoknadState({organisasjonsnummer: event.target.value})}
                                     onBlur={event => updatePeriodeinfoInSoknad({organisasjonsnummer: event.target.value})}
                                     feil={getErrorMessage(`${feilprefiks}.organisasjonsnummer`)}/>
                            : <Input label={intlHelper(intl, 'skjema.arbeid.arbeidstaker.ident')}
                                     value={arbeidstaker.norskIdent || ''}
                                     onChange={event => updatePeriodeinfoInSoknadState({norskIdent: event.target.value})}
                                     onBlur={event => updatePeriodeinfoInSoknad({norskIdent: event.target.value})}
                                     feil={getErrorMessage(`${feilprefiks}.norskIdent`)}/>}
                    </Col>
                </Row>
            </Container>
        </SkjemaGruppe>;
    };
}