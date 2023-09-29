/* eslint-disable react/jsx-props-no-spreading */
// eslint-disable-next-line import/no-extraneous-dependencies
import React from 'react';
import { FormattedMessage, WrappedComponentProps, injectIntl } from 'react-intl';
import { useQueries, useQuery } from 'react-query';
import { connect } from 'react-redux';
import { RouteComponentProps, useHistory, withRouter } from 'react-router';

import { Alert, Panel } from '@navikt/ds-react';

import { ApiPath } from 'app/apiConfig';
import Page from 'app/components/page/Page';
import { IJournalpostDokumenter } from 'app/models/enums/Journalpost/JournalpostDokumenter';
import { RootStateType } from 'app/state/RootState';
import { get } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';

import { JournalpostPanel } from '../../components/journalpost-panel/JournalpostPanel';
import PdfVisning from '../../components/pdf/PdfVisning';
import { IJournalpost } from '../../models/types';
import { IIdentState } from '../../models/types/IdentState';
import { hentSoeknad } from '../api';
import './punchOLPPage.less';

export interface IPunchOLPPageStateProps {
    journalpost?: IJournalpost;
    identState: IIdentState;
    forbidden: boolean | undefined;
    children: JSX.Element;
}

export interface IPunchOLPPageComponentProps {
    journalpostid?: string;
}

export interface IPunchOLPPageComponentState {
    søkerId: string;
    pleietrengendeId: string;
}

type IPunchOLPPageProps = WrappedComponentProps &
    RouteComponentProps &
    IPunchOLPPageComponentProps &
    IPunchOLPPageStateProps;

const PunchOLPPage: React.FunctionComponent<IPunchOLPPageProps> = (props) => {
    const { intl, journalpostid, journalpost, forbidden, identState, children } = props;
    const id = useHistory().location.pathname.split('skjema/')[1];
    const { data: soeknad } = useQuery(id, () => hentSoeknad(identState.søkerId, id));
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
                    {children}
                </Panel>
                {!!journalpostDokumenter.length && <PdfVisning journalpostDokumenter={journalpostDokumenter} />}
            </div>
        );
    };

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

export default withRouter(injectIntl(connect(mapStateToProps)(PunchOLPPage)));
