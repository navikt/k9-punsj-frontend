/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { useQueries, useQuery as useReactQuery } from 'react-query';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { FormattedMessage, injectIntl, WrappedComponentProps } from 'react-intl';
import Page from 'app/components/page/Page';
import { setIdentAction } from 'app/state/actions';
import { RootStateType } from 'app/state/RootState';
import { get } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import { ApiPath } from 'app/apiConfig';
import { IJournalpostDokumenter } from 'app/models/enums/Journalpost/JournalpostDokumenter';
import { AlertStripeAdvarsel } from 'nav-frontend-alertstriper';
import Panel from 'nav-frontend-paneler';
// eslint-disable-next-line import/no-extraneous-dependencies
import 'nav-frontend-tabell-style';
import { IIdentState } from '../../models/types/IdentState';
import { IJournalpost } from '../../models/types';
import { JournalpostPanel } from '../../components/journalpost-panel/JournalpostPanel';
import PdfVisning from '../../components/pdf/PdfVisning';
import { IOMPUTSoknad } from '../types/OMPUTSoknad';
import { hentSoeknad } from '../api';

export interface IPunchOMPUTPageStateProps {
    journalpost?: IJournalpost;
    identState: IIdentState;
    forbidden: boolean | undefined;
    children: JSX.Element;
}

export interface IPunchOMPUTPageDispatchProps {
    setIdentAction: typeof setIdentAction;
}
export interface IPunchOMPUTPageComponentProps {
    match?: any;
    journalpostid?: string;
}

export interface IPunchOMPUTPageComponentState {
    ident1: string;
    ident2: string;
}

type IPunchOMPUTPageProps = WrappedComponentProps &
    RouteComponentProps &
    IPunchOMPUTPageComponentProps &
    IPunchOMPUTPageStateProps &
    IPunchOMPUTPageDispatchProps;

const PunchOMPUTPage: React.FunctionComponent<IPunchOMPUTPageProps> = (props) => {
    const { intl, journalpostid, journalpost, forbidden, match, identState, children } = props;
    const { id } = match.params;

    const { data: soeknad } = useReactQuery<IOMPUTSoknad>(id, () => hentSoeknad(identState.ident1, id));
    const journalposterFraSoknad = soeknad?.journalposter;
    const journalposter = (journalposterFraSoknad && Array.from(journalposterFraSoknad)) || [];

    const queryObjects = journalposter.map((journalpostidentifikator: string) => ({
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
                    {children}
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
    journalpost: state.felles.journalpost,
    identState: state.identState,
    forbidden: state.felles.journalpostForbidden,
});

export default withRouter(injectIntl(connect(mapStateToProps)(PunchOMPUTPage)));
