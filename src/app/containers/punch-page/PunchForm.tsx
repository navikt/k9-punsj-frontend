import {PersonBox}                                     from 'app/components/person-box/PersonBox';
import {Periodepaneler}                                from 'app/containers/punch-page/Periodepaneler';
import {pfArbeidstaker}                                from 'app/containers/punch-page/pfArbeidstaker';
import {pfTilleggsinformasjon}                         from 'app/containers/punch-page/pfTilleggsinformasjon';
import {pfTilsyn}                                      from 'app/containers/punch-page/pfTilsyn';
import {JaNeiVetikke, PunchStep}                       from 'app/models/enums';
import {
    Arbeidstaker,
    DobbelSoknad,
    IDobbelSoknad,
    IFrilanser,
    IInputError,
    IPeriode,
    IPunchFormState,
    IPunchState,
    ISelvstendigNaerinsdrivende,
    ISoknad,
    ISoknadFelles,
    ISoknadIndividuelt,
    ITilsyn,
    ITilsynsordning,
    Mappe,
    Periodeinfo,
    SoknadFelles,
    SoknadIndividuelt,
    Tilleggsinformasjon,
    Tilsyn
}                                                      from 'app/models/types';
import {
    getMappe,
    resetMappeAction,
    resetPunchFormAction,
    setIdentAction,
    setStepAction,
    submitSoknad,
    undoChoiceOfMappeAction,
    updateSoknad,
    updateSoknader
}                                                      from 'app/state/actions';
import {RootStateType}                                 from 'app/state/RootState';
import {setHash}                                       from 'app/utils';
import intlHelper                                      from 'app/utils/intlUtils';
import {AlertStripeFeil, AlertStripeSuksess}           from 'nav-frontend-alertstriper';
import {EtikettAdvarsel, EtikettFokus, EtikettSuksess} from 'nav-frontend-etiketter';
import {Knapp}                                         from 'nav-frontend-knapper';
import {Input, RadioPanelGruppe, Select, SkjemaGruppe} from 'nav-frontend-skjema';
import NavFrontendSpinner                              from 'nav-frontend-spinner';
import * as React                                      from 'react';
import {Col, Container, Row}                           from 'react-bootstrap';
import {injectIntl, WrappedComponentProps}             from 'react-intl';
import {connect}                                       from 'react-redux';

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
    updateSoknader:             typeof updateSoknader;
    submitSoknad:               typeof submitSoknad;
    resetPunchFormAction:       typeof resetPunchFormAction;
}

export interface IPunchFormComponentState {
    dobbelSoknad:       IDobbelSoknad;
    isFetched:          boolean;
    showStatus:         boolean;
    tgStrings1:         string[];
    tgStrings2:         string[];
}

type IPunchFormProps = IPunchFormComponentProps &
                       WrappedComponentProps &
                       IPunchFormStateProps &
                       IPunchFormDispatchProps;

export class PunchFormComponent extends React.Component<IPunchFormProps, IPunchFormComponentState> {

    state: IPunchFormComponentState = {
        dobbelSoknad: {
            felles: {
                spraak: 'nb',
                barn: {},
                beredskap: [],
                nattevaak: [],
                tilsynsordning: {}
            },
            soker1: {
                perioder: [],
                arbeid: {}
            },
            soker2: null
        },
        isFetched: false,
        showStatus: false,
        tgStrings1: [], // Lagrer tilstedeværelsesgrad i stringformat her for å gjøre det enklere å redigere feltet
        tgStrings2: []
    };

    private initialTilsyn: Periodeinfo<ITilsyn> = {
        periode: {fraOgMed: '', tilOgMed: ''},
        mandag: null,
        tirsdag: null,
        onsdag: null,
        torsdag: null,
        fredag: null
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
            const dobbelSoknadFromStore = this.getDobbelSoknadFromStore();
            this.setState({
                dobbelSoknad: dobbelSoknadFromStore,
                tgStrings1: this.tgStrings(dobbelSoknadFromStore.soker1),
                tgStrings2: this.tgStrings(dobbelSoknadFromStore.soker2),
                isFetched: true
            });
            this.props.setIdentAction(Object.keys(mappe.personer)[0] || '', Object.keys(mappe.personer)[1] || null);
        }
    }

    componentWillUnmount(): void {
        this.props.resetPunchFormAction();
    }

    render() {

        const {intl, punchFormState, punchState} = this.props;
        const soknad = new DobbelSoknad(
            new SoknadFelles(this.state.dobbelSoknad.felles),
            new SoknadIndividuelt(this.state.dobbelSoknad.soker1),
            !!this.state.dobbelSoknad.soker2 ? new SoknadIndividuelt(this.state.dobbelSoknad.soker2) : undefined
        );
        const {soknad1, soknad2} = soknad;
        const {felles, soker1, soker2} = soknad;
        const isSoknadComplete = !!this.getManglerFromStore(1) && !this.getManglerFromStore(1).length && !!this.getManglerFromStore(2) && !this.getManglerFromStore(2).length;

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

        const initialPeriode: IPeriode = {fraOgMed: '', tilOgMed: ''};

        const initialArbeidstaker = new Arbeidstaker({
            periode: initialPeriode,
            skalJobbeProsent: 100.0,
            organisasjonsnummer: '',
            norskIdent: null
        });

        const initialSelvstendigNaeringsdrivende: Periodeinfo<ISelvstendigNaerinsdrivende> = {periode: {fraOgMed: '', tilOgMed: ''}};
        const initialFrilanser: Periodeinfo<IFrilanser> = {periode: {fraOgMed: '', tilOgMed: ''}};

        const initialTilsyn = new Tilsyn({
            periode: initialPeriode,
            mandag: null,
            tirsdag: null,
            onsdag: null,
            torsdag: null,
            fredag: null
        });

        const initialBeredskap = new Tilleggsinformasjon({
            periode: initialPeriode,
            tilleggsinformasjon: ''
        });

        const initialNattevaak = new Tilleggsinformasjon({
            periode: initialPeriode,
            tilleggsinformasjon: ''
        });

/*        const perioder = (nr: 1 | 2) => <PeriodInput
            periode={(nr === 1 ? soker1 : soker2!).periode}
            {...{intl}}
            className="soknadsperiode"
            onChange={periode => this.updateIndividuellSoknadState({periode}, nr)}
            onBlur={periode => this.updateSoknadIndividuelt({periode}, nr)}
            errorMessage={this.getErrorMessage('periode')}
            errorMessageFom={this.getErrorMessage('periode.fraOgMed', nr)}
            errorMessageTom={this.getErrorMessage('periode.tilOgMed', nr)}
        />;*/

        const soknadsperioder = (nr: 1 | 2) => <Periodepaneler
            intl={intl}
            periods={(nr === 1 ? soker1 : soker2!).perioder.map(periode => ({periode}))}
            panelid={i => `soknadsperiodepanel_${i}`}
            initialPeriodeinfo={{periode: initialPeriode}}
            editSoknad={perioder => this.updateSoknadIndividuelt({perioder: perioder.map(p => p.periode as IPeriode)}, nr)}
            editSoknadState={(perioder, showStatus) => this.updateIndividuellSoknadState({perioder: perioder.map(p => p.periode as IPeriode)}, nr, showStatus)}
            getErrorMessage={code => this.getErrorMessage(code.replace(/^perioder\[\d]\.periode/, prefix => prefix.replace(/\.periode$/, '')), nr)}
            feilkodeprefiks={'perioder'}
            minstEn={true}
        />;

        const arbeidsperioder = (nr: 1 | 2) => {

            const soker = nr === 1 || !soker2 ? soker1 : soker2;
            const updateTgStrings = () => this.setState({tgStrings1: this.tgStrings(soker1), tgStrings2: soker2 ? this.tgStrings(soker2) : []});
            const {arbeid} = soker;
            const errorMessageFunction = (code: string) => this.getErrorMessage(code, nr);

            const arbeidstakerperioder = (harOverskrift?: boolean) => <Periodepaneler
                intl={intl}
                periods={arbeid.arbeidstaker}
                component={pfArbeidstaker(this.state.tgStrings1, tgStrings1 => this.setState({tgStrings1}), () => this.tgStrings(soker), nr)}
                panelid={i => `arbeidstakerpanel_${i}`}
                initialPeriodeinfo={initialArbeidstaker}
                editSoknad={arbeidstaker => this.updateSoknadIndividuelt({arbeid: {...arbeid, arbeidstaker}}, nr)}
                editSoknadState={(arbeidstaker, showStatus) => this.updateIndividuellSoknadState({
                    arbeid: {
                        ...arbeid,
                        arbeidstaker
                    }
                }, nr, showStatus)}
                textLeggTil={harOverskrift ? 'skjema.arbeid.leggtilperiode' : 'skjema.arbeid.arbeidstaker.leggtilperiode'}
                textFjern="skjema.arbeid.arbeidstaker.fjernperiode"
                panelClassName="arbeidstakerpanel"
                getErrorMessage={errorMessageFunction}
                feilkodeprefiks={'arbeid.arbeidstaker'}
                onAdd={updateTgStrings}
                onRemove={updateTgStrings}
            />;

            const selvstendigperioder = (harOverskrift?: boolean) => <Periodepaneler
                intl={intl}
                periods={arbeid.selvstendigNaeringsdrivende}
                panelid={i => `selvstendignaeringsdrivendepanel_${i}`}
                initialPeriodeinfo={initialSelvstendigNaeringsdrivende}
                editSoknad={selvstendigNaeringsdrivende => this.updateSoknadIndividuelt({
                    arbeid: {
                        ...arbeid,
                        selvstendigNaeringsdrivende
                    }
                }, nr)}
                editSoknadState={(selvstendigNaeringsdrivende, showStatus) => this.updateIndividuellSoknadState({
                    arbeid: {
                        ...arbeid,
                        selvstendigNaeringsdrivende
                    }
                }, nr, showStatus)}
                textLeggTil={harOverskrift ? 'skjema.arbeid.leggtilperiode' : 'skjema.arbeid.selvstendignaeringsdrivende.leggtilperiode'}
                textFjern="skjema.arbeid.selvstendignaeringsdrivende.fjernperiode"
                panelClassName="selvstendignaeringsdrivendepanel"
                getErrorMessage={errorMessageFunction}
                feilkodeprefiks={'arbeid.selvstendigNaeringsdrivende'}
            />;

            const frilanserperioder = (harOverskrift?: boolean) => <Periodepaneler
                intl={intl}
                periods={arbeid.frilanser}
                panelid={i => `frilanserpanel_${i}`}
                initialPeriodeinfo={initialFrilanser}
                editSoknad={frilanser => this.updateSoknadIndividuelt({arbeid: {...arbeid, frilanser}}, nr)}
                editSoknadState={(frilanser, showStatus) => this.updateIndividuellSoknadState({
                    arbeid: {
                        ...arbeid,
                        frilanser
                    }
                }, nr, showStatus)}
                textLeggTil={harOverskrift ? 'skjema.arbeid.leggtilperiode' : 'skjema.arbeid.frilanser.leggtilperiode'}
                textFjern="skjema.arbeid.frilanser.fjernperiode"
                panelClassName="frilanserpanel"
                getErrorMessage={errorMessageFunction}
                feilkodeprefiks={'arbeid.frilanser'}
            />;

            const antallArbeidsperioder = (nr === 1 ? soknad1 : soknad2!).getNumberOfWorkPeriods();

            const visning = () => {
                if (!antallArbeidsperioder) {
                    return <Container className="arbeidsknapper"><Row>
                        <Col>{arbeidstakerperioder()}</Col>
                        <Col>{selvstendigperioder()}</Col>
                        <Col>{frilanserperioder()}</Col>
                    </Row></Container>;
                } else if (arbeid.arbeidstaker.length === antallArbeidsperioder) {
                    return <>
                        <h3>{intlHelper(intl, 'skjema.arbeid.arbeidstaker.overskrift')}</h3>
                        {arbeidstakerperioder(true)}
                        <h3>{intlHelper(intl, 'skjema.arbeid.andrearbeidstyper.overskrift')}</h3>
                        <Container className="arbeidsknapper"><Row>
                            <Col>{selvstendigperioder()}</Col>
                            <Col>{frilanserperioder()}</Col>
                        </Row></Container>
                    </>;
                } else if (arbeid.selvstendigNaeringsdrivende.length === antallArbeidsperioder) {
                    return <>
                        <h3>{intlHelper(intl, 'skjema.arbeid.selvstendignaeringsdrivende.overskrift')}</h3>
                        {selvstendigperioder(true)}
                        <h3>{intlHelper(intl, 'skjema.arbeid.andrearbeidstyper.overskrift')}</h3>
                        <Container className="arbeidsknapper"><Row>
                            <Col>{arbeidstakerperioder()}</Col>
                            <Col>{frilanserperioder()}</Col>
                        </Row></Container>
                    </>;
                } else if (arbeid.frilanser.length === antallArbeidsperioder) {
                    return <>
                        <h3>{intlHelper(intl, 'skjema.arbeid.frilanser.overskrift')}</h3>
                        {frilanserperioder(true)}
                        <h3>{intlHelper(intl, 'skjema.arbeid.andrearbeidstyper.overskrift')}</h3>
                        <Container className="arbeidsknapper"><Row>
                            <Col>{arbeidstakerperioder()}</Col>
                            <Col>{selvstendigperioder()}</Col>
                        </Row></Container>
                    </>;
                } else {
                    return <>
                        <h3>{intlHelper(intl, 'skjema.arbeid.arbeidstaker.overskrift')}</h3>
                        {arbeidstakerperioder(true)}
                        <h3>{intlHelper(intl, 'skjema.arbeid.selvstendignaeringsdrivende.overskrift')}</h3>
                        {selvstendigperioder(true)}
                        <h3>{intlHelper(intl, 'skjema.arbeid.frilanser.overskrift')}</h3>
                        {frilanserperioder(true)}
                    </>;
                }
            };

            return visning();
        };

        const beredskapperioder = <Periodepaneler
            intl={intl}
            periods={felles.beredskap}
            component={pfTilleggsinformasjon('beredskap')}
            panelid={i => `beredskapspanel_${i}`}
            initialPeriodeinfo={initialBeredskap}
            editSoknad={beredskap => this.updateSoknadFelles({beredskap})}
            editSoknadState={(beredskap, showStatus) => this.updateFellesSoknadState({beredskap}, showStatus)}
            textLeggTil="skjema.beredskap.leggtilperiode"
            textFjern="skjema.beredskap.fjernperiode"
            panelClassName="beredskapspanel"
            getErrorMessage={this.getErrorMessage}
            feilkodeprefiks={'beredskap'}
        />;

        const nattevaakperioder = <Periodepaneler
            intl={intl}
            periods={felles.nattevaak}
            component={pfTilleggsinformasjon('nattevaak')}
            panelid={i => `nattevaakspanel_${i}`}
            initialPeriodeinfo={initialNattevaak}
            editSoknad={nattevaak => this.updateSoknadFelles({nattevaak})}
            editSoknadState={(nattevaak, showStatus) => this.updateFellesSoknadState({nattevaak}, showStatus)}
            textLeggTil="skjema.nattevaak.leggtilperiode"
            textFjern="skjema.nattevaak.fjernperiode"
            panelClassName="nattevaakspanel"
            getErrorMessage={this.getErrorMessage}
            feilkodeprefiks={'nattevaak'}
        />;

        const dobbel = (component: (nr: 1 | 2) => React.ReactElement) => {
            return soker2 ? <div className="dobbel">
                <div className="dobbel1">
                    <PersonBox ident={punchState.ident1} header={intlHelper(intl, 'soker1')}/>
                    {component(1)}
                </div>
                <div className="dobbel2">
                    <PersonBox ident={punchState.ident2!} header={intlHelper(intl, 'soker2')}/>
                    {component(2)}
                </div>
            </div> : component(1)
        };

        return (<>
            {this.statusetikett()}
            {this.backButton()}
            {!!punchFormState.updateMappeError && <AlertStripeFeil>{intlHelper(intl, 'skjema.feil.ikke_lagret')}</AlertStripeFeil>}
            {!!punchFormState.submitMappeError && <AlertStripeFeil>{intlHelper(intl, 'skjema.feil.ikke_sendt')}</AlertStripeFeil>}
            {!punchFormState.updateMappeError && !punchFormState.submitMappeError && (isSoknadComplete
                ? <AlertStripeSuksess>{intlHelper(intl, 'skjema.melding.komplett')}</AlertStripeSuksess>
                : <></>/*<AlertStripeInfo>{intlHelper(intl, 'skjema.melding.fyll_ut')}</AlertStripeInfo>*/)}
            <SkjemaGruppe feil={this.getErrorMessage('')}>
                <h2>{intlHelper(intl, 'skjema.opplysningerombarnogsoker')}</h2>
                <Select
                    name="sprak"
                    label={intlHelper(intl, 'skjema.spraak')}
                    className="bold-label"
                    value={felles.spraak}
                    {...this.onChangeOnlyUpdateFelles(event => ({spraak: event.target.value}))}
                    feil={this.getErrorMessage('spraak')}
                >
                    <option value='nb'>{intlHelper(intl, 'locale.nb')}</option>
                    <option value='nn'>{intlHelper(intl, 'locale.nn')}</option>
                </Select>
                <SkjemaGruppe feil={this.getErrorMessage('barn')} className="inputs-barn">
                    <Input
                        id="barn-ident"
                        label={intlHelper(intl, 'skjema.barn.ident')}
                        className="bold-label"
                        value={felles.barn.norskIdent}
                        {...this.changeAndBlurUpdatesFelles(event => ({barn: {...felles.barn.values(), norskIdent: event.target.value}}))}
                        feil={this.getErrorMessage('barn.norskIdent')}
                    />
                    <Input
                        id="barn-fdato"
                        type="date"
                        label={intlHelper(intl, 'skjema.barn.foedselsdato')}
                        className="bold-label"
                        value={felles.barn.foedselsdato}
                        {...this.changeAndBlurUpdatesFelles(event => ({barn: {...felles.barn.values(), foedselsdato: event.target.value}}))}
                        feil={this.getErrorMessage('barn.foedselsdato')}
                    />
                </SkjemaGruppe>
                <h2>{intlHelper(intl, 'skjema.periode')}</h2>
                {dobbel(soknadsperioder)}
                <h2>{intlHelper(intl, 'skjema.arbeid.overskrift')}</h2>
                {dobbel(arbeidsperioder)}
                <h2>{intlHelper(intl, 'skjema.tilsyn.overskrift')}</h2>
                <SkjemaGruppe feil={this.getErrorMessage('tilsynsordning')} className="tilsynsordning">
                    <SkjemaGruppe feil={this.getErrorMessage('tilsynsordning.iTilsynsordning')} className="janeivetikke">
                        <RadioPanelGruppe
                            className="horizontalRadios"
                            radios={Object.values(JaNeiVetikke).map(jnv => ({label: intlHelper(intl, jnv), value: jnv}))}
                            name="tilsynjaneivetikke"
                            legend={intlHelper(intl, 'skjema.tilsyn.janeivetikke')}
                            onChange={event => this.updateTilsynsordning((event.target as HTMLInputElement).value as JaNeiVetikke)}
                            checked={felles.tilsynsordning.iTilsynsordning}
                        />
                    </SkjemaGruppe>
                    {felles.tilsynsordning.iTilsynsordning !== JaNeiVetikke.NEI && <Periodepaneler
                        intl={intl}
                        periods={felles.tilsynsordning.opphold!}
                        component={pfTilsyn}
                        panelid={i => `tilsynpanel_${i}`}
                        initialPeriodeinfo={initialTilsyn}
                        editSoknad={opphold => this.updateSoknadFelles({tilsynsordning: {...felles.tilsynsordning, opphold}})}
                        editSoknadState={(opphold, showStatus) => this.updateFellesSoknadState({tilsynsordning: {...felles.tilsynsordning, opphold}}, showStatus)}
                        textLeggTil="skjema.tilsyn.leggtilperiode"
                        textFjern="skjema.tilsyn.fjernperiode"
                        panelClassName="tilsynpanel"
                        getErrorMessage={this.getErrorMessage}
                        feilkodeprefiks={'tilsynsordning.opphold'}
                        minstEn={felles.tilsynsordning.iTilsynsordning === JaNeiVetikke.JA}
                    />}
                </SkjemaGruppe>
                {felles.tilsynsordning.iTilsynsordning !== JaNeiVetikke.NEI && <>
                    <h2>{intlHelper(intl, 'skjema.beredskap.overskrift')}</h2>
                    {beredskapperioder}
                    <h2>{intlHelper(intl, 'skjema.nattevaak.overskrift')}</h2>
                    {nattevaakperioder}
                </>}
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
                    onClick={() => this.props.submitSoknad(this.props.id, this.props.punchState.ident1)}
                    disabled={!isSoknadComplete}
                >{intlHelper(intl, 'skjema.knapp.send')}</Knapp></p>
            </SkjemaGruppe>
        </>);
    }

    private tgStrings = (soknad: SoknadIndividuelt | null) => {
        // Genererer liste med tilsteværelsesgrader i stringformat fra arbeidstakerforhold
        return soknad ? soknad.arbeid.generateTgStrings(this.props.intl) : [];
    };

    private updateTilsynsordning(jaNeiVetikke: JaNeiVetikke) {
        const tilsynsordning: ITilsynsordning = {...this.state.dobbelSoknad.felles.tilsynsordning, iTilsynsordning: jaNeiVetikke};
        if (jaNeiVetikke === JaNeiVetikke.JA && tilsynsordning.opphold!.length === 0) {
            tilsynsordning.opphold!.push(this.initialTilsyn);
        }
        this.updateFellesSoknadState({tilsynsordning}, true);
        this.updateSoknadFelles({tilsynsordning});
    }

    private backButton() {
        return <p><Knapp onClick={this.handleBackButtonClick}>
            {intlHelper(this.props.intl, 'skjema.knapp.tilbake')}
        </Knapp></p>;
    }

    private getDobbelSoknadFromStore = () => {
        const mappe = new Mappe(this.props.punchFormState.mappe || {});
        return mappe.genererDobbelSoknad();
    };

    private getManglerFromStore = (nr?: 1 | 2) => {
        const {ident1, ident2} = this.props.punchState;
        const ident = nr === 2 && ident2 ? ident2 : ident1;
        const personlig = this.props.punchFormState.mappe?.personer;
        return personlig?.[ident]?.mangler;
    };

    private getErrorMessage = (attribute: string, nr?: 1 | 2) => {
        const errorMsg = this.getManglerFromStore(nr)?.filter((m: IInputError) => m.attributt === attribute)?.[0]?.melding;
        return !!errorMsg ? {feilmelding: intlHelper(
            this.props.intl,
            `skjema.feil.${attribute}.${errorMsg}`
                .replace(/\[\d+]/, '[]')
                .replace(/^skjema\.feil\..+\.fraOgMed\.MAA_SETTES$/, 'skjema.feil.fraOgMed.MAA_SETTES')
                .replace(/^skjema\.feil\..+\.fraOgMed\.MAA_VAERE_FOER_TIL_OG_MED$/, 'skjema.feil.fraOgMed.MAA_VAERE_FOER_TIL_OG_MED')
                .replace(/^skjema\.feil\..+\.tilOgMed\.MAA_SETTES$/, 'skjema.feil.tilOgMed.MAA_SETTES')
        )} : undefined;
    };

    private updateFellesSoknadState(fellesSoknad: Partial<ISoknadFelles>, showStatus?: boolean) {
        this.setState({dobbelSoknad: {
            ...this.state.dobbelSoknad,
            felles: {...this.state.dobbelSoknad.felles, ...fellesSoknad}
        }, showStatus: !!showStatus});
    }

    private updateIndividuellSoknadState(individuellSoknad: Partial<ISoknadIndividuelt>, nr: 1 | 2, showStatus?: boolean) {
        this.setState({dobbelSoknad: {
            ...this.state.dobbelSoknad,
            [`soker${nr}`]: {...this.state.dobbelSoknad[`soker${nr}`], ...individuellSoknad}
        }, showStatus: !!showStatus});
    }

    private handleBackButtonClick = () => {
        const {punchState, getPunchPath} = this.props;
        const {ident1, ident2} = punchState;
        this.props.resetMappeAction();
        this.props.undoChoiceOfMappeAction();
        setHash(getPunchPath(PunchStep.CHOOSE_SOKNAD, {ident: !!ident2 ? `${ident1}&${ident2}` : ident1}));
    };

    private handleStartButtonClick = () => {
        this.props.resetPunchFormAction();
        setHash(this.props.getPunchPath(PunchStep.FORDELING));
    };

    private changeAndBlurUpdatesFelles = (change: (event: any) => Partial<ISoknadFelles>) => ({
        onChange: (event: any) => this.updateFellesSoknadState(change(event), false),
        onBlur: (event: any) => this.updateSoknadFelles(change(event))
    });

    private onChangeOnlyUpdateFelles = (change: (event: any) => Partial<ISoknadFelles>) => ({
        onChange: (event: any) => {
            this.updateFellesSoknadState(change(event), true);
            this.updateSoknadFelles(change(event));
        }
    });

    private onChangeOnlyUpdateIndividuelt = (change: (event: any) => Partial<ISoknadIndividuelt>, nr: 1 |2) => ({
        onChange: (event: any) => {
            this.updateIndividuellSoknadState(change(event), nr, true);
            this.updateSoknadIndividuelt(change(event), nr);
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

    private updateSoknadIndividuelt = (soknad: Partial<ISoknadIndividuelt>, nr: 1 | 2) => {
        this.setState({showStatus: true});
        return this.props.updateSoknad(
            this.props.id,
            this.props.punchState[`ident${nr}`],
            this.props.journalpostid,
            {...this.getDobbelSoknadFromStore().soknad(nr)!.values(), ...soknad}
        );
    };

    private updateSoknadFelles = (soknad: Partial<ISoknadFelles>) => {
        this.setState({showStatus: true});
        return this.props.updateSoknader(
            this.props.id,
            this.props.punchState.ident1,
            this.props.punchState.ident2,
            this.props.journalpostid,
            {...this.getDobbelSoknadFromStore().soknad1.values(), ...soknad},
            this.props.punchState.ident2 ? {...this.getDobbelSoknadFromStore().soknad2!.values(), ...soknad} : null
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
    getMappe:                   (id: string)                        => dispatch(getMappe(id)),
    resetMappeAction:           ()                                  => dispatch(resetMappeAction()),
    setIdentAction:             (ident1: string,
                                 ident2: string | null)             => dispatch(setIdentAction(ident1, ident2)),
    setStepAction:              (step: PunchStep)                   => dispatch(setStepAction(step)),
    undoChoiceOfMappeAction:    ()                                  => dispatch(undoChoiceOfMappeAction()),
    updateSoknad:               (mappeid: string,
                                 norskIdent: string,
                                 journalpostid: string,
                                 soknad: Partial<ISoknad>)          => dispatch(updateSoknad(mappeid, norskIdent, journalpostid, soknad)),
    updateSoknader:             (mappeid: string,
                                 norskIdent1: string,
                                 norskIdent2: string | null,
                                 journalpostid: string,
                                 soknad1: Partial<ISoknad>,
                                 soknad2: Partial<ISoknad> | null)  => dispatch(updateSoknader(mappeid, norskIdent1, norskIdent2, journalpostid, soknad1, soknad2)),
    submitSoknad:               (mappeid: string,
                                 ident: string)                     => dispatch(submitSoknad(mappeid, ident)),
    resetPunchFormAction:       ()                                  => dispatch(resetPunchFormAction())
});

export const PunchForm = injectIntl(connect(mapStateToProps, mapDispatchToProps)(PunchFormComponent));