/* eslint-disable react/jsx-props-no-spreading */
// eslint-disable-next-line import/no-extraneous-dependencies
import React from 'react';
import { FormattedMessage, WrappedComponentProps, useIntl } from 'react-intl';
import { useQueries } from 'react-query';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';

import { Alert, Button, Panel } from '@navikt/ds-react';

import { ApiPath } from 'app/apiConfig';
import Page from 'app/components/page/Page';
import { IJournalpostDokumenter } from 'app/models/enums/Journalpost/JournalpostDokumenter';
import { RootStateType } from 'app/state/RootState';
import { get, getEnvironmentVariable } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';

import { JournalpostPanel } from '../../components/journalpost-panel/JournalpostPanel';
import PdfVisning from '../../components/pdf/PdfVisning';
import { IJournalpost } from '../../models/types';
import { IPunchPLSFormState } from '../types/PunchPLSFormState';
import { PLSPunchForm } from './PLSPunchForm';
import { PLSRegistreringsValg } from './PLSRegistreringsValg';
import { PLSSoknadKvittering } from './SoknadKvittering/PLSSoknadKvittering';

export interface IPunchPLSPageStateProps {
    journalpost?: IJournalpost;
    forbidden: boolean | undefined;
    punchFormState: IPunchPLSFormState;
}

export interface IPunchPLSPageComponentProps {
    match?: any;
    step: number;
    journalpostid?: string;
}

export interface IPunchPLSPageComponentState {
    søkerId: string;
    pleietrengendeId: string;
}

type IPunchPLSPageProps = WrappedComponentProps &
    RouteComponentProps &
    IPunchPLSPageComponentProps &
    IPunchPLSPageStateProps;

export const PunchPLSPageComponent: React.FunctionComponent<IPunchPLSPageProps> = (props) => {
    const { journalpostid, journalpost, forbidden, match, punchFormState, step } = props;
    const intl = useIntl();
    const journalposterFraSoknad = punchFormState.soknad?.journalposter;
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

    // eslint-disable-next-line consistent-return
    const underFnr = () => {
        // eslint-disable-next-line default-case
        switch (step) {
            case 0:
                return <PLSRegistreringsValg journalpostid={journalpostid || ''} />;
            case 1:
                return <PLSPunchForm journalpostid={journalpostid || ''} id={match.params.id} />;
            case 2:
                return (
                    <>
                        <Alert size="small" variant="info" className="fullfortmelding">
                            <FormattedMessage id="skjema.sentInn" />
                        </Alert>
                        <div className="punchPage__knapper mt-8">
                            <Button
                                onClick={() => {
                                    window.location.href = getEnvironmentVariable('K9_LOS_URL');
                                }}
                            >
                                {intlHelper(intl, 'tilbaketilLOS')}
                            </Button>
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
    journalpost: state.felles.journalpost,
    identState: state.identState,
    forbidden: state.felles.journalpostForbidden,
    punchFormState: state.PLEIEPENGER_I_LIVETS_SLUTTFASE.punchFormState,
    journalposterIAktivPunchForm: state.PLEIEPENGER_I_LIVETS_SLUTTFASE.punchFormState.soknad?.journalposter,
});

export const PunchPLSPage = withRouter(connect(mapStateToProps)(PunchPLSPageComponent));
