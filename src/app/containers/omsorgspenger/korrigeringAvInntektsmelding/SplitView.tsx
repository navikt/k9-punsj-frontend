/* eslint-disable react/jsx-props-no-spreading */
import { ApiPath } from 'app/apiConfig';
import { JournalpostPanel } from 'app/components/journalpost-panel/JournalpostPanel';
import Page from 'app/components/page/Page';
import PdfVisning from 'app/components/pdf/PdfVisning';
import 'app/containers/pleiepenger/punchPage.less';
import useQuery from 'app/hooks/useQuery';
import { PunchStep } from 'app/models/enums';
import { IJournalpostDokumenter } from 'app/models/enums/Journalpost/JournalpostDokumenter';
import { IJournalpost, IPath, IPleiepengerPunchState, IPSBSoknad, IPunchFormState } from 'app/models/types';
import { IIdentState } from 'app/models/types/IdentState';
import { setIdentAction, setStepAction } from 'app/state/actions';
import { createOMSKorrigering } from 'app/state/actions/OMSPunchFormActions';
import { RootStateType } from 'app/state/RootState';
import { get } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import { AlertStripeAdvarsel } from 'nav-frontend-alertstriper';
import Panel from 'nav-frontend-paneler';
// eslint-disable-next-line import/no-extraneous-dependencies
import 'nav-frontend-tabell-style';
import React, { useEffect, useState } from 'react';
import { FormattedMessage, injectIntl, WrappedComponentProps } from 'react-intl';
import { useQueries } from 'react-query';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import KorrigeringAvInntektsmeldingForm from './KorrigeringAvInntektsmeldingForm';

export interface IPunchPageStateProps {
    punchState: IPleiepengerPunchState;
    journalpost?: IJournalpost;
    identState: IIdentState;
    forbidden: boolean | undefined;
    punchFormState: IPunchFormState;
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

export const SplitViewComponent: React.FunctionComponent<IPunchPageProps> = (props) => {
    const { intl, journalpostid, journalpost, forbidden, identState } = props;
    const [soknad, setSoknad] = useState<Partial<IPSBSoknad>>({});
    const { ident1 } = identState;
    useEffect(() => {
        createOMSKorrigering(ident1, journalpost?.journalpostId || '', (response, data) => {
            setSoknad(data);
        });
    }, [ident1, journalpost]);
    const journalposterFraSoknad = soknad?.journalposter || [];
    const journalposter = (journalposterFraSoknad && Array.from(journalposterFraSoknad)) || [];

    const queryObjects = journalposter.map((journalpostidentifikator) => ({
        queryKey: ['journalpost', journalpostidentifikator],
        queryFn: () =>
            get(ApiPath.JOURNALPOST_GET, { journalpostId: journalpostidentifikator }).then((res) => res.json()),
    }));

    const queries = useQueries(queryObjects);

    const leftSide = ({ journalpostDokumenter }: { journalpostDokumenter: IJournalpostDokumenter[] }) => (
        <Panel className="omsorgspenger_punch_form" border>
            <JournalpostPanel journalposter={journalpostDokumenter.map((v) => v.journalpostid)} />
            <KorrigeringAvInntektsmeldingForm
                søkerId={ident1}
                søknadId={soknad?.soeknadId || ''}
                journalposter={journalposterFraSoknad}
            />
        </Panel>
    );

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
                {leftSide({ journalpostDokumenter })}
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
    setStepAction: (step: number) => dispatch(setStepAction(step)),
});

const SplitViewComponentWithQuery: React.FunctionComponent<IPunchPageProps> = (props: IPunchPageProps) => {
    const dok = useQuery().get('dok');
    return <SplitViewComponent {...props} dok={dok} />;
};

export const SplitView = withRouter(
    injectIntl(connect(mapStateToProps, mapDispatchToProps)(SplitViewComponentWithQuery))
);
