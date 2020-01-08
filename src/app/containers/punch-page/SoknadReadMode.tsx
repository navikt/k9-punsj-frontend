import {TimeFormat}                                   from 'app/models/enums';
import {IPeriodeMedBeredskapNattevaakArbeid, ISoknad} from 'app/models/types';
import {datetime}                                     from 'app/utils';
import intlHelper                                     from 'app/utils/intlUtils';
import * as React                                     from 'react';
import {Col, Container, Row}                          from 'react-bootstrap';
import {injectIntl, WrappedComponentProps}            from 'react-intl';

interface ISoknadReadModeProps {
    soknad: ISoknad;
}

class SoknadReadMode extends React.Component<WrappedComponentProps & ISoknadReadModeProps> {

    render() {
        const {intl, soknad} = this.props;
        const colClassName = 'd-flex align-items-center';
        return (
            <Container className="read-modal soknad-read-mode">
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
                            {soknad.perioder.map((p: IPeriodeMedBeredskapNattevaakArbeid, i: number) => <li key={`periodelisteelement_${i}`}>{this.periodeItem(p)}</li>)}
                        </ul>}
                    </Col>
                </Row>
            </Container>
        );
    }

    private periodeItem(periode: IPeriodeMedBeredskapNattevaakArbeid) {
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