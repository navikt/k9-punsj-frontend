import { TimeFormat } from 'app/models/enums';
import { datetime } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import classNames from 'classnames';
import * as React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { PSBSoknad, Tilsynsordning } from '../../models/types/PSBSoknad';
import { IPeriode } from '../../models/types/Periode';

interface ISoknadReadModeProps {
    soknad: PSBSoknad;
}

class SoknadReadMode extends React.Component<WrappedComponentProps & ISoknadReadModeProps> {
    private mottakelsesdato = (dato: string) => {
        const { intl } = this.props;
        return <Col>{datetime(intl, TimeFormat.DATE_WITH_MONTH_NAME, dato)}</Col>;
    };

    private soknadsperioder = (sokandsperioder: IPeriode[]) => (
        <Col>
            <ul>
                {sokandsperioder.map((p) => (
                    <li key={`${p.fom}-${p.tom}`}>{`${p.fom}-${p.tom}`}</li>
                ))}
            </ul>
        </Col>
    );

    private tilsynsordning = (tilsynsordning: Tilsynsordning) => {
        const { intl } = this.props;
        return (
            <Col>
                {tilsynsordning.perioder.length > 0 ? (
                    <ul>
                        {tilsynsordning.perioder.map((t) => (
                            <li key={`${t.periode?.fom}-${t.periode?.tom}`}>{t.description(intl)}</li>
                        ))}
                    </ul>
                ) : (
                    intlHelper(intl, tilsynsordning.perioder.length > 0 ? 'ja' : 'nei')
                )}
            </Col>
        );
    };

    render() {
        const { intl, soknad } = this.props;

        return (
            <Container className={classNames('read-modal soknad-read-mode', 'enkel')}>
                <Row className="felles">
                    <Col>{intlHelper(intl, 'mappe.lesemodus.mottakelsesdato')}</Col>
                    {this.mottakelsesdato(soknad.mottattDato)}
                </Row>
                <Row>
                    <Col>{intlHelper(intl, 'mappe.lesemodus.perioder')}</Col>
                    {this.soknadsperioder(soknad.soeknadsperiode ? soknad.soeknadsperiode : [{ fom: '', tom: '' }])}
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
}

export default injectIntl(SoknadReadMode);
