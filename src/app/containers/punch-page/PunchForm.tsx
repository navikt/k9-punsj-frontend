import {Periodepaneler}                                       from 'app/containers/punch-page/Periodepaneler';
import {pfArbeidstaker}                                       from 'app/containers/punch-page/pfArbeidstaker';
import {pfTilleggsinformasjon}                                from 'app/containers/punch-page/pfTilleggsinformasjon';
import {pfTilsyn}                                             from 'app/containers/punch-page/pfTilsyn';
import {JaNeiVetikke, PunchStep}                              from 'app/models/enums';
import {
    IArbeidstaker,
    IFrilanser,
    IInputError,
    IPunchFormState,
    IPunchState,
    ISelvstendigNaerinsdrivende,
    ISoknad,
    ITilleggsinformasjon,
    ITilsyn,
    ITilsynsordning,
    Periodeinfo
}                                                             from 'app/models/types';
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
import {numberToString, setHash}                              from 'app/utils';
import intlHelper                                             from 'app/utils/intlUtils';
import _                                                      from 'lodash';
import {AlertStripeFeil, AlertStripeInfo, AlertStripeSuksess} from 'nav-frontend-alertstriper';
import {EtikettAdvarsel, EtikettFokus, EtikettSuksess}        from 'nav-frontend-etiketter';
import {Knapp}                                                from 'nav-frontend-knapper';
import {Input, RadioPanelGruppe, Select, SkjemaGruppe}        from 'nav-frontend-skjema';
import NavFrontendSpinner                                     from 'nav-frontend-spinner';
import * as React                                             from 'react';
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
    tgStrings:          string[];
}

type IPunchFormProps = IPunchFormComponentProps &
                       WrappedComponentProps &
                       IPunchFormStateProps &
                       IPunchFormDispatchProps;

export class PunchFormComponent extends React.Component<IPunchFormProps, IPunchFormComponentState> {

    state: IPunchFormComponentState = {
        soknad: {
            arbeid: {
                arbeidstaker: [],
                selvstendigNæringsdrivende: [],
                frilanser: []
            },
            beredskap: [],
            nattevaak: [],
            tilsynsordning: {
                iTilsynsordning: JaNeiVetikke.NEI,
                opphold: []
            },
            spraak: 'nb',
            barn: {
                norsk_ident: '',
                foedselsdato: ''
            }
        },
        isFetched: false,
        showStatus: false,
        tgStrings: [] // Lagrer tilstedeværelsesgrad i stringformat her for å gjøre det enklere å redigere feltet
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
            const soknadFromStore = this.getSoknadFromStore();
            this.setState({soknad: {...this.state.soknad, ...soknadFromStore}, tgStrings: this.tgStrings(soknadFromStore), isFetched: true});
            this.props.setIdentAction(Object.keys(mappe.personer)[0] || '');
        }
    }

    componentWillUnmount(): void {
        this.props.resetPunchFormAction();
    }

    render() {

        const {intl, punchFormState} = this.props;
        const {soknad} = this.state;
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

        const initialArbeidstaker: Periodeinfo<IArbeidstaker> = {
            periode: {fraOgMed: '', tilOgMed: ''},
            skalJobbeProsent: 100.0,
            organisasjonsnummer: '',
            norskIdent: null
        };

        const initialSelvstendigNaeringsdrivende: Periodeinfo<ISelvstendigNaerinsdrivende> = {periode: {fraOgMed: '', tilOgMed: ''}};
        const initialFrilanser: Periodeinfo<IFrilanser> = {periode: {fraOgMed: '', tilOgMed: ''}};

        const initialTilsyn: Periodeinfo<ITilsyn> = {
            periode: {fraOgMed: '', tilOgMed: ''},
            mandag: null,
            tirsdag: null,
            onsdag: null,
            torsdag: null,
            fredag: null
        };

        const initialBeredskap: Periodeinfo<ITilleggsinformasjon> = {
            periode: {fraOgMed: '', tilOgMed: ''},
            tilleggsinformasjon: ''
        };

        const initialNattevaak: Periodeinfo<ITilleggsinformasjon> = {
            periode: {fraOgMed: '', tilOgMed: ''},
            tilleggsinformasjon: ''
        };

        const updateTgStrings = () => this.setState({tgStrings: this.tgStrings(soknad)});

        return (<>
            {this.statusetikett()}
            {this.backButton()}
            {!!punchFormState.updateMappeError && <AlertStripeFeil>{intlHelper(intl, 'skjema.feil.ikke_lagret')}</AlertStripeFeil>}
            {!!punchFormState.submitMappeError && <AlertStripeFeil>{intlHelper(intl, 'skjema.feil.ikke_sendt')}</AlertStripeFeil>}
            {!punchFormState.updateMappeError && !punchFormState.submitMappeError && (isSoknadComplete
                ? <AlertStripeSuksess>{intlHelper(intl, 'skjema.melding.komplett')}</AlertStripeSuksess>
                : <AlertStripeInfo>{intlHelper(intl, 'skjema.melding.fyll_ut')}</AlertStripeInfo>)}
            <div>
                <h2>{intlHelper(intl, 'skjema.opplysningerombarnogsoker')}</h2>
                <Select
                    name="sprak"
                    label={intlHelper(intl, 'skjema.spraak')}
                    className="bold-label"
                    value={soknad.spraak || 'nb'}
                    {...this.onChangeOnlyUpdate(event => ({spraak: event.target.value}))}
                    feil={this.getErrorMessage('spraak')}
                >
                    <option value='nb'>{intlHelper(intl, 'locale.nb')}</option>
                    <option value='nn'>{intlHelper(intl, 'locale.nn')}</option>
                </Select>
                <SkjemaGruppe feil={this.getErrorMessage('barn')}>
                    <Input
                        id="barn-ident"
                        label={intlHelper(intl, 'skjema.barn.ident')}
                        className="bold-label"
                        value={_.get(soknad, 'barn.norsk_ident', '')}
                        {...this.changeAndBlurUpdates(event => ({barn: {...soknad.barn, norsk_ident: event.target.value}}))}
                        feil={this.getErrorMessage('barn.norsk_ident')}
                    />
                    <Input
                        id="barn-fdato"
                        type="date"
                        label={intlHelper(intl, 'skjema.barn.foedselsdato')}
                        className="bold-label"
                        value={_.get(soknad, 'barn.foedselsdato', '')}
                        {...this.changeAndBlurUpdates(event => ({barn: {...soknad.barn, foedselsdato: event.target.value}}))}
                        feil={this.getErrorMessage('barn.foedselsdato')}
                    />
                </SkjemaGruppe>
                <h2>{intlHelper(intl, 'skjema.arbeid.overskrift')}</h2>
                <h3>{intlHelper(intl, 'skjema.arbeid.arbeidstaker.overskrift')}</h3>
                <Periodepaneler
                    intl={intl}
                    periods={soknad.arbeid!.arbeidstaker!}
                    component={pfArbeidstaker(this.state, tgStrings => this.setState({tgStrings}), this.tgStrings)}
                    panelid={i => `arbeidstakerpanel_${i}`}
                    initialPeriodeinfo={initialArbeidstaker}
                    editSoknad={arbeidstaker => this.updateSoknad({arbeid: {...soknad.arbeid, arbeidstaker}})}
                    editSoknadState={(arbeidstaker, showStatus) => this.updateSoknadState({arbeid: {...soknad.arbeid, arbeidstaker}}, showStatus)}
                    textLeggTil="skjema.arbeid.arbeidstaker.leggtilperiode"
                    textFjern="skjema.arbeid.arbeidstaker.fjernperiode"
                    panelClassName="arbeidstakerpanel"
                    getErrorMessage={this.getErrorMessage}
                    feilkodeprefiks={'arbeid.arbeidstaker'}
                    onAdd={updateTgStrings}
                    onRemove={updateTgStrings}
                />
                <h3>{intlHelper(intl, 'skjema.arbeid.selvstendignaeringsdrivende.overskrift')}</h3>
                <Periodepaneler
                    intl={intl}
                    periods={soknad.arbeid!.selvstendigNæringsdrivende!}
                    panelid={i => `selvstendignaeringsdrivendepanel_${i}`}
                    initialPeriodeinfo={initialSelvstendigNaeringsdrivende}
                    editSoknad={selvstendigNæringsdrivende => this.updateSoknad({arbeid: {...soknad.arbeid, selvstendigNæringsdrivende}})}
                    editSoknadState={(selvstendigNæringsdrivende, showStatus) => this.updateSoknadState({arbeid: {...soknad.arbeid, selvstendigNæringsdrivende}}, showStatus)}
                    textLeggTil="skjema.arbeid.selvstendignaeringsdrivende.leggtilperiode"
                    textFjern="skjema.arbeid.selvstendignaeringsdrivende.fjernperiode"
                    panelClassName="selvstendignaeringsdrivendepanel"
                    getErrorMessage={this.getErrorMessage}
                    feilkodeprefiks={'arbeid.selvstendigNæringsdrivende'}
                />
                <h3>{intlHelper(intl, 'skjema.arbeid.frilanser.overskrift')}</h3>
                <Periodepaneler
                    intl={intl}
                    periods={soknad.arbeid!.frilanser!}
                    panelid={i => `frilanserpanel_${i}`}
                    initialPeriodeinfo={initialFrilanser}
                    editSoknad={frilanser => this.updateSoknad({arbeid: {...soknad.arbeid, frilanser}})}
                    editSoknadState={(frilanser, showStatus) => this.updateSoknadState({arbeid: {...soknad.arbeid, frilanser}}, showStatus)}
                    textLeggTil="skjema.arbeid.frilanser.leggtilperiode"
                    textFjern="skjema.arbeid.frilanser.fjernperiode"
                    panelClassName="frilanserpanel"
                    getErrorMessage={this.getErrorMessage}
                    feilkodeprefiks={'arbeid.frilanser'}
                />
                <h2>{intlHelper(intl, 'skjema.beredskap.overskrift')}</h2>
                <Periodepaneler
                    intl={intl}
                    periods={soknad.beredskap!}
                    component={pfTilleggsinformasjon('beredskap')}
                    panelid={i => `beredskapspanel_${i}`}
                    initialPeriodeinfo={initialBeredskap}
                    editSoknad={beredskap => this.updateSoknad({beredskap})}
                    editSoknadState={(beredskap, showStatus) => this.updateSoknadState({beredskap}, showStatus)}
                    textLeggTil="skjema.beredskap.leggtilperiode"
                    textFjern="skjema.beredskap.fjernperiode"
                    panelClassName="beredskapspanel"
                    getErrorMessage={this.getErrorMessage}
                    feilkodeprefiks={'beredskap'}
                />
                <h2>{intlHelper(intl, 'skjema.nattevaak.overskrift')}</h2>
                <Periodepaneler
                    intl={intl}
                    periods={soknad.nattevaak!}
                    component={pfTilleggsinformasjon('nattevaak')}
                    panelid={i => `nattevaakspanel_${i}`}
                    initialPeriodeinfo={initialNattevaak}
                    editSoknad={nattevaak => this.updateSoknad({nattevaak})}
                    editSoknadState={(nattevaak, showStatus) => this.updateSoknadState({nattevaak}, showStatus)}
                    textLeggTil="skjema.nattevaak.leggtilperiode"
                    textFjern="skjema.nattevaak.fjernperiode"
                    panelClassName="nattevaakspanel"
                    getErrorMessage={this.getErrorMessage}
                    feilkodeprefiks={'nattevaak'}
                />
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
                <h2>{intlHelper(intl, 'skjema.tilsyn.overskrift')}</h2>
                <SkjemaGruppe feil={this.getErrorMessage('tilsynsordning')} className="tilsynsordning">
                    <SkjemaGruppe feil={this.getErrorMessage('tilsynsordning.iTilsynsordning')} className="janeivetikke">
                        <RadioPanelGruppe
                            className="horizontalRadios"
                            radios={Object.values(JaNeiVetikke).map(jnv => ({label: intlHelper(intl, jnv), value: jnv}))}
                            name="tilsynjaneivetikke"
                            legend={intlHelper(intl, 'skjema.tilsyn.janeivetikke')}
                            onChange={event => this.updateTilsynsordning((event.target as HTMLInputElement).value as JaNeiVetikke)}
                            checked={soknad.tilsynsordning!.iTilsynsordning}
                        />
                    </SkjemaGruppe>
                    {soknad.tilsynsordning!.iTilsynsordning === JaNeiVetikke.JA && <Periodepaneler
                        intl={intl}
                        periods={soknad.tilsynsordning!.opphold!}
                        component={pfTilsyn}
                        panelid={i => `tilsynpanel_${i}`}
                        initialPeriodeinfo={initialTilsyn}
                        editSoknad={opphold => this.updateSoknad({tilsynsordning: {iTilsynsordning: JaNeiVetikke.JA, opphold}})}
                        editSoknadState={(opphold, showStatus) => this.updateSoknadState({tilsynsordning: {iTilsynsordning: JaNeiVetikke.JA, opphold}}, showStatus)}
                        textLeggTil="skjema.tilsyn.leggtilperiode"
                        textFjern="skjema.tilsyn.fjernperiode"
                        panelClassName="tilsynpanel"
                        getErrorMessage={this.getErrorMessage}
                        feilkodeprefiks={'tilsynsordning.opphold'}
                        minstEn={true}
                    />}
                </SkjemaGruppe>
                <p className="sendknapp-wrapper"><Knapp
                    onClick={() => this.props.submitSoknad(this.props.id, this.props.punchState.ident)}
                    disabled={!isSoknadComplete}
                >{intlHelper(intl, 'skjema.knapp.send')}</Knapp></p>
            </div>
        </>);
    }

    private tgStrings = (soknad: ISoknad) => {
        // Genererer liste med tilsteværelsesgrader i stringformat fra arbeidstakerforhold
        const tgStrings: string[] = [];
        soknad.arbeid
              ?.arbeidstaker
              ?.forEach((a: IArbeidstaker) => tgStrings.push(numberToString(this.props.intl, a.skalJobbeProsent || 100, 1)));
        return tgStrings;
    };

    private updateTilsynsordning(jaNeiVetikke: JaNeiVetikke) {
        const tilsynsordning: ITilsynsordning = {...this.state.soknad.tilsynsordning, iTilsynsordning: jaNeiVetikke};
        if (jaNeiVetikke === JaNeiVetikke.JA && tilsynsordning.opphold!.length === 0) {
            tilsynsordning.opphold!.push({periode: {}});
        }
        this.updateSoknadState({tilsynsordning}, true);
        this.updateSoknad({tilsynsordning});
    }

    private backButton() {
        return <p><Knapp onClick={this.handleBackButtonClick}>
            {intlHelper(this.props.intl, 'skjema.knapp.tilbake')}
        </Knapp></p>;
    }

    private getSoknadFromStore = () => {
        const personlig = this.props.punchFormState.mappe?.personer;
        return personlig?.[Object.keys(personlig)[0]]?.soeknad;
    };

    private getManglerFromStore = () => {
        const personlig = this.props.punchFormState.mappe?.personer;
        return personlig?.[Object.keys(personlig)[0]]?.mangler;
    };

    private getErrorMessage = (attribute: string) => {
        const errorMsg = this.getManglerFromStore()?.filter((m: IInputError) => m.attributt === attribute)?.[0]?.melding;
        return !!errorMsg ? {feilmelding: intlHelper(
            this.props.intl,
            `skjema.feil.${attribute}.${errorMsg}`.replace(/\[\d+]/, '[]')
        )} : undefined;
    };

    private updateSoknadState(soknad: Partial<ISoknad>, showStatus?: boolean) {
        this.setState({soknad: {...this.state.soknad, ...soknad}, showStatus: !!showStatus});
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