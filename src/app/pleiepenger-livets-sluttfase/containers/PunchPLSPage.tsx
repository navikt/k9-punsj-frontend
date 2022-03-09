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
import PdfVisning from '../../components/pdf/PdfVisning';
import { IIdentState } from '../../models/types/IdentState';
import { JournalpostPanel } from '../../components/journalpost-panel/JournalpostPanel';
import { plsPaths } from './PLSRoutes';
import { IJournalpost, IPath, IPunchState } from '../../models/types';
import { IPunchPLSFormState } from '../types/PunchPLSFormState';
import { PLSSoknadKvittering } from './SoknadKvittering/PLSSoknadKvittering';
import { PLSRegistreringsValg } from './PLSRegistreringsValg';
import { PLSPunchForm } from './PLSPunchForm';

export interface IPunchPLSPageStateProps {
    punchState: IPunchState;
    journalpost?: IJournalpost;
    identState: IIdentState;
    forbidden: boolean | undefined;
    punchFormState: IPunchPLSFormState;
}

export interface IPunchPLSPageDispatchProps {
    setIdentAction: typeof setIdentAction;
    setStepAction: typeof setStepAction;
}

export interface IPunchPLSPageQueryProps {
    dok?: string | null;
}

export interface IPunchPLSPageComponentProps {
    match?: any;
    step: PunchStep;
    journalpostid?: string;
    paths: IPath[];
}

export interface IPunchPLSPageComponentState {
    ident1: string;
    ident2: string;
}

type IPunchPLSPageProps = WrappedComponentProps &
    RouteComponentProps &
    IPunchPLSPageComponentProps &
    IPunchPLSPageStateProps &
    IPunchPLSPageDispatchProps &
    IPunchPLSPageQueryProps;

export const PunchPLSPageComponent: React.FunctionComponent<IPunchPLSPageProps> = (props) => {
    const { intl, dok, journalpostid, journalpost, forbidden, step, match, punchFormState } = props;
    const journalposterFraSoknad = punchFormState.soknad?.journalposter;
    const journalposter = (journalposterFraSoknad && Array.from(journalposterFraSoknad)) || [];
    const getPunchPath = (punchStep: PunchStep, values?: any) =>
        getPath(plsPaths, punchStep, values, dok ? { dok } : undefined);

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
                return <PLSRegistreringsValg {...commonProps} />;
            case PunchStep.FILL_FORM:
                return <PLSPunchForm {...commonProps} id={match.params.id} />;
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
                            <PLSSoknadKvittering response={punchFormState.innsentSoknad} intl={intl} />
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
    punchState: state.PLEIEPENGER_I_LIVETS_SLUTTFASE.punchState,
    journalpost: state.felles.journalpost,
    identState: state.identState,
    forbidden: state.felles.journalpostForbidden,
    punchFormState: state.PLEIEPENGER_I_LIVETS_SLUTTFASE.punchFormState,
    journalposterIAktivPunchForm: state.PLEIEPENGER_I_LIVETS_SLUTTFASE.punchFormState.soknad?.journalposter,
});

const mapDispatchToProps = (dispatch: any) => ({
    setIdentAction: (ident1: string, ident2: string | null) => dispatch(setIdentAction(ident1, ident2)),
    setStepAction: (step: number) => dispatch(setStepAction(step)),
});

const PunchPLSPageComponentWithQuery: React.FunctionComponent<IPunchPLSPageProps> = (props: IPunchPLSPageProps) => {
    const dok = useQuery().get('dok');
    return <PunchPLSPageComponent {...props} dok={dok} />;
};

export const PunchPLSPage = withRouter(
    injectIntl(connect(mapStateToProps, mapDispatchToProps)(PunchPLSPageComponentWithQuery))
);
