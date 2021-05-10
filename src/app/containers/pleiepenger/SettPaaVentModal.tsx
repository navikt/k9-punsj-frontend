import {OpptjeningAktivitet, PSBSoknad, TilleggsinformasjonV2, TilsynsordningV2} from "../../models/types/PSBSoknad";
import * as React from "react";
import {injectIntl, WrappedComponentProps} from "react-intl";
import {Col, Container, Row} from "react-bootstrap";
import classNames from "classnames";
import intlHelper from "../../utils/intlUtils";

import {Knapp} from "nav-frontend-knapper";
import './settPaaVentModal.less'
import {IJournalpost, IJournalpostInfo} from "../../models/types";
import {AlertStripeInfo} from "nav-frontend-alertstriper";
import {apiUrl} from "../../utils";
import {ApiPath} from "../../apiConfig";

interface ISettPaaVentModalProps {
    submit: () => void;
    avbryt: () => void;
    journalposter: IJournalpostInfo[];
}

const pdfUrl = (journalpost: IJournalpost) => {
    return apiUrl(ApiPath.DOKUMENT, {
        journalpostId: journalpost.journalpostId,
        dokumentId: journalpost.dokumenter[0].dokumentId

    })
}

class SettPaaVentModal extends React.Component<WrappedComponentProps & ISettPaaVentModalProps> {

    render() {
        const {intl, submit, avbryt, journalposter} = this.props;

        return (
            <div className={"sett-paa-vent"}>
                <h2>{intlHelper(intl, 'skjema.knapp.settpaavent')}</h2>
                <p>{intlHelper(intl, 'skjema.settpaavent.periode')}</p>
                <div className="knapper">
                    <Knapp
                        onClick={() => submit()}
                        mini={true}
                    >{intlHelper(intl, 'skjema.knapp.settpaavent')}</Knapp>
                    <Knapp onClick={() => avbryt()} mini={true}>{intlHelper(intl, 'skjema.knapp.avbryt')}</Knapp>
                </div>
                <h2>{intlHelper(intl, 'modal.settpaavent.overskrift')}</h2>
                <AlertStripeInfo>
                    {intlHelper(intl, 'modal.settpaavent.info')}
                </AlertStripeInfo>

                <table className="tabell tabell--stripet punch_mappetabell">
                    <thead>
                    <tr>
                        <th>{intlHelper(intl, 'tabell.journalpostid')}</th>
                        <th>{intlHelper(intl, 'tabell.mottakelsesdato')}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {journalposter.length && journalposter.map((j, i) => (
                            <tr key={i}>
                                <td>{j.journalpostid}</td>
                                <td>{j.datoMottatt}</td>
                            </tr>
                        )
                    )}
                    </tbody>
                </table>

            </div>
        );
    }


}


export default injectIntl(SettPaaVentModal);
