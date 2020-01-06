import DeleteButton                                           from 'app/components/delete-button/DeleteButton';
import {Arbeidsforhold, PunchStep}                            from 'app/models/enums';
import {IPeriode, IPunchFormState, IPunchState, ISoknad}      from 'app/models/types';
import {IInputError}                                          from 'app/models/types/InputError';
import {
    getMappe,
    resetMappeAction,
    resetPunchFormAction,
    setIdentAction,
    setStepAction,
    submitSoknad,
    undoChoiceOfMappeAction,
    updateSoknad
}                                                             from 'app/state/actions';
import {RootStateType}                                        from 'app/state/RootState';
import {setHash}                                              from 'app/utils';
import intlHelper                                             from 'app/utils/intlUtils';
import _                                                      from 'lodash';
import {AlertStripeFeil, AlertStripeInfo, AlertStripeSuksess} from 'nav-frontend-alertstriper';
import {EtikettAdvarsel, EtikettFokus, EtikettSuksess}        from 'nav-frontend-etiketter';
import {Knapp}                                                from 'nav-frontend-knapper';
import {Panel}                                                from 'nav-frontend-paneler';
import {Checkbox, Input, Select, SkjemaGruppe, Textarea}      from 'nav-frontend-skjema';
import NavFrontendSpinner                                     from 'nav-frontend-spinner';
import * as React                                             from 'react';
import {Col, Container, Row}                                  from 'react-bootstrap';
import {injectIntl, WrappedComponentProps}                    from 'react-intl';
import {connect}                                              from 'react-redux';

export interface IPunchFormComponentProps {
    getPunchPath:   (step: PunchStep, values?: any) => string;
    journalpostid:  string;
    id:             string;
}

export interface IPunchFormStateProps {
    punchFormState: IPunchFormState;
    punchState:     IPunchState;
}

export interface IPunchFormDispatchProps {
    getMappe:                   typeof getMappe;
    resetMappeAction:           typeof resetMappeAction;
    setIdentAction:             typeof setIdentAction;
    setStepAction:              typeof setStepAction;
    undoChoiceOfMappeAction:    typeof undoChoiceOfMappeAction;
    updateSoknad:               typeof updateSoknad;
    submitSoknad:               typeof submitSoknad;
    resetPunchFormAction:       typeof resetPunchFormAction;
}

export interface IPunchFormComponentState {
    soknad:             ISoknad;
    isFetched:          boolean;
    showStatus:         boolean;
    periodeInFocus?:    number;
}

type IPunchFormProps = IPunchFormComponentProps &
                       WrappedComponentProps &
                       IPunchFormStateProps &
                       IPunchFormDispatchProps;

export class PunchFormComponent extends React.Component<IPunchFormProps, IPunchFormComponentState> {

    state: IPunchFormComponentState = {
        soknad: {
            perioder: [{
                fra_og_med: '',
                til_og_med: '',
                beredskap: {
                    svar: false,
                    tilleggsinformasjon: ''
                },
                nattevaak: {
                    svar: false,
                    tilleggsinformasjon: ''
                }
            }],
            spraak: 'nb',
            barn: {
                norsk_ident: '',
                foedselsdato: ''
            },
            signert: false
        },
        isFetched: false,
        showStatus: false
    };

    componentDidMount(): void {
        const {id} = this.props;
        this.props.getMappe(id);
        this.props.setStepAction(PunchStep.FILL_FORM);
        this.setState(this.state);
    }

    componentDidUpdate(prevProps: Readonly<IPunchFormProps>, prevState: Readonly<IPunchFormComponentState>, snapshot?: any): void {
        const {mappe} = this.props.punchFormState;
        if (!!mappe && !this.state.isFetched) {
            this.setState({soknad: {...this.state.soknad, ...this.getSoknadFromStore()}, isFetched: true});
            this.props.setIdentAction(Object.keys(mappe.personlig)[0] || '');
        }
    }

    componentWillUnmount(): void {
        this.props.resetPunchFormAction();
    }

    render() {

        const {intl, punchFormState} = this.props;
        const {soknad, periodeInFocus} = this.state;
        const isSoknadComplete = !!this.getManglerFromStore() && !this.getManglerFromStore().length;

        if (punchFormState.isComplete) {
            setHash(this.props.getPunchPath(PunchStep.COMPLETED));
            return null;
        }

        if (punchFormState.isMappeLoading) {
            return <NavFrontendSpinner/>;
        }

        if (!!punchFormState.error) {
            return <>
                <AlertStripeFeil>{intlHelper(intl, 'skjema.feil.ikke_funnet', {id: this.props.id})}</AlertStripeFeil>
                <p><Knapp onClick={this.handleStartButtonClick}>{intlHelper(intl, 'skjema.knapp.tilstart')}</Knapp></p>
            </>;
        }

        if (!soknad) {
            return null;
        }

        return (<>
            {this.statusetikett()}
            {this.backButton()}
            {!!punchFormState.updateMappeError && <AlertStripeFeil>{intlHelper(intl, 'skjema.feil.ikke_lagret')}</AlertStripeFeil>}
            {!!punchFormState.submitMappeError && <AlertStripeFeil>{intlHelper(intl, 'skjema.feil.ikke_sendt')}</AlertStripeFeil>}
            {!punchFormState.updateMappeError && !punchFormState.submitMappeError && (isSoknadComplete
                ? <AlertStripeSuksess>{intlHelper(intl, 'skjema.melding.komplett')}</AlertStripeSuksess>
                : <AlertStripeInfo>{intlHelper(intl, 'skjema.melding.fyll_ut')}</AlertStripeInfo>)}
            <h2>{intlHelper(intl, 'skjema.signatur.overskrift')}</h2>
            <Checkbox
                label={intlHelper(intl, 'skjema.signatur.bekreftelse')}
                className="signatur-checkbox bold-label"
                checked={_.get(soknad, 'signert', false)}
                {...this.onChangeOnlyUpdate(event => ({signert: event.target.checked}))}
                feil={this.getErrorMessage('signert')}
            />
            <div className={!soknad.signert ? 'disabled-punch-form' : undefined}>
                <h2>Opplysninger om barn og søker</h2>
                <Select
                    name="sprak"
                    label={intlHelper(intl, 'skjema.spraak')}
                    className="bold-label"
                    value={soknad.spraak || 'nb'}
                    {...this.onChangeOnlyUpdate(event => ({spraak: event.target.value}))}
                    feil={this.getErrorMessage('spraak')}
                    disabled={!soknad.signert}
                >
                    <option value='nb'>Bokmål</option>
                    <option value='nn'>Nynorsk</option>
                </Select>
                <SkjemaGruppe feil={this.getErrorMessage('barn')}>
                    <Input
                        label={intlHelper(intl, 'skjema.barn.ident')}
                        className="bold-label"
                        value={_.get(soknad, 'barn.norsk_ident', '')}
                        {...this.changeAndBlurUpdates(event => ({barn: {...soknad.barn, norsk_ident: event.target.value}}))}
                        feil={this.getErrorMessage('barn.norsk_ident')}
                        disabled={!soknad.signert}
                    />
                    <Input
                        type="date"
                        label={intlHelper(intl, 'skjema.barn.foedselsdato')}
                        className="bold-label"
                        value={_.get(soknad, 'barn.foedselsdato', '')}
                        {...this.changeAndBlurUpdates(event => ({barn: {...soknad.barn, foedselsdato: event.target.value}}))}
                        feil={this.getErrorMessage('barn.foedselsdato')}
                        disabled={!soknad.signert}
                    />
                </SkjemaGruppe>
                <h2>{intlHelper(intl, 'skjema.perioder.overskrift')}</h2>
                <SkjemaGruppe feil={this.getErrorMessage('perioder')}>
                    {soknad?.perioder?.map((periode, i) => (
                        <Panel
                            key={`periode_${i}`}
                            className={`periodepanel${periodeInFocus !== undefined ? (periodeInFocus === i ? ' focus' : ' notFocus') : ''}`}
                            border={true}
                        >
                            <Container>
                                <Row>
                                    <Col><Input
                                        type="date"
                                        label={intlHelper(intl, 'skjema.perioder.fom')}
                                        className="bold-label"
                                        value={_.get(periode, 'fra_og_med', '')}
                                        onChange={event => this.handlePeriodeChange(i, 'fra_og_med', event.target.value)}
                                        onBlur={() => {this.setPerioder(); this.unsetPeriodeFocus()}}
                                        feil={this.getErrorMessage(`perioder[${i}].fra_og_med`)}
                                        onFocus={() => this.setPeriodeFocus(i)}
                                        disabled={!soknad.signert}
                                    /></Col>
                                    <Col><Input
                                        type="date"
                                        label={intlHelper(intl, 'skjema.perioder.tom')}
                                        className="bold-label"
                                        value={_.get(periode, 'til_og_med', '')}
                                        onChange={event => this.handlePeriodeChange(i, 'til_og_med', event.target.value)}
                                        onBlur={() => {this.setPerioder(); this.unsetPeriodeFocus()}}
                                        feil={this.getErrorMessage(`perioder[${i}].til_og_med`)}
                                        onFocus={() => this.setPeriodeFocus(i)}
                                        disabled={!soknad.signert}
                                    /></Col>
                                </Row>
                                <Row><Col><SkjemaGruppe feil={this.getErrorMessage(`perioder[${i}].beredskap`)}>
                                    <Checkbox
                                        label={intlHelper(intl, 'skjema.perioder.beredskap.svar')}
                                        checked={_.get(periode, 'beredskap.svar', false)}
                                        onChange={event => {this.handlePeriodeChange(i, 'beredskap.svar', event.target.checked); this.setPerioder()}}
                                        className="bold-label"
                                        feil={this.getErrorMessage(`perioder[${i}].beredskap.svar`)}
                                        onFocus={() => this.setPeriodeFocus(i)}
                                        onBlur={this.unsetPeriodeFocus}
                                        disabled={!soknad.signert}
                                    />
                                    {!!periode.beredskap?.svar && <Textarea
                                        label={intlHelper(intl, 'skjema.perioder.beredskap.tilleggsinfo')}
                                        value={_.get(periode, 'beredskap.tilleggsinformasjon', '')}
                                        onChange={event => this.handlePeriodeChange(i, 'beredskap.tilleggsinformasjon', event.target.value)}
                                        onBlur={() => {this.setPerioder(); this.unsetPeriodeFocus()}}
                                        feil={this.getErrorMessage(`perioder[${i}].beredskap.tillegsinformasjon`)}
                                        onFocus={() => this.setPeriodeFocus(i)}
                                        disabled={!soknad.signert}
                                        maxLength={0}
                                    />}
                                </SkjemaGruppe></Col></Row>
                                <Row><Col><SkjemaGruppe feil={this.getErrorMessage(`perioder[${i}].nattevaak`)}>
                                    <Checkbox
                                        label={intlHelper(intl, 'skjema.perioder.nattevaak.svar')}
                                        checked={_.get(periode, 'nattevaak.svar', false)}
                                        onChange={event => {this.handlePeriodeChange(i, 'nattevaak.svar', event.target.checked); this.setPerioder()}}
                                        className="bold-label"
                                        feil={this.getErrorMessage(`perioder[${i}].nattevaak.svar`)}
                                        onFocus={() => this.setPeriodeFocus(i)}
                                        onBlur={this.unsetPeriodeFocus}
                                        disabled={!soknad.signert}
                                    />
                                    {!!periode.nattevaak?.svar && <Textarea
                                        label={intlHelper(intl, 'skjema.perioder.nattevaak.tilleggsinfo')}
                                        value={_.get(periode, 'nattevaak.tilleggsinformasjon', '')}
                                        onChange={event => this.handlePeriodeChange(i, 'nattevaak.tilleggsinformasjon', event.target.value)}
                                        onBlur={() => {this.setPerioder(); this.unsetPeriodeFocus()}}
                                        feil={this.getErrorMessage(`perioder[${i}].nattevaak.tilleggsinformasjon`)}
                                        onFocus={() => this.setPeriodeFocus(i)}
                                        disabled={!soknad.signert}
                                        maxLength={0}
                                    />}
                                </SkjemaGruppe></Col></Row>
                                <Row><Col>
                                    <h3>Arbeidsforhold</h3>
                                    <div className="periode_arbeid">
                                        {Object.values(Arbeidsforhold).map(af => <Panel border={true} key={`periode_arbeid_${af}`}>
                                            <Container>
                                                <Row>
                                                    <Col className="arbeidsforholdstype"><Knapp
                                                        title="Klikk for å legge til"
                                                        onClick={() => this.addArbeidsforhold(periode, af)}
                                                    >+ {intlHelper(intl, `arbeidsforhold.${af}`)}</Knapp></Col>
                                                </Row>
                                                {_.get(periode, ['arbeidsgivere', af], []).map((afinfo: any, afindex: number) => (
                                                    <Row key={`periode_${i}_${af}_${afindex}`} className="arbeidsforholdslisteelement">
                                                        {this.arbeidsforhold(i, af, afindex, afinfo)}
                                                        <Col className="d-flex align-items-center" xs="auto">
                                                            <DeleteButton
                                                                onClick={() => this.removeArbeidsforhold(periode, af, afindex)}
                                                                title={intlHelper(intl, 'skjema.perioder.arbeidsforhold.slett')}
                                                            />
                                                        </Col>
                                                    </Row>
                                                ))}
                                                {_.get(periode, ['arbeidsgivere', af], []).length > 0 && <Row>
                                                    <Col className="leggtilarbeidsforhold"><Knapp
                                                        title="Klikk for å legge til"
                                                        onClick={() => this.addArbeidsforhold(periode, af)}
                                                    >Legg til</Knapp></Col>
                                                </Row>}
                                            </Container>
                                        </Panel>)}
                                    </div>
                                    <Knapp
                                        disabled={soknad.perioder!.length === 1 || !soknad.signert}
                                        onClick={() => this.removePeriode(i)}
                                        onFocus={() => this.setPeriodeFocus(i)}
                                        onBlur={this.unsetPeriodeFocus}
                                    >{intlHelper(intl, 'skjema.perioder.fjern')}</Knapp>
                                </Col></Row>
                            </Container>
                        </Panel>
                    ))}
                </SkjemaGruppe>
                <Knapp
                    id="addperiod"
                    onClick={this.addPeriode}
                    disabled={!soknad.signert}
                >{intlHelper(intl, 'skjema.perioder.legg_til')}</Knapp>
                {/*<h2>{intlHelper(intl, 'skjema.utenlandsopphold.opplysninger')}</h2>
                {!!soknad?.medlemskap?.opphold?.length && (
                    <table className="tabell tabell--stripet">
                        <thead>
                            <tr>
                                <th>{intlHelper(intl, 'skjema.utenlandsopphold.land')}</th>
                                <th>{intlHelper(intl, 'skjema.utenlandsopphold.fom')}</th>
                                <th>{intlHelper(intl, 'skjema.utenlandsopphold.tom')}</th>
                                <th>{intlHelper(intl, 'skjema.utenlandsopphold.fjern')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(soknad.medlemskap.opphold).map((key) => (
                                <tr key={key}>
                                    <td><CountrySelect
                                        name={`opphold_land_${key}`}
                                        onChange={event => this.handleOppholdLandChange(+key, event.target.value)}
                                        onBlur={() => this.setOpphold()}
                                        selectedcountry={_.get(soknad.medlemskap!.opphold[key], 'land', '')}
                                        unselectedoption={'Velg …'}
                                        label=""
                                    /></td>
                                    <td><Input
                                        name={`opphold_fom_${key}`}
                                        onChange={event => this.handleOppholdFomChange(+key, event.target.value)}
                                        onBlur={() => this.setOpphold()}
                                        type="date"
                                        value={_.get(soknad.medlemskap!.opphold[key], 'periode.fra_og_med', '')}
                                        label=""
                                    /></td>
                                    <td><Input
                                        name={`opphold_tom_${key}`}
                                        onChange={event => this.handleOppholdTomChange(+key, event.target.value)}
                                        onBlur={() => this.setOpphold()}
                                        type="date"
                                        value={_.get(soknad.medlemskap!.opphold[key], 'periode.til_og_med', '')}
                                        label=""
                                    /></td>
                                    <td><Lukknapp bla={true} onClick={() => this.removeOpphold(+key)}/></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                <p><Knapp onClick={this.addOpphold}>{intlHelper(intl, 'skjema.utenlandsopphold.legg_til')}</Knapp></p>
                <Checkbox
                    label="Har bodd i utlandet i løpet av de siste 12 månedene"
                    checked={_.get(soknad, 'medlemskap.har_bodd_i_utlandet_siste_12_mnd', false)}
                    {...this.onChangeOnlyUpdate(event => ({medlemskap: {...soknad.medlemskap!, har_bodd_i_utlandet_siste_12_mnd: event.target.checked}}))}
                />
                <Checkbox
                    label="Skal bo i utlandet i løpet av de neste 12 månedene"
                    checked={_.get(soknad, 'medlemskap.skal_bo_i_utlandet_neste_12_mnd', false)}
                    {...this.onChangeOnlyUpdate(event => ({medlemskap: {...soknad.medlemskap!, skal_bo_i_utlandet_neste_12_mnd: event.target.checked}}))}
                />
                <h2>Beredskap</h2>
                <Checkbox
                    label="Beredskap"
                    checked={_.get(soknad, 'beredskap.svar', false)}
                    {...this.onChangeOnlyUpdate(event => ({beredskap: {...soknad.beredskap, svar: event.target.checked}}))}
                />
                <Textarea
                    label="Tilleggsopplysninger:"
                    value={_.get(soknad, 'beredskap.tilleggsinformasjon', '')}
                    {...this.changeAndBlurUpdates(event => ({beredskap: {...soknad.beredskap, tilleggsinformasjon: event.target.value}}))}
                />
                <h2>Nattevåk</h2>
                <Checkbox
                    label="Nattevåk"
                    checked={_.get(soknad, 'nattevaak.svar', false)}
                    {...this.onChangeOnlyUpdate(event => ({nattevaak: {...soknad.nattevaak, svar: event.target.checked}}))}
                />
                <Textarea
                    label="Tilleggsopplysninger:"
                    value={_.get(soknad, 'nattevaak.tilleggsinformasjon', '')}
                    {...this.changeAndBlurUpdates(event => ({nattevaak: {...soknad.nattevaak, tilleggsinformasjon: event.target.value}}))}
                />
                <h2>Søknad om pleiepenger</h2>
                <Input
                    name="fom"
                    type="date"
                    label="Fra og med:"
                    className="bold-label"
                    value={_.get(soknad, 'fra_og_med', '')}
                    {...this.changeAndBlurUpdates(event => ({fra_og_med: event.target.value}))}
                    feil={!!this.getErrorMessage('fra_og_med') ? {feilmelding: this.getErrorMessage('fra_og_med')} : undefined}
                />
                <Input
                    name="tom"
                    type="date"
                    label="Til og med:"
                    className="bold-label"
                    value={_.get(soknad, 'til_og_med', '')}
                    {...this.changeAndBlurUpdates(event => ({til_og_med: event.target.value}))}
                    feil={!!this.getErrorMessage('til_og_med') ? {feilmelding: this.getErrorMessage('til_og_med')} : undefined}
                />*/}
                <p className="sendknapp-wrapper"><Knapp
                    onClick={() => this.props.submitSoknad(this.props.id, this.props.punchState.ident)}
                    disabled={!isSoknadComplete}
                >{intlHelper(intl, 'skjema.knapp.send')}</Knapp></p>
            </div>
        </>);
    }

    private arbeidsforhold(periodeindex: number, af: Arbeidsforhold, afindex: number, afinfo: any) {
        const {intl} = this.props;
        const {soknad} = this.state;
        const periode = soknad.perioder![periodeindex];
        switch (af) {
            case Arbeidsforhold.ARBEIDSTAKER:
                return <>
                    <Col><Input
                        label={intlHelper(intl, 'skjema.perioder.arbeidsforhold.arbeidstaker.orgnr')}
                        value={_.get(afinfo, 'organisasjonsnummer', '')}
                        onChange={event => this.handleArbeidsforholdChange(periode, Arbeidsforhold.ARBEIDSTAKER, afindex, 'organisasjonsnummer', event.target.value)}
                        onBlur={() => {this.setPerioder(); this.unsetPeriodeFocus()}}
                        onFocus={() => this.setPeriodeFocus(periodeindex)}
                        disabled={!soknad.signert}
                        feil={this.getErrorMessage(`perioder[${periodeindex}].arbeidsgivere.arbeidstaker[${afindex}].organisasjonsnummer`)}
                    /></Col>
                    <Col><Input
                        label={intlHelper(intl, 'skjema.perioder.arbeidsforhold.arbeidstaker.fravaeriprosent')}
                        value={_.get(afinfo, 'grad', '')}
                        onChange={event => this.handleArbeidsforholdChange(periode, Arbeidsforhold.ARBEIDSTAKER, afindex, 'grad', event.target.value)}
                        onBlur={() => {this.setPerioder(); this.unsetPeriodeFocus()}}
                        onFocus={() => this.setPeriodeFocus(periodeindex)}
                        disabled={!soknad.signert}
                        feil={this.getErrorMessage(`perioder[${periodeindex}].arbeidsgivere.arbeidstaker[${afindex}].prosent`)}
                    /></Col>
                </>;
            default:
                return <Col>
                    <Checkbox
                        label={intlHelper(intl, 'skjema.perioder.arbeidsforhold.annet.selvstendig')}
                        checked={_.get(afinfo, 'selvstendig', false)}
                        onChange={event => this.handleArbeidsforholdChange(periode, Arbeidsforhold.ANNET, afindex, 'selvstendig', event.target.checked)}
                        onFocus={() => this.setPeriodeFocus(periodeindex)}
                        onBlur={this.unsetPeriodeFocus}
                        disabled={!soknad.signert}
                        feil={this.getErrorMessage(`perioder[${periodeindex}].arbeidsgivere.annet[${afindex}].selvstendig`)}
                    />
                </Col>;
        }
    }

    private backButton() {
        return <p><Knapp onClick={this.handleBackButtonClick}>
            {intlHelper(this.props.intl, 'skjema.knapp.tilbake')}
        </Knapp></p>;
    }

    private getSoknadFromStore = () => {
        const personlig = this.props.punchFormState.mappe?.personlig;
        return personlig?.[Object.keys(personlig)[0]]?.innhold;
    };

    private getManglerFromStore = () => {
        const personlig = this.props.punchFormState.mappe?.personlig;
        return personlig?.[Object.keys(personlig)[0]]?.mangler;
    };

    private getErrorMessage = (attribute: string) => {
        const errorMsg = this.getManglerFromStore()?.filter((m: IInputError) => m.attributt === attribute)?.[0]?.melding;
        return !!errorMsg ? {feilmelding: intlHelper(
            this.props.intl,
            `skjema.feil.${attribute}.${errorMsg}`.replace(/\[\d+]/, '[]')
        )} : undefined;
    };

    private updateSoknadState(soknad: Partial<ISoknad>, showStatus: boolean) {
        this.setState({soknad: {...this.state.soknad, ...soknad}, showStatus});
    }

    private handleBackButtonClick = () => {
        const {punchState, getPunchPath} = this.props;
        this.props.resetMappeAction();
        this.props.undoChoiceOfMappeAction();
        setHash(getPunchPath(PunchStep.CHOOSE_SOKNAD, {ident: punchState.ident}));
    };

    private handleStartButtonClick = () => {
        this.props.resetPunchFormAction();
        setHash(this.props.getPunchPath(PunchStep.FORDELING));
    };

    private changeAndBlurUpdates = (change: (event: any) => Partial<ISoknad>) => ({
        onChange: (event: any) => this.updateSoknadState(change(event), false),
        onBlur: (event: any) => this.updateSoknad(change(event))
    });

    private onChangeOnlyUpdate = (change: (event: any) => Partial<ISoknad>) => ({
        onChange: (event: any) => {
            this.updateSoknadState(change(event), true);
            this.updateSoknad(change(event));
        }
    });

    private handlePeriodeChange = (index: number, path: string, value: string | boolean) => {
        _.set(this.state.soknad.perioder![index], path, value);
        this.forceUpdate();
    };

    private addPeriode = () => {
        this.state.soknad.perioder!.push({});
        this.forceUpdate();
        this.setPerioder();
    };

    private removePeriode = (index: number) => {
        this.unsetPeriodeFocus();
        this.state.soknad.perioder!.splice(index, 1);
        this.forceUpdate();
        this.setPerioder();
    };

    private addArbeidsforhold(periode: IPeriode, arbeidsforhold: Arbeidsforhold) {
        if (!periode.arbeidsgivere?.[arbeidsforhold]) {
            _.set(periode, ['arbeidsgivere', arbeidsforhold], [{}]);
        } else {
            periode.arbeidsgivere![arbeidsforhold]!.push({});
        }
        this.forceUpdate();
        this.setPerioder();
    }

    private removeArbeidsforhold = (periode: IPeriode, arbeidsforhold: Arbeidsforhold, afindex: number) => {
        this.unsetPeriodeFocus();
        periode.arbeidsgivere![arbeidsforhold]!.splice(afindex, 1);
        this.forceUpdate();
        this.setPerioder();
    };

    private handleArbeidsforholdChange = (periode: IPeriode, arbeidsforhold: Arbeidsforhold, afindex: number, path: string, value: string | boolean) => {
        _.set(periode.arbeidsgivere![arbeidsforhold]![afindex], path, value);
        this.forceUpdate();
    };

    private setPerioder = () => this.updateSoknad({perioder: this.state.soknad.perioder});

    /*private handleOppholdLandChange = (index: number, land: string) => {
        this.state.soknad.medlemskap!.opphold[index].land = land;
        this.forceUpdate();
    };

    private handleOppholdFomChange = (index: number, fom: string) => {
        this.state.soknad.medlemskap!.opphold[index].periode = {...this.state.soknad.medlemskap!.opphold[index].periode, fra_og_med: fom};
        this.forceUpdate();
    };

    private handleOppholdTomChange = (index: number, tom: string) => {
        this.state.soknad.medlemskap!.opphold[index].periode = {...this.state.soknad.medlemskap!.opphold[index].periode, til_og_med: tom};
        this.forceUpdate();
    };

    private addOpphold = () => {
        if (!this.state.soknad.medlemskap) {
            this.state.soknad = {...this.state.soknad, medlemskap: {opphold: []}};
        } else if (!this.state.soknad.medlemskap.opphold) {
            this.state.soknad.medlemskap = {...this.state.soknad.medlemskap, opphold: []};
        }
        this.state.soknad.medlemskap!.opphold.push({land: '', periode: {}});
        this.forceUpdate();
        this.setOpphold();
    };

    private removeOpphold = (index: number) => {
        this.state.soknad.medlemskap!.opphold.splice(index, 1);
        this.forceUpdate();
        this.setOpphold();
    };

    private setOpphold = () => this.updateSoknad({medlemskap: {...this.props.punchFormState.mappe.innhold.medlemskap, opphold: this.state.soknad.medlemskap!.opphold}});*/

    private updateSoknad = (soknad: Partial<ISoknad>) => {
        this.setState({showStatus: true});
        return this.props.updateSoknad(
            this.props.id,
            this.props.punchState.ident,
            this.props.journalpostid,
            {...this.getSoknadFromStore(), ...soknad}
        );
    };

    private statusetikett() {

        if (!this.state.showStatus) {
            return null;
        }

        const {punchFormState} = this.props;
        const className = "statusetikett";

        if (punchFormState.isAwaitingUpdateResponse) {
            return <EtikettFokus {...{className}}>Lagrer …</EtikettFokus>;
        }
        if (!!punchFormState.updateMappeError) {
            return <EtikettAdvarsel {...{className}}>Lagring feilet</EtikettAdvarsel>;
        }
        return <EtikettSuksess {...{className}}>Lagret</EtikettSuksess>;
    }

    private setPeriodeFocus = (index: number) => this.setState({periodeInFocus: index});
    private unsetPeriodeFocus = () => this.setState({periodeInFocus: undefined});
}

const mapStateToProps = (state: RootStateType) => ({
    punchFormState: state.punchFormState,
    punchState: state.punchState
});

const mapDispatchToProps = (dispatch: any) => ({
    getMappe:                   (id: string)                => dispatch(getMappe(id)),
    resetMappeAction:           ()                          => dispatch(resetMappeAction()),
    setIdentAction:             (ident: string)             => dispatch(setIdentAction(ident)),
    setStepAction:              (step: PunchStep)           => dispatch(setStepAction(step)),
    undoChoiceOfMappeAction:    ()                          => dispatch(undoChoiceOfMappeAction()),
    updateSoknad:               (mappeid: string,
                                 norskIdent: string,
                                 journalpostid: string,
                                 soknad: Partial<ISoknad>)  => dispatch(updateSoknad(mappeid, norskIdent, journalpostid, soknad)),
    submitSoknad:               (mappeid: string,
                                 ident: string)             => dispatch(submitSoknad(mappeid, ident)),
    resetPunchFormAction:       ()                          => dispatch(resetPunchFormAction())
});

export const PunchForm = injectIntl(connect(mapStateToProps, mapDispatchToProps)(PunchFormComponent));