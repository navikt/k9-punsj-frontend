import {JaNeiVetikke}                      from 'app/models/enums';
import {ISoknad, Soknad}                   from 'app/models/types';
import intlHelper                          from 'app/utils/intlUtils';
import * as React                          from 'react';
import {Col, Container, Row}               from 'react-bootstrap';
import {injectIntl, WrappedComponentProps} from 'react-intl';

interface ISoknadReadModeProps {
    soknad: ISoknad;
}

class SoknadReadMode extends React.Component<WrappedComponentProps & ISoknadReadModeProps> {

    render() {
        const {intl} = this.props;
        const soknad = new Soknad(this.props.soknad);
        return (
            <Container className="read-modal soknad-read-mode">
                <Row>
                    <Col>{intlHelper(intl, 'mappe.lesemodus.spraak')}</Col>
                    <Col>{intlHelper(intl, `locale.${soknad.spraak}`)}</Col>
                </Row>
                <Row>
                    <Col>{intlHelper(intl, 'mappe.lesemodus.barn')}</Col>
                    <Col>{soknad.getFnrOrFdato()}</Col>
                </Row>
                <Row>
                    <Col>{intlHelper(intl, 'mappe.lesemodus.arbeid')}</Col>
                    <Col>{!!soknad.getNumberOfWorkPeriods() && <ul>
                        {soknad.arbeid.arbeidstaker.map((a,i) => <li key={i}>{a.description(intl)}</li>)}
                        {soknad.arbeid.selvstendigNaeringsdrivende.map((a, i) => <li key={i}>{a.description(intl)}</li>)}
                        {soknad.arbeid.frilanser.map((a,i) => <li key={i}>{a.description(intl)}</li>)}
                    </ul>}</Col>
                </Row>
                <Row>
                    <Col>{intlHelper(intl, 'mappe.lesemodus.beredskap')}</Col>
                    <Col>{!!soknad.beredskap.length && <ul>
                        {soknad.beredskap.map((b,i) => <li key={i}>{intlHelper(
                            intl,
                            'mappe.lesemodus.beredskap.beskrivelse',
                            {...b.periode.generateStringsForDescription(intl)}
                        )}</li>)}
                    </ul>}</Col>
                </Row>
                <Row>
                    <Col>{intlHelper(intl, 'mappe.lesemodus.nattevaak')}</Col>
                    <Col>{!!soknad.nattevaak.length && <ul>
                        {soknad.nattevaak.map((n,i) => <li key={i}>{intlHelper(
                            intl,
                            'mappe.lesemodus.nattevaak.beskrivelse',
                            {...n.periode.generateStringsForDescription(intl)}
                        )}</li>)}
                    </ul>}</Col>
                </Row>
                <Row>
                    <Col>{intlHelper(intl, 'mappe.lesemodus.tilsyn')}</Col>
                    <Col>{soknad.tilsynsordning.iTilsynsordning === JaNeiVetikke.JA
                        ? <ul>{soknad.tilsynsordning.opphold.map((t,i) => <li key={i}>{t.description(intl)}</li>)}</ul>
                        : intlHelper(intl, soknad.tilsynsordning.iTilsynsordning)}</Col>
                </Row>
            </Container>
        );
    }
}

export default injectIntl(SoknadReadMode);