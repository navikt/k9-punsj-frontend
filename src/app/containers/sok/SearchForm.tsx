import { AlertStripeAdvarsel, AlertStripeInfo } from 'nav-frontend-alertstriper';
import { Input, SkjemaGruppe } from 'nav-frontend-skjema';
import React from 'react';
import { FormattedMessage, injectIntl, WrappedComponentProps } from 'react-intl';
import { connect } from 'react-redux';
import SokKnapp from '../../components/knapp/SokKnapp';
import VerticalSpacer from '../../components/VerticalSpacer';
import { IJournalpost } from '../../models/types';
import { getJournalpost as fellesReducerGetJournalpost } from '../../state/reducers/FellesReducer';
import { RootStateType } from '../../state/RootState';
import './sok.less';

export interface ISearchFormStateProps {
    journalpost?: IJournalpost;
    notFound: boolean;
    forbidden: boolean;
}

export interface ISearchFormDispatchProps {
    getJournalpost: typeof fellesReducerGetJournalpost;
}

export interface ISearchFormComponentState {
    journalpostid?: string;
}

type ISearchFormProps = WrappedComponentProps &
    ISearchFormStateProps &
    ISearchFormDispatchProps &
    ISearchFormComponentState;

export class SearchFormComponent extends React.Component<ISearchFormProps, ISearchFormComponentState> {
    componentDidMount(): void {
        this.setState({
            journalpostid: '',
        });
    }

    render() {
        const { journalpostid } = this.state;
        const { getJournalpost, journalpost, notFound, forbidden } = this.props;

        const disabled = !journalpostid;

        const onClick = () => {
            if (journalpostid) {
                getJournalpost(journalpostid);
            }
        };

        if (journalpost?.journalpostId) {
            window.location.assign(`journalpost/${journalpostid}`);
        }

        return (
            <div className="container">
                <h1>
                    <FormattedMessage id="søk.overskrift" />
                </h1>
                <SkjemaGruppe>
                    <div className="input-rad">
                        <Input
                            value={journalpostid}
                            bredde="L"
                            onChange={(e) => this.setState({ journalpostid: e.target.value })}
                            label={<FormattedMessage id="søk.label.jpid" />}
                        />
                        <SokKnapp onClick={onClick} tekstId="søk.knapp.label" disabled={disabled} />
                        <VerticalSpacer sixteenPx />
                    </div>
                    {!!notFound && (
                        <AlertStripeInfo>
                            <FormattedMessage id="søk.jp.notfound" values={{ jpid: journalpostid }} />
                        </AlertStripeInfo>
                    )}
                    {!!forbidden && (
                        <AlertStripeAdvarsel>
                            <FormattedMessage id="søk.jp.forbidden" values={{ jpid: journalpostid }} />
                        </AlertStripeAdvarsel>
                    )}
                    {!!journalpost && !journalpost?.kanSendeInn && (
                        <AlertStripeAdvarsel>
                            <FormattedMessage id="fordeling.kanikkesendeinn" />
                        </AlertStripeAdvarsel>
                    )}
                </SkjemaGruppe>
            </div>
        );
    }
}

const mapStateToProps = (state: RootStateType) => ({
    journalpost: state.felles.journalpost,
    notFound: state.felles.journalpostNotFound,
    forbidden: state.felles.journalpostForbidden,
});

const mapDispatchToProps = (dispatch: any) => ({
    getJournalpost: (journalpostid: string) => dispatch(fellesReducerGetJournalpost(journalpostid)),
});

export const SearchForm = injectIntl(connect(mapStateToProps, mapDispatchToProps)(SearchFormComponent));
