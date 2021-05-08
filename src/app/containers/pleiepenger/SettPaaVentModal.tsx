import {OpptjeningAktivitet, PSBSoknad, TilleggsinformasjonV2, TilsynsordningV2} from "../../models/types/PSBSoknad";
import * as React from "react";
import {injectIntl, WrappedComponentProps} from "react-intl";
import {Col, Container, Row} from "react-bootstrap";
import classNames from "classnames";
import intlHelper from "../../utils/intlUtils";

import {Knapp} from "nav-frontend-knapper";
import './settPaaVentModal.less'

interface ISettPaaVentModalProps {
    submit: () => void;
    avbryt: () => void
}

class SettPaaVentModal extends React.Component<WrappedComponentProps & ISettPaaVentModalProps> {

    render() {
        const {intl, submit, avbryt} = this.props;

        return (
            <Container className={classNames('read-modal sett-paa-vent', 'enkel')}>
                <h2>{intlHelper(intl, 'skjema.knapp.settpaavent')}</h2>
                <p>{intlHelper(intl, 'skjema.settpaavent.periode')}</p>
                <div className="knapper">
                    <Knapp
                    onClick={() => submit()}
                    >{intlHelper(intl, 'skjema.knapp.settpaavent')}</Knapp>
                    <Knapp onClick={() => avbryt()}>{intlHelper(intl, 'skjema.knapp.avbryt')}</Knapp>
                </div>

            </Container>
        );
    }


}


export default injectIntl(SettPaaVentModal);
