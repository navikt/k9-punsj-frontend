import * as React from 'react';
import { FormattedMessage, WrappedComponentProps, injectIntl } from 'react-intl';

import { Button } from '@navikt/ds-react';

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
                <div className="flex flex-wrap">{utledMelding(melding)}</div>
                <div className="flex flex-wrap">
                    <FormattedMessage id="modal.okgaatillos.tillos" />
                </div>
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
