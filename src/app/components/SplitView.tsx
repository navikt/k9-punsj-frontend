/* eslint-disable react/jsx-props-no-spreading */
import { ApiPath } from 'app/apiConfig';
import { JournalpostPanel } from 'app/components/journalpost-panel/JournalpostPanel';
import Page from 'app/components/page/Page';
import PdfVisning from 'app/components/pdf/PdfVisning';
import { IPunchPageDispatchProps, IPunchPageQueryProps } from 'app/containers/pleiepenger/PunchPage';
import 'app/containers/pleiepenger/punchPage.less';
import useQuery from 'app/hooks/useQuery';
import { IJournalpostDokumenter } from 'app/models/enums/Journalpost/JournalpostDokumenter';
import { IJournalpost, IPSBSoknad } from 'app/models/types';
import { RootStateType } from 'app/state/RootState';
import { get } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import { AlertStripeAdvarsel } from 'nav-frontend-alertstriper';
import Panel from 'nav-frontend-paneler';
// eslint-disable-next-line import/no-extraneous-dependencies
import 'nav-frontend-tabell-style';
import React from 'react';
import { FormattedMessage, injectIntl, WrappedComponentProps } from 'react-intl';
import { useQueries } from 'react-query';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';

export interface IPunchPageStateProps {
    journalpost?: IJournalpost;
    forbidden: boolean | undefined;
}

export interface IPunchPageComponentProps {
    journalpostid?: string;
    soknad?: Partial<IPSBSoknad>;
}

export interface IPunchPageComponentState {
    søkerId: string;
    pleietrengendeId: string;
}

type IPunchPageProps = WrappedComponentProps &
    RouteComponentProps &
    IPunchPageComponentProps &
    IPunchPageStateProps &
    IPunchPageDispatchProps &
    IPunchPageQueryProps;

export const SplitViewComponent: React.FC<IPunchPageProps> = (props) => {
    const { intl, journalpostid, journalpost, forbidden, soknad, children } = props;
    const journalposterFraSoknad = soknad?.journalposter || [];
    const journalposter = (journalposterFraSoknad && Array.from(journalposterFraSoknad)) || [];

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

    const leftSide = ({ journalpostDokumenter }: { journalpostDokumenter: IJournalpostDokumenter[] }) => (
        <Panel className="omsorgspenger_punch_form" border>
            <JournalpostPanel journalposter={journalpostDokumenter.map((v) => v.journalpostid)} />
            {children}
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
                    const data = query?.data;

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
    journalpost: state.felles.journalpost,
    forbidden: state.felles.journalpostForbidden,
});

const SplitViewComponentWithQuery: React.FunctionComponent<IPunchPageProps> = (props: IPunchPageProps) => (
    <SplitViewComponent {...props} />
);

export const SplitView = withRouter(injectIntl(connect(mapStateToProps)(SplitViewComponentWithQuery)));
