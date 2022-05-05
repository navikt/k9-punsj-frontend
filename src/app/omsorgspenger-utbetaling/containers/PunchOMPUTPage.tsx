/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { useQueries } from 'react-query';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { FormattedMessage, injectIntl, WrappedComponentProps } from 'react-intl';
import { Hovedknapp } from 'nav-frontend-knapper';
import Page from 'app/components/page/Page';
import useQuery from 'app/hooks/useQuery';
import { PunchStep } from 'app/models/enums';
import { setIdentAction, setStepAction } from 'app/state/actions';
import { RootStateType } from 'app/state/RootState';
import { get, getEnvironmentVariable, getPath } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import { ApiPath } from 'app/apiConfig';
import { IJournalpostDokumenter } from 'app/models/enums/Journalpost/JournalpostDokumenter';
import { AlertStripeAdvarsel, AlertStripeInfo } from 'nav-frontend-alertstriper';
import Panel from 'nav-frontend-paneler';
// eslint-disable-next-line import/no-extraneous-dependencies
import 'nav-frontend-tabell-style';
import { IIdentState } from '../../models/types/IdentState';
import { OMPUTPaths } from './OMPUTRoutes';
import { OMPUTSoknadKvittering } from './SoknadKvittering/OMPUTSoknadKvittering';
import { IPunchOMPUTFormState } from '../types/PunchOMPUTFormState';
import { IJournalpost, IPath, IPunchState } from '../../models/types';
import { JournalpostPanel } from '../../components/journalpost-panel/JournalpostPanel';
import PdfVisning from '../../components/pdf/PdfVisning';
import { OMPUTRegistreringsValg } from './OMPUTRegistreringsValg';
import OMPUTPunchFormContainer from './OMPUTPunchFormContainer';

export interface IPunchOMPUTPageStateProps {
    punchState: IPunchState;
    journalpost?: IJournalpost;
    identState: IIdentState;
    forbidden: boolean | undefined;
    punchFormState: IPunchOMPUTFormState;
}

export interface IPunchOMPUTPageDispatchProps {
    setIdentAction: typeof setIdentAction;
    setStepAction: typeof setStepAction;
}

export interface IPunchOMPUTPageQueryProps {
    dok?: string | null;
}

export interface IPunchOMPUTPageComponentProps {
    match?: any;
    step: PunchStep;
    journalpostid?: string;
    paths: IPath[];
}

export interface IPunchOMPUTPageComponentState {
    ident1: string;
    ident2: string;
}

type IPunchOMPUTPageProps = WrappedComponentProps &
    RouteComponentProps &
    IPunchOMPUTPageComponentProps &
    IPunchOMPUTPageStateProps &
    IPunchOMPUTPageDispatchProps &
    IPunchOMPUTPageQueryProps;

export const PunchOMPUTPageComponent: React.FunctionComponent<IPunchOMPUTPageProps> = (props) => {
    const { intl, dok, journalpostid, journalpost, forbidden, step, match, punchFormState } = props;
    const journalposterFraSoknad = punchFormState.soknad?.journalposter;
    const journalposter = (journalposterFraSoknad && Array.from(journalposterFraSoknad)) || [];
    const getPunchPath = (punchStep: PunchStep, values?: any) =>
        getPath(OMPUTPaths, punchStep, values, dok ? { dok } : undefined);

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
                return <OMPUTRegistreringsValg {...commonProps} />;
            case PunchStep.FILL_FORM:
                return <OMPUTPunchFormContainer {...commonProps} intl={intl} id={match.params.id} />;
            case PunchStep.COMPLETED:
                return (
                    <>
                        <AlertStripeInfo className="fullfortmelding">
                            <FormattedMessage id="skjema.sentInn" />
                        </AlertStripeInfo>
                        <div className="punchPage__knapper">
                            <Hovedknapp
                                onClick={() => {
                                    window.location.href = getEnvironmentVariable('K9_LOS_URL');
                                }}
                            >
                                {intlHelper(intl, 'tilbaketilLOS')}
                            </Hovedknapp>
                        </div>
                        {!!punchFormState.innsentSoknad && (
                            <OMPUTSoknadKvittering response={punchFormState.innsentSoknad} intl={intl} />
                        )}
                    </>
                );
        }
    };

    const content = () => {
        if (forbidden) {
            return (
                <AlertStripeAdvarsel>
                    <FormattedMessage id="søk.jp.forbidden" values={{ jpid: journalpostid }} />
                </AlertStripeAdvarsel>
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
    punchState: state.OMSORGSPENGER_FORDELING.punchState,
    journalpost: state.felles.journalpost,
    identState: state.identState,
    forbidden: state.felles.journalpostForbidden,
    punchFormState: state.OMSORGSPENGER_UTBETALING.punchFormState,
    journalposterIAktivPunchForm: state.OMSORGSPENGER_UTBETALING.punchFormState.soknad?.journalposter,
});

const mapDispatchToProps = (dispatch: any) => ({
    setIdentAction: (ident1: string, ident2: string | null) => dispatch(setIdentAction(ident1, ident2)),
    setStepAction: (step: number) => dispatch(setStepAction(step)),
});

const PunchOMPUTPageComponentWithQuery: React.FunctionComponent<IPunchOMPUTPageProps> = (
    props: IPunchOMPUTPageProps
) => {
    const dok = useQuery().get('dok');
    return <PunchOMPUTPageComponent {...props} dok={dok} />;
};

export const PunchOMPUTPage = withRouter(
    injectIntl(connect(mapStateToProps, mapDispatchToProps)(PunchOMPUTPageComponentWithQuery))
);
