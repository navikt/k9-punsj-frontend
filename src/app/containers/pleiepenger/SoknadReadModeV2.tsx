import {JaNeiVetikke, TimeFormat}                                    from 'app/models/enums';
import {datetime}                                                    from 'app/utils';
import intlHelper                                                    from 'app/utils/intlUtils';
import classNames                                                    from 'classnames';
import * as React                                                    from 'react';
import {Col, Container, Row}                                         from 'react-bootstrap';
import {injectIntl, WrappedComponentProps}                           from 'react-intl';
import {ArbeidV2, SoknadV2, TilleggsinformasjonV2, TilsynsordningV2} from "../../models/types/Soknadv2";
import {IPeriodeV2} from "../../models/types/PeriodeV2";

interface ISoknadReadModeProps {
    soknad: SoknadV2;
}

class SoknadReadMode extends React.Component<WrappedComponentProps & ISoknadReadModeProps> {

    render() {
        const {intl, soknad} = this.props;

        return (
            <Container className={classNames('read-modal soknad-read-mode', 'enkel')}>
                <Row className="felles">
                    <Col>{intlHelper(intl, 'mappe.lesemodus.mottakelsesdato')}</Col>
                    {this.mottakelsesdato(soknad.mottattDato)}
                </Row>
                <Row>
                    <Col>{intlHelper(intl, 'mappe.lesemodus.perioder')}</Col>
                    {this.soknadsperioder([soknad.soeknadsperiode])}
                </Row>
                <Row className="felles">
                    <Col>{intlHelper(intl, 'mappe.lesemodus.barn')}</Col>
                    <Col>{soknad.barn.norskIdent ? soknad.barn.norskIdent : soknad.barn.foedselsdato}</Col>
                </Row>
                <Row>
                    <Col>{intlHelper(intl, 'mappe.lesemodus.arbeid')}</Col>
                    {this.arbeid(soknad.arbeidAktivitet)}
                </Row>
                <Row className="felles">
                    <Col>{intlHelper(intl, 'mappe.lesemodus.tilsyn')}</Col>
                    {this.tilsynsordning(soknad.tilsynsordning)}
                </Row>
                <Row className="felles">
                    <Col>{intlHelper(intl, 'mappe.lesemodus.beredskap')}</Col>
                    {this.tilleggsinfo(soknad.beredskap, 'mappe.lesemodus.beredskap.beskrivelse')}
                </Row>
                <Row className="felles">
                    <Col>{intlHelper(intl, 'mappe.lesemodus.nattevaak')}</Col>
                    {this.tilleggsinfo(soknad.nattevaak, 'mappe.lesemodus.nattevaak.beskrivelse')}
                </Row>

            </Container>
        );
    }

    private mottakelsesdato = (dato: string) => <Col>{datetime(this.props.intl, TimeFormat.DATE_WITH_MONTH_NAME, dato)}</Col>;

    private soknadsperioder = (sokandsperioder: IPeriodeV2[]) => <Col><ul>{sokandsperioder.map((p, i) => <li key={i}>{p.fom + '-' + p.tom}</li>)}</ul></Col>;

    private arbeid = (arbeid: ArbeidV2) => {
        const {intl, soknad} = this.props;
            const numberOfWorkPeriods = arbeid.arbeidstakerList.length + arbeid.selvstendigNaeringsdrivende.length + (arbeid.frilanser ? 1 : 0);
        return <Col>{!!numberOfWorkPeriods && <ul>
            {arbeid.arbeidstakerList.map((a,i) => <li key={i}>
                <p>{a.description(intl)}</p>
                {a.arbeidstidInfo.perioder.length && <ul>{a.arbeidstidInfo.perioder.map((tg,j) => <li key={j}>{tg.faktiskArbeidTimerPerDag}</li>)}</ul>}
            </li>)}
            {arbeid.selvstendigNaeringsdrivende.map((a, i) => <li key={i}>{a.description(intl)}</li>)}
            {<li key={"frilanser"}>{arbeid.frilanser.description(intl)}</li>}
        </ul>}</Col>
    };

    private tilleggsinfo = (tilleggsinformasjon: TilleggsinformasjonV2[], intlCode: string) => {
        const {intl} = this.props;
        return <Col>{!!tilleggsinformasjon.length && <ul>
            {tilleggsinformasjon.map((t,i) => <li key={i}>{intlHelper(
                intl,
                intlCode,
                {...t.periode.generateStringsForDescription(intl)}
            )}</li>)}
        </ul>}</Col>;
    };

    private tilsynsordning = (tilsynsordning: TilsynsordningV2[]) => {
        const {intl} = this.props;
        return <Col>{tilsynsordning.length > 0
            ? <ul>{tilsynsordning.map((t,i) => <li key={i}>{t.periode.description(intl)}</li>)}</ul>
            : intlHelper(intl, tilsynsordning.length > 0 ? "ja" : "nei")}</Col>;
    }
}


export default injectIntl(SoknadReadMode);
