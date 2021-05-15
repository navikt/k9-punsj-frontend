import * as React from "react";
import {injectIntl, WrappedComponentProps} from "react-intl";
import intlHelper from "../../utils/intlUtils";

import {Knapp} from "nav-frontend-knapper";
import './settPaaVentModal.less'
import {IJournalpost, IJournalpostInfo} from "../../models/types";
import {AlertStripeInfo} from "nav-frontend-alertstriper";
import {apiUrl} from "../../utils";
import {ApiPath} from "../../apiConfig";
import VisSvg from "../../assets/SVG/VisSVG";

interface ISettPaaVentModalProps {
    submit: () => void;
    avbryt: () => void;
    journalposter: IJournalpostInfo[];
    soknadId: string;
}

const pdfUrl = (journalpost: IJournalpostInfo) => {
    return apiUrl(ApiPath.DOKUMENT, {
        journalpostId: journalpost.journalpostId,
        dokumentId: journalpost.dokumenter[0].dokument_id

    })
}

const urlTilNyJournalpost = (id: string, jpid: string) => {
    return `${jpid}/pleiepenger/skjema/${id}`
}

class SettPaaVentModal extends React.Component<WrappedComponentProps & ISettPaaVentModalProps> {

    render() {
        const {intl, submit, avbryt, journalposter, soknadId} = this.props;

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
                {!!journalposter.length && (
                    <>
                        <h2>{intlHelper(intl, 'modal.settpaavent.overskrift')}</h2>
                        <AlertStripeInfo>
                            {intlHelper(intl, 'modal.settpaavent.info')}
                        </AlertStripeInfo>

                        <table className="tabell tabell--stripet punch_mappetabell">
                            <thead>
                            <tr>
                                <th>{intlHelper(intl, 'tabell.journalpostid')}</th>
                                <th>{intlHelper(intl, 'tabell.mottakelsesdato')}</th>
                                <th/>
                                <th/>
                            </tr>
                            <tr/>
                            </thead>
                            <tbody>
                            {journalposter.map((j, i) => (
                                    <tr key={i}>
                                        <td>{j.journalpostId}</td>
                                        <td>{j.dato}</td>
                                        <td>
                                            <a
                                                className={"visjp"}
                                                href={pdfUrl(j)}
                                                target="_blank"
                                            >
                                                <VisSvg title={"vis"}/>
                                                <div
                                                    className="vistext">{intlHelper(intl, 'modal.settpaavent.visjournalpost')}</div>
                                            </a>
                                        </td>
                                        <td><Knapp mini={true} onClick={() => window.location.href = urlTilNyJournalpost(soknadId, j.journalpostId)} >{intlHelper(intl, 'modal.settpaavent.registrer')}</Knapp>
                                        </td>
                                    </tr>
                                )
                            )}
                            </tbody>
                        </table>

                    </>)}
            </div>
        );
    }
}


export default injectIntl(SettPaaVentModal);
