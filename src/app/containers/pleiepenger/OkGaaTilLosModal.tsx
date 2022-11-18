import { Button } from '@navikt/ds-react';
import * as React from 'react';
import { Row } from 'react-bootstrap';
import { FormattedMessage, injectIntl, WrappedComponentProps } from 'react-intl';
import CheckCircleSvg from '../../assets/SVG/CheckCircleSVG';
import { getEnvironmentVariable } from '../../utils';
import intlHelper from '../../utils/intlUtils';
import { initializeDate } from '../../utils/timeUtils';
import './okGaaTilLosModal.less';

interface IOkGaaTilLOsModalProps {
    melding: string;
}

const getDate = () => initializeDate().add(21, 'days').format('DD.MM.YYYY');

const utledMelding = (mld: string) => {
    if (mld === 'modal.settpaavent.til') {
        return <FormattedMessage id={mld} values={{ dato: getDate() }} />;
    }
    return <FormattedMessage id={mld} />;
};

const OkGaaTilLosModal = (props: WrappedComponentProps & IOkGaaTilLOsModalProps) => {
    const { intl, melding } = props;

    return (
        <div className="ok-gaa-til-los">
            <CheckCircleSvg title="check" />
            <div className="vl" />
            <div className="info">
                <Row>{utledMelding(melding)}</Row>
                <Row>
                    <FormattedMessage id="modal.okgaatillos.tillos" />
                </Row>
            </div>
            <Button
                className="okknapp"
                size="small"
                onClick={() => {
                    window.location.href = getEnvironmentVariable('K9_LOS_URL');
                }}
            >
                {intlHelper(intl, 'modal.okgaatillos.ok')}
            </Button>
        </div>
    );
};

export default injectIntl(OkGaaTilLosModal);
