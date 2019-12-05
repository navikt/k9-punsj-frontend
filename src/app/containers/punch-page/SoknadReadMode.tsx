import {TimeFormat}                    from 'app/models/enums';
import {ISoknad}                       from 'app/models/types';
import {datetime}                      from 'app/utils';
import * as React                      from 'react';
import {Col, Container, Row}           from 'react-bootstrap';
import {InjectedIntlProps, injectIntl} from 'react-intl';

interface ISoknadReadModeProps {
    soknad: ISoknad;
}

class SoknadReadMode extends React.Component<InjectedIntlProps & ISoknadReadModeProps> {

    render() {
        const {intl, soknad} = this.props;
        return (
            <Container className="read-modal soknad-read-mode">
                <Row>
                    <Col>Fødselsnummer:</Col>
                    <Col>{!!soknad.soker && soknad.soker.norsk_identitetsnummer}</Col>
                </Row>
                <Row>
                    <Col>Medsøkers fødselsnummer:</Col>
                    <Col>{soknad.medsoker && soknad.medsoker.norsk_identitetsnummer}</Col>
                </Row>
                <Row>
                    <Col>Periode:</Col>
                    <Col>{soknad.periode && <Container>
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
                </Row>
                <Row>
                    <Col>Barn:</Col>
                    <Col/>
                </Row>
            </Container>
        );
    }
}

export default injectIntl(SoknadReadMode);