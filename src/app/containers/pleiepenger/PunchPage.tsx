/* eslint-disable react/jsx-props-no-spreading */
import { Alert, Button, Panel } from '@navikt/ds-react';
import { ApiPath } from 'app/apiConfig';
import Page from 'app/components/page/Page';
import 'app/containers/pleiepenger/punchPage.less';
import useQuery from 'app/hooks/useQuery';
import { PunchStep } from 'app/models/enums';
import { IJournalpostDokumenter } from 'app/models/enums/Journalpost/JournalpostDokumenter';
import { IJournalpost, IPath, IPunchPSBFormState, IPunchState } from 'app/models/types';
import { setIdentAction, setStepAction } from 'app/state/actions';
import { RootStateType } from 'app/state/RootState';
import { get, getEnvironmentVariable, getPath } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import React from 'react';
import { FormattedMessage, injectIntl, WrappedComponentProps } from 'react-intl';
import { useQueries } from 'react-query';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
// eslint-disable-next-line import/no-extraneous-dependencies
import 'nav-frontend-tabell-style';
import { JournalpostPanel } from '../../components/journalpost-panel/JournalpostPanel';
import PdfVisning from '../../components/pdf/PdfVisning';
import { IIdentState } from '../../models/types/IdentState';
import { peiepengerPaths } from './PeiepengerRoutes';
import { PSBPunchForm } from './PSBPunchForm';
import { RegistreringsValg } from './RegistreringsValg';
import SoknadKvittering from './SoknadKvittering/SoknadKvittering';

export interface IPunchPageStateProps {
    punchState: IPunchState;
    journalpost?: IJournalpost;
    identState: IIdentState;
    forbidden: boolean | undefined;
    punchFormState: IPunchPSBFormState;
}

export interface IPunchPageDispatchProps {
    setIdentAction: typeof setIdentAction;
    setStepAction: typeof setStepAction;
}

export interface IPunchPageQueryProps {
    dok?: string | null;
}

export interface IPunchPageComponentProps {
    match?: any;
    step: PunchStep;
    journalpostid?: string;
    paths: IPath[];
}

export interface IPunchPageComponentState {
    ident1: string;
    ident2: string;
}

type IPunchPageProps = WrappedComponentProps &
    RouteComponentProps &
    IPunchPageComponentProps &
    IPunchPageStateProps &
    IPunchPageDispatchProps &
    IPunchPageQueryProps;

export const PunchPageComponent: React.FunctionComponent<IPunchPageProps> = (props) => {
    const { intl, dok, journalpostid, journalpost, forbidden, step, match, punchFormState } = props;
    const journalposterFraSoknad = punchFormState.soknad?.journalposter;
    const journalposter =
        (step !== PunchStep.CHOOSE_SOKNAD && journalposterFraSoknad && Array.from(journalposterFraSoknad)) || [];

    const getPunchPath = (punchStep: PunchStep, values?: any) =>
        getPath(peiepengerPaths, punchStep, values, dok ? { dok } : undefined);

    const queryObjects = journalposter.map((journalpostidentifikator) => ({
        queryKey: ['journalpost', journalpostidentifikator],
        queryFn: () =>
            get(ApiPath.JOURNALPOST_GET, { journalpostId: journalpostidentifikator }).then((res) => {
                if (!res.ok) {
                    throw new Error(`Fetch mot ${ApiPath.JOURNALPOST_GET} feilet`);
                } else {
                    return res.json();
                }
            }),
    }));

    const queries = useQueries(queryObjects);

    // eslint-disable-next-line consistent-return
    const underFnr = () => {
        const commonProps = {
            journalpostid: journalpostid || '',
            getPunchPath,
        };

        // eslint-disable-next-line default-case
        switch (step) {
            case PunchStep.CHOOSE_SOKNAD:
                return <RegistreringsValg {...commonProps} />;
            case PunchStep.FILL_FORM:
                return <PSBPunchForm {...commonProps} id={match.params.id} />;
            case PunchStep.COMPLETED:
                return (
                    <>
                        <Alert size="small" variant="info" className="fullfortmelding">
                            <FormattedMessage id="skjema.sentInn" />
                        </Alert>
                        <div className="punchPage__knapper">
                            <Button
                                onClick={() => {
                                    window.location.href = getEnvironmentVariable('K9_LOS_URL');
                                }}
                            >
                                {intlHelper(intl, 'tilbaketilLOS')}
                            </Button>
                            {/*                             {!!punchFormState.linkTilBehandlingIK9 && (
                                <Button
                                    onClick={() => {
                                        window.location.href = punchFormState.linkTilBehandlingIK9!;
                                    }}
                                >
                                    {intlHelper(intl, 'tilBehandlingIK9')}
                                </Button>
                            )} */}
                        </div>
                        {!!punchFormState.innsentSoknad && (
                            <SoknadKvittering response={punchFormState.innsentSoknad} intl={intl} />
                        )}
                    </>
                );
        }
    };

    const content = () => {
        if (forbidden) {
            return (
                <Alert size="small" variant="warning">
                    <FormattedMessage id="søk.jp.forbidden" values={{ jpid: journalpostid }} />
                </Alert>
            );
        }
        const journalpostDokumenter: IJournalpostDokumenter[] =
            (queries.every((query) => query.isSuccess) &&
                queries.map((query) => {
                    const data: any = query?.data;

                    return { journalpostid: data?.journalpostId, dokumenter: data?.dokumenter };
                })) ||
            [];

        if (
            journalpost &&
            journalpostDokumenter.filter((post) => post.journalpostid === journalpost?.journalpostId).length === 0
        ) {
            journalpostDokumenter.push({
                dokumenter: journalpost.dokumenter,
                journalpostid: journalpost.journalpostId,
            });
        }

        return (
            <div className="panels-wrapper" id="panels-wrapper">
                <Panel className="pleiepenger_punch_form" border>
                    <JournalpostPanel journalposter={journalpostDokumenter.map((v) => v.journalpostid)} />
                    {underFnr()}
                </Panel>
                {!!journalpostDokumenter.length && <PdfVisning journalpostDokumenter={journalpostDokumenter} />}
            </div>
        );
    };

    // eslint-disable-next-line consistent-return

    return (
        <Page title={intlHelper(intl, 'startPage.tittel')} className="punch">
            {content()}
        </Page>
    );
};

const mapStateToProps = (state: RootStateType) => ({
    punchState: state.PLEIEPENGER_SYKT_BARN.punchState,
    journalpost: state.felles.journalpost,
    identState: state.identState,
    forbidden: state.felles.journalpostForbidden,
    punchFormState: state.PLEIEPENGER_SYKT_BARN.punchFormState,
    journalposterIAktivPunchForm: state.PLEIEPENGER_SYKT_BARN.punchFormState.soknad?.journalposter,
});

const mapDispatchToProps = (dispatch: any) => ({
    setIdentAction: (ident1: string, ident2: string | null) => dispatch(setIdentAction(ident1, ident2)),
    setStepAction: (step: number) => dispatch(setStepAction(step)),
});

const PunchPageComponentWithQuery: React.FunctionComponent<IPunchPageProps> = (props: IPunchPageProps) => {
    const dok = useQuery().get('dok');
    return <PunchPageComponent {...props} dok={dok} />;
};

export const PunchPage = withRouter(
    injectIntl(connect(mapStateToProps, mapDispatchToProps)(PunchPageComponentWithQuery))
);
