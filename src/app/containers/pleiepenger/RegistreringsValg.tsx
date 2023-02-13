import { Alert, Button } from '@navikt/ds-react';

import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { PunchStep } from '../../models/enums';
import { IEksisterendeSoknaderState, IJournalpost, IPunchState } from '../../models/types';
import { IIdentState } from '../../models/types/IdentState';
import { createSoknad, resetSoknadidAction, undoSearchForEksisterendeSoknaderAction } from '../../state/actions';
import { hentAlleJournalposterForIdent as hentAlleJournalposterPerIdentAction } from '../../state/actions/JournalposterPerIdentActions';
import { RootStateType } from '../../state/RootState';
import { setHash } from '../../utils';
import { EksisterendeSoknader } from './EksisterendeSoknader';
import './registreringsValg.less';
import { IJournalposterPerIdentState } from '../../models/types/Journalpost/JournalposterPerIdentState';

export interface IRegistreringsValgComponentProps {
    journalpostid: string;
    getPunchPath: (step: PunchStep, values?: any) => string;
}

export interface IRegistreringsValgDispatchProps {
    undoSearchForEksisterendeSoknaderAction: typeof undoSearchForEksisterendeSoknaderAction;
    createSoknad: typeof createSoknad;
    resetSoknadidAction: typeof resetSoknadidAction;
    getAlleJournalposter: typeof hentAlleJournalposterPerIdentAction;
}

export interface IEksisterendeSoknaderStateProps {
    punchState: IPunchState;
    eksisterendeSoknaderState: IEksisterendeSoknaderState;
    journalposterState: IJournalposterPerIdentState;
    identState: IIdentState;
}

type IRegistreringsValgProps = IRegistreringsValgComponentProps &
    IEksisterendeSoknaderStateProps &
    IRegistreringsValgDispatchProps;

export const RegistreringsValgComponent: React.FunctionComponent<IRegistreringsValgProps> = (
    props: IRegistreringsValgProps
) => {
    const { journalpostid, identState, getPunchPath, eksisterendeSoknaderState } = props;
    const [valgtOption, setValgtOption] = useState<string>('nysoknad');

    const { søkerId, pleietrengendeId } = identState;

    React.useEffect(() => {
        if (!!eksisterendeSoknaderState.eksisterendeSoknaderSvar && eksisterendeSoknaderState.isSoknadCreated) {
            setHash(
                getPunchPath(PunchStep.FILL_FORM, {
                    id: eksisterendeSoknaderState.soknadid,
                })
            );
            props.resetSoknadidAction();
        }
    }, [eksisterendeSoknaderState.soknadid]);

    React.useEffect(() => {
        props.getAlleJournalposter(søkerId);
    }, [søkerId]);

    const redirectToPreviousStep = () => {
        setHash('/');
        props.undoSearchForEksisterendeSoknaderAction();
    };

    const redirectToNextStep = () => {
        props.createSoknad(journalpostid, søkerId, pleietrengendeId);
        setHash(
            getPunchPath(PunchStep.FILL_FORM, {
                id: eksisterendeSoknaderState.soknadid,
            })
        );
    };

    if (eksisterendeSoknaderState.createSoknadRequestError) {
        return (
            <Alert size="small" variant="error">
                Det oppsto en feil under opprettelse av søknad.
            </Alert>
        );
    }

    const newSoknad = () => props.createSoknad(journalpostid, søkerId, pleietrengendeId);

    const technicalError =
        eksisterendeSoknaderState.isSoknadCreated && !eksisterendeSoknaderState.soknadid ? (
            <Alert size="small" variant="error">
                Teknisk feil.
            </Alert>
        ) : null;

    const infoText = (journalpost: IJournalpost, index: number) => {
        const dato = journalpost.dato ? `, dato: ${journalpost.dato}` : '';
        return `Journalpost ${index}${dato}`;
    };

    const kanStarteNyRegistrering = () => {
        const soknader = eksisterendeSoknaderState.eksisterendeSoknaderSvar.søknader;
        if (soknader?.length) {
            return !eksisterendeSoknaderState.eksisterendeSoknaderSvar.søknader?.some((es) =>
                Array.from(es.journalposter!).some((jp) => jp === journalpostid)
            );
        }
        return true;
    };

    return (
        <div className="registrering-page">
            <EksisterendeSoknader
                søkerId={søkerId}
                pleietrengendeId={pleietrengendeId}
                getPunchPath={getPunchPath}
                journalpostid={journalpostid}
            />

            <div className="knapperad">
                <Button variant="secondary" className="knapp1" onClick={redirectToPreviousStep} size="small">
                    Tilbake
                </Button>
                {kanStarteNyRegistrering() && (
                    <Button onClick={newSoknad} className="knapp2" disabled={valgtOption === ''} size="small">
                        <FormattedMessage id="ident.knapp.nyregistrering" />
                    </Button>
                )}
            </div>
        </div>
    );
};
const mapDispatchToProps = (dispatch: any) => ({
    createSoknad: (journalpostid: string, søkerId: string, pleietrengendeId: string | null) =>
        dispatch(createSoknad(journalpostid, søkerId, pleietrengendeId)),
    undoSearchForEksisterendeSoknaderAction: () => dispatch(undoSearchForEksisterendeSoknaderAction()),
    resetSoknadidAction: () => dispatch(resetSoknadidAction()),
    getAlleJournalposter: (norskIdent: string) => dispatch(hentAlleJournalposterPerIdentAction(norskIdent)),
});

const mapStateToProps = (state: RootStateType): IEksisterendeSoknaderStateProps => ({
    punchState: state.PLEIEPENGER_SYKT_BARN.punchState,
    eksisterendeSoknaderState: state.eksisterendeSoknaderState,
    journalposterState: state.journalposterPerIdentState,
    identState: state.identState,
});

export const RegistreringsValg = connect(mapStateToProps, mapDispatchToProps)(RegistreringsValgComponent);
