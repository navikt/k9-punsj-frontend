import {TimeFormat}                    from 'app/models/enums';
import {IFagsak}                       from 'app/models/types';
import {datetime}                      from 'app/utils';
import Lenke                           from 'nav-frontend-lenker';
import * as React                      from 'react';
import {Col, Container, Row}           from 'react-bootstrap';
import {InjectedIntlProps, injectIntl} from 'react-intl';

interface IFagsakReadModeComponentProps {
    fagsak: IFagsak;
}

type IFagsakReadModeProps = InjectedIntlProps & IFagsakReadModeComponentProps;

const FagsakReadMode: React.FunctionComponent<IFagsakReadModeProps> = (props: IFagsakReadModeProps) => {

    const {intl, fagsak} = props;
    const {barn, url, fra_og_med, til_og_med} = fagsak;

    return <Container className="read-modal fagsak-read-mode">
        <Row>
            <Col>Barnets navn:</Col>
            <Col>{barn?.navn}</Col>
        </Row>
        <Row>
            <Col>Barnets fødselsdato:</Col>
            <Col>{barn?.foedselsdato && datetime(intl, TimeFormat.DATE_SHORT, barn.foedselsdato)}</Col>
        </Row>
        <Row>
            <Col>Periode:</Col>
            <Col>
                <Container>
                    <Row>
                        <Col>Fra og med:</Col>
                        <Col>{fra_og_med && datetime(intl, TimeFormat.DATE_SHORT, fra_og_med, 'YYYY-MM-DD')}</Col>
                    </Row>
                    <Row>
                        <Col>Til og med:</Col>
                        <Col>{til_og_med && datetime(intl, TimeFormat.DATE_SHORT, til_og_med, 'YYYY-MM-DD')}</Col>
                    </Row>
                </Container>
            </Col>
        </Row>
        {url && <Row><Col><Lenke href={url}>Gå til saken</Lenke></Col></Row>}
    </Container>;
};

export default injectIntl(FagsakReadMode);