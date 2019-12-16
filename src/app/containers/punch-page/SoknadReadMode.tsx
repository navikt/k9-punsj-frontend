import {TimeFormat}                    from 'app/models/enums';
import {IPeriode, ISoknad}             from 'app/models/types';
import {datetime}                      from 'app/utils';
import intlHelper                      from 'app/utils/intlUtils';
import * as React                      from 'react';
import {Col, Container, Row}           from 'react-bootstrap';
import {InjectedIntlProps, injectIntl} from 'react-intl';

interface ISoknadReadModeProps {
    soknad: ISoknad;
}

class SoknadReadMode extends React.Component<InjectedIntlProps & ISoknadReadModeProps> {

    render() {
        const {intl, soknad} = this.props;
        const colClassName = 'd-flex align-items-center';
        return (
            <Container className="read-modal soknad-read-mode">
                {/*<Row>
                    <Col>Fødselsnummer:</Col>
                    <Col>{!!soknad.soker && soknad.soker.norsk_identitetsnummer}</Col>
                </Row>
                <Row>
                    <Col>Medsøkers fødselsnummer:</Col>
                    <Col>{!!soknad.medsoker && soknad.medsoker.norsk_identitetsnummer}</Col>
                </Row>
                <Row>
                    <Col>Periode:</Col>
                    <Col>{!!soknad.periode && <Container>
                        <Row>
                            <Col>Fra og med:</Col>
                            <Col>{datetime(intl, TimeFormat.DATE_SHORT, soknad.periode.fra_og_med, 'YYYY-MM-DD')}</Col>
                        </Row>
                        <Row>
                            <Col>Til og med:</Col>
                            <Col>{datetime(intl, TimeFormat.DATE_SHORT, soknad.periode.til_og_med, 'YYYY-MM-DD')}</Col>
                        </Row>
                    </Container>}</Col>
                </Row>
                <Row>
                    <Col>Relasjon til barnet:</Col>
                    <Col>{soknad.relasjon_til_barnet}</Col>
                </Row>*/}
                <Row className="align-content-center">
                    <Col className={colClassName}>Barnets fødsels-/D-nr. eller fødselsdato:</Col>
                    <Col className={colClassName}>{!!soknad.barn?.norsk_ident ? soknad.barn.norsk_ident : soknad.barn?.foedselsdato}</Col>
                </Row>
                <Row className="align-content-center">
                    <Col className={colClassName}>Søkerens språk:</Col>
                    <Col className={colClassName}>{intlHelper(intl, `locale.${soknad.spraak}`)}</Col>
                </Row>
                <Row className="align-content-center">
                    <Col className={colClassName}>Perioder:</Col>
                    <Col className={colClassName}>
                        {!!soknad.perioder && soknad.perioder.length > 0 && <ul className="periodeliste">
                            {soknad.perioder.map(p => <li>{this.periodeItem(p)}</li>)}
                        </ul>}
                    </Col>
                </Row>
            </Container>
        );
    }

    private periodeItem(periode: IPeriode) {
        const {fra_og_med, til_og_med, nattevaak, beredskap} = periode;
        const fom = !!fra_og_med && datetime(this.props.intl, TimeFormat.DATE_SHORT, fra_og_med);
        const tom = !!til_og_med && datetime(this.props.intl, TimeFormat.DATE_SHORT, til_og_med);
        const bn = !!nattevaak?.svar && !!beredskap?.svar ? 'bn' : (!!beredskap?.svar ? 'b' : (!!nattevaak?.svar ? 'n' : ''));
        if (!!fom && !!tom) {
            return intlHelper(this.props.intl, 'mappe.lesemodus.periode.fratil', {fom, tom, bn});
        } else if (!!fom) {
            return intlHelper(this.props.intl, 'mappe.lesemodus.periode.fra', {fom, bn});
        } else if (!!tom) {
            return intlHelper(this.props.intl, 'mappe.lesemodus.periode.til', {tom, bn});
        } else {
            return intlHelper(this.props.intl, 'mappe.lesemodus.periode.udefinert', {bn});
        }
    }
}

export default injectIntl(SoknadReadMode);