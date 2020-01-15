import {TimeFormat}                        from 'app/models/enums';
import {IPeriodeinfo, ISoknad}             from 'app/models/types';
import {datetime}                          from 'app/utils';
import intlHelper                          from 'app/utils/intlUtils';
import * as React                          from 'react';
import {Col, Container, Row}               from 'react-bootstrap';
import {injectIntl, WrappedComponentProps} from 'react-intl';

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
            </Container>
        );
    }

    private periodeItem(periode: IPeriodeinfo) {
        const {fraOgMed, tilOgMed, nattevaak, beredskap} = periode;
        const fom = !!fraOgMed && datetime(this.props.intl, TimeFormat.DATE_SHORT, fraOgMed);
        const tom = !!tilOgMed && datetime(this.props.intl, TimeFormat.DATE_SHORT, tilOgMed);
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