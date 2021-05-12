import {TimeFormat}                                    from 'app/models/enums';
import {datetime}                                                    from 'app/utils';
import intlHelper                                                    from 'app/utils/intlUtils';
import classNames                                                    from 'classnames';
import * as React                                                    from 'react';
import {Col, Container, Row}                                         from 'react-bootstrap';
import {injectIntl, WrappedComponentProps}                           from 'react-intl';
import {
    OpptjeningAktivitet,
    PSBSoknad,
    TilleggsinformasjonV2,
    TilsynsordningV2
} from "../../models/types/PSBSoknad";
import {IPeriodeV2} from "../../models/types/PeriodeV2";

interface ISoknadReadModeProps {
    soknad: PSBSoknad;
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
                <Row className="felles">
                    <Col>{intlHelper(intl, 'mappe.lesemodus.tilsyn')}</Col>
                    {this.tilsynsordning(soknad.tilsynsordning)}
                </Row>

            </Container>
        );
    }

    private mottakelsesdato = (dato: string) => <Col>{datetime(this.props.intl, TimeFormat.DATE_WITH_MONTH_NAME, dato)}</Col>;

    private soknadsperioder = (sokandsperioder: IPeriodeV2[]) => <Col><ul>{sokandsperioder.map((p, i) => <li key={i}>{p.fom + '-' + p.tom}</li>)}</ul></Col>;


    private tilsynsordning = (tilsynsordning: TilsynsordningV2) => {
        const {intl} = this.props;
        return <Col>{tilsynsordning.perioder.length > 0
            ? <ul>{tilsynsordning.perioder.map((t,i) => <li key={i}>{t.description(intl)}</li>)}</ul>
            : intlHelper(intl, tilsynsordning.perioder.length > 0 ? "ja" : "nei")}</Col>;
    }
}


export default injectIntl(SoknadReadMode);
