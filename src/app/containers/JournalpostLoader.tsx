import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';

import { Alert, Box, Button, Loader, Modal } from '@navikt/ds-react';

import Fagsak from 'app/types/Fagsak';

import { WrenchIcon } from '@navikt/aksel-icons';
import { lukkDebuggJp } from 'app/utils/JournalpostLoaderUtils';
import FeilmeldingPanel from '../components/FeilmeldingPanel';
import { JournalpostConflictTyper } from '../models/enums/Journalpost/JournalpostConflictTyper';
import { IError, IJournalpost } from '../models/types';
import { IJournalpostConflictResponse } from '../models/types/Journalpost/IJournalpostConflictResponse';
import { RootStateType } from '../state/RootState';
import { lukkJournalpostOppgave as lukkJournalpostOppgaveAction, lukkOppgaveResetAction } from '../state/actions';
import { getJournalpost as getJournalpostAction } from '../state/reducers/FellesReducer';

import OkGaaTilLosModal from './pleiepenger/OkGaaTilLosModal';
import './journalpostLoader.less';

interface IJournaPostStateProps {
    journalpost?: IJournalpost;
    isJournalpostLoading?: boolean;
    journalpostConflictError?: IJournalpostConflictResponse;
    journalpostRequestError?: IError;
    forbidden?: boolean;
    conflict?: boolean;
    notFound?: boolean;
    lukkOppgaveDone?: boolean;
}

interface IJournalpostProps {
    renderOnLoadComplete: () => React.ReactNode;
}

interface IDispatchProps {
    getJournalpost: typeof getJournalpostAction;
    lukkOppgaveReset: typeof lukkOppgaveResetAction;
}

export type JournapostLoaderProps = IJournaPostStateProps & IJournalpostProps & IDispatchProps;

export const JournalpostLoaderImpl: React.FunctionComponent<JournapostLoaderProps> = ({
    renderOnLoadComplete,
    isJournalpostLoading,
    getJournalpost,
    lukkOppgaveReset,
    journalpost,
    journalpostConflictError,
    journalpostRequestError,
    forbidden,
    conflict,
    notFound,
    lukkOppgaveDone,
}) => {
    const { journalpostid } = useParams<{ journalpostid: string }>();

    const [pendinglukkDebuggJp, setPendinglukkDebuggJp] = useState(false);
    const [lukkDebuggJpStatus, setLukkDebuggJpStatus] = useState<number | undefined>(undefined);
    const [ingenJp, setIngenJp] = useState(false);

    const handleLukkDebugg = () => {
        if (journalpostid) {
            setPendinglukkDebuggJp(true);
            setLukkDebuggJpStatus(undefined);
            lukkDebuggJp(journalpostid).then((status: number) => {
                setPendinglukkDebuggJp(false);
                setLukkDebuggJpStatus(status);
            });
        } else {
            setIngenJp(true);
        }
    };

    useEffect(() => {
        if (journalpostid) {
            getJournalpost(journalpostid);
        }
    }, [journalpostid]);

    if (isJournalpostLoading) {
        return (
            <div className="h-screen">
                <div className="justify-content-center align-items-center h-screen flex flex-wrap">
                    <Loader size="large" />
                </div>
            </div>
        );
    }

    if (notFound) {
        return <FeilmeldingPanel messageId="startPage.feil.journalpost" />;
    }

    if (forbidden) {
        return <FeilmeldingPanel messageId="startPage.feil.ikketilgang" />;
    }

    if (lukkOppgaveDone) {
        return (
            <Modal key="lukkoppgaveokmodal" onClose={() => lukkOppgaveReset()} aria-label="settpaaventokmodal" open>
                <OkGaaTilLosModal melding="fordeling.lukkoppgave.utfort" />
            </Modal>
        );
    }

    if (
        !!conflict &&
        journalpostConflictError &&
        journalpostConflictError.type === JournalpostConflictTyper.IKKE_STØTTET
    ) {
        return (
            <>
                {!lukkDebuggJpStatus && <FeilmeldingPanel messageId="startPage.feil.ikkeStøttet" />}

                {lukkDebuggJpStatus && [200, 400, 404].includes(lukkDebuggJpStatus) && (
                    <FeilmeldingPanel background="surface-success-subtle">
                        <FormattedMessage
                            id={`startPage.feil.ikkeStøttet.lukkDebugg.status.${lukkDebuggJpStatus}`}
                            values={{ jp: journalpostid }}
                        />
                    </FeilmeldingPanel>
                )}
                {lukkDebuggJpStatus && ![200, 400, 404].includes(lukkDebuggJpStatus) && (
                    <FeilmeldingPanel background="surface-warning-subtle">
                        <FormattedMessage
                            id="startPage.feil.ikkeStøttet.lukkDebugg.status.ukjent"
                            values={{ status: lukkDebuggJpStatus }}
                        />
                    </FeilmeldingPanel>
                )}
                {ingenJp && (
                    <FeilmeldingPanel background="surface-warning-subtle">
                        <FormattedMessage id="startPage.feil.ikkeStøttet.lukkDebugg.ingenJp" />
                    </FeilmeldingPanel>
                )}

                <div className="flex self-center justify-center">
                    <Box background="surface-default" padding="6">
                        <Button
                            variant="primary"
                            icon={pendinglukkDebuggJp ? <Loader size="medium" /> : <WrenchIcon aria-hidden />}
                            onClick={handleLukkDebugg}
                        >
                            <FormattedMessage id="startPage.feil.ikkeStøttet.lukkDebugg.btn" />
                        </Button>
                    </Box>
                </div>
            </>
        );
    }

    if (journalpostRequestError) {
        return <FeilmeldingPanel messageId="startPage.feil.internalServerError" />;
    }

    if (!journalpost) {
        return null;
    }

    if (!journalpost.dokumenter.length) {
        return (
            <Alert size="small" variant="error">
                <FormattedMessage id="startPage.feil.ingendokumenter" />
            </Alert>
        );
    }

    return <>{renderOnLoadComplete()}</>;
};

const mapStateToProps = ({ felles, fordelingState }: RootStateType): IJournaPostStateProps => ({
    journalpost: felles.journalpost,
    isJournalpostLoading: felles.isJournalpostLoading,
    forbidden: felles.journalpostForbidden,
    conflict: felles.journalpostConflict,
    journalpostConflictError: felles.journalpostConflictError,
    journalpostRequestError: felles.journalpostRequestError,
    notFound: felles.journalpostNotFound,
    lukkOppgaveDone: fordelingState.lukkOppgaveDone,
});

const mapDispatchToProps = (dispatch: any) => ({
    getJournalpost: (id: string) => dispatch(getJournalpostAction(id)),
    lukkJournalpostOppgave: (jpid: string, soekersIdent: string, fagsak?: Fagsak) =>
        dispatch(lukkJournalpostOppgaveAction(jpid, soekersIdent, fagsak)),
    lukkOppgaveReset: () => dispatch(lukkOppgaveResetAction()),
});

export default connect(mapStateToProps, mapDispatchToProps)(JournalpostLoaderImpl);
