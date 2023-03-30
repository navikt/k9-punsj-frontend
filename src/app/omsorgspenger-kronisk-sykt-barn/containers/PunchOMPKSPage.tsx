/* eslint-disable react/jsx-props-no-spreading */
// eslint-disable-next-line import/no-extraneous-dependencies
import 'nav-frontend-tabell-style';
import React from 'react';
import { FormattedMessage, WrappedComponentProps, injectIntl } from 'react-intl';
import { useQueries } from 'react-query';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';

import { Alert, Button, Panel } from '@navikt/ds-react';

import { ApiPath } from 'app/apiConfig';
import Page from 'app/components/page/Page';
import useQuery from 'app/hooks/useQuery';
import { PunchStep } from 'app/models/enums';
import { IJournalpostDokumenter } from 'app/models/enums/Journalpost/JournalpostDokumenter';
import { RootStateType } from 'app/state/RootState';
import { setIdentAction, setStepAction } from 'app/state/actions';
import { get, getEnvironmentVariable, getPath } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';

import { JournalpostPanel } from '../../components/journalpost-panel/JournalpostPanel';
import PdfVisning from '../../components/pdf/PdfVisning';
import { IJournalpost, IPath, IPunchState } from '../../models/types';
import { IIdentState } from '../../models/types/IdentState';
import { IPunchOMPKSFormState } from '../types/PunchOMPKSFormState';
import { OMPKSPunchForm } from './OMPKSPunchForm';
import { OMPKSRegistreringsValg } from './OMPKSRegistreringsValg';
import { ompKSPaths } from './OMPKSRoutes';
import { OMPKSSoknadKvittering } from './SoknadKvittering/OMPKSSoknadKvittering';

export interface IPunchOMPKSPageStateProps {
    punchState: IPunchState;
    journalpost?: IJournalpost;
    identState: IIdentState;
    forbidden: boolean | undefined;
    punchFormState: IPunchOMPKSFormState;
}

export interface IPunchOMPKSPageDispatchProps {
    setIdentAction: typeof setIdentAction;
    setStepAction: typeof setStepAction;
}

export interface IPunchOMPKSPageQueryProps {
    dok?: string | null;
}

export interface IPunchOMPKSPageComponentProps {
    match?: any;
    step: PunchStep;
    journalpostid?: string;
    paths: IPath[];
}

export interface IPunchOMPKSPageComponentState {
    søkerId: string;
    pleietrengendeId: string;
}

type IPunchOMPKSPageProps = WrappedComponentProps &
    RouteComponentProps &
    IPunchOMPKSPageComponentProps &
    IPunchOMPKSPageStateProps &
    IPunchOMPKSPageDispatchProps &
    IPunchOMPKSPageQueryProps;

export const PunchOMPKSPageComponent: React.FunctionComponent<IPunchOMPKSPageProps> = (props) => {
    const { intl, dok, journalpostid, journalpost, forbidden, step, match, punchFormState } = props;
    const journalposterFraSoknad = punchFormState.soknad?.journalposter;
    const journalposter = (journalposterFraSoknad && Array.from(journalposterFraSoknad)) || [];
    const getPunchPath = (punchStep: PunchStep, values?: any) =>
        getPath(ompKSPaths, punchStep, values, dok ? { dok } : undefined);

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
                return <OMPKSRegistreringsValg {...commonProps} />;
            case PunchStep.FILL_FORM:
                return <OMPKSPunchForm {...commonProps} id={match.params.id} />;
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
                        </div>
                        {!!punchFormState.innsentSoknad && (
                            <OMPKSSoknadKvittering response={punchFormState.innsentSoknad} intl={intl} />
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
                <Panel className="omp_ks_punch_form" border>
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
    punchState: state.OMSORGSPENGER_KRONISK_SYKT_BARN.punchState,
    journalpost: state.felles.journalpost,
    identState: state.identState,
    forbidden: state.felles.journalpostForbidden,
    punchFormState: state.OMSORGSPENGER_KRONISK_SYKT_BARN.punchFormState,
    journalposterIAktivPunchForm: state.OMSORGSPENGER_KRONISK_SYKT_BARN.punchFormState.soknad?.journalposter,
});

const mapDispatchToProps = (dispatch: any) => ({
    setIdentAction: (søkerId: string, pleietrengendeId: string | null) =>
        dispatch(setIdentAction(søkerId, pleietrengendeId)),
    setStepAction: (step: number) => dispatch(setStepAction(step)),
});

const PunchOMPKSPageComponentWithQuery: React.FunctionComponent<IPunchOMPKSPageProps> = (
    props: IPunchOMPKSPageProps,
) => {
    const dok = useQuery().get('dok');
    return <PunchOMPKSPageComponent {...props} dok={dok} />;
};

export const PunchOMPKSPage = withRouter(
    injectIntl(connect(mapStateToProps, mapDispatchToProps)(PunchOMPKSPageComponentWithQuery)),
);
