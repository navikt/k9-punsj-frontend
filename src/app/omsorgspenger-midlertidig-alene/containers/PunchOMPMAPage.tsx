/* eslint-disable react/jsx-props-no-spreading */
import { Alert, Button, Panel } from '@navikt/ds-react';
import { ApiPath } from 'app/apiConfig';
import Page from 'app/components/page/Page';
import useQuery from 'app/hooks/useQuery';
import { PunchStep } from 'app/models/enums';
import { IJournalpostDokumenter } from 'app/models/enums/Journalpost/JournalpostDokumenter';
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
import { IJournalpost, IPath, IPunchState } from '../../models/types';
import { IIdentState } from '../../models/types/IdentState';
import { IPunchOMPMAFormState } from '../types/PunchOMPMAFormState';
import OMPMAPunchFormContainer from './OMPMAPunchFormContainer';
import { OMPMARegistreringsValg } from './OMPMARegistreringsValg';
import { OMPMAPaths } from './OMPMARoutes';
import { OMPMASoknadKvittering } from './SoknadKvittering/OMPMASoknadKvittering';

export interface IPunchOMPMAPageStateProps {
    punchState: IPunchState;
    journalpost?: IJournalpost;
    identState: IIdentState;
    forbidden: boolean | undefined;
    punchFormState: IPunchOMPMAFormState;
}

export interface IPunchOMPMAPageDispatchProps {
    setIdentAction: typeof setIdentAction;
    setStepAction: typeof setStepAction;
}

export interface IPunchOMPMAPageQueryProps {
    dok?: string | null;
}

export interface IPunchOMPMAPageComponentProps {
    match?: any;
    step: PunchStep;
    journalpostid?: string;
    paths: IPath[];
}

export interface IPunchOMPMAPageComponentState {
    søkerId: string;
    pleietrengendeId: string;
}

type IPunchOMPMAPageProps = WrappedComponentProps &
    RouteComponentProps &
    IPunchOMPMAPageComponentProps &
    IPunchOMPMAPageStateProps &
    IPunchOMPMAPageDispatchProps &
    IPunchOMPMAPageQueryProps;

export const PunchOMPMAPageComponent: React.FunctionComponent<IPunchOMPMAPageProps> = (props) => {
    const { intl, dok, journalpostid, journalpost, forbidden, step, match, punchFormState } = props;
    const journalposterFraSoknad = punchFormState.soknad?.journalposter;
    const journalposter = (journalposterFraSoknad && Array.from(journalposterFraSoknad)) || [];
    const getPunchPath = (punchStep: PunchStep, values?: any) =>
        getPath(OMPMAPaths, punchStep, values, dok ? { dok } : undefined);

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
                return <OMPMARegistreringsValg {...commonProps} />;
            case PunchStep.FILL_FORM:
                return <OMPMAPunchFormContainer {...commonProps} intl={intl} id={match.params.id} />;
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
                            <OMPMASoknadKvittering response={punchFormState.innsentSoknad} intl={intl} />
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
                <Panel className="punch_form" border>
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

const PunchOMPMAPageComponentWithQuery: React.FunctionComponent<IPunchOMPMAPageProps> = (
    props: IPunchOMPMAPageProps
) => {
    const dok = useQuery().get('dok');
    return <PunchOMPMAPageComponent {...props} dok={dok} />;
};

export const PunchOMPMAPage = withRouter(
    injectIntl(connect(mapStateToProps, mapDispatchToProps)(PunchOMPMAPageComponentWithQuery))
);
