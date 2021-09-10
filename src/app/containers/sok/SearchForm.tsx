import { FormattedMessage, injectIntl, WrappedComponentProps } from 'react-intl';
import React from 'react';
import { AlertStripeAdvarsel, AlertStripeInfo } from 'nav-frontend-alertstriper';
import VerticalSpacer from '../../components/VerticalSpacer';
import SokKnapp from '../../components/knapp/SokKnapp';
import './sok.less';
import { Input, SkjemaGruppe } from 'nav-frontend-skjema';
import { getJournalpost } from '../../state/reducers/FellesReducer';
import { IJournalpost } from '../../models/types';
import { connect } from 'react-redux';
import { RootStateType } from '../../state/RootState';

export interface ISearchFormStateProps {
    journalpost?: IJournalpost;
    notFound: boolean;
    forbidden: boolean;
}

export interface ISearchFormDispatchProps {
    getJournalpost: typeof getJournalpost;
}

export interface ISearchFormComponentState {
    identitetsnummer?: string;
    journalpostid?: string;
}

type ISearchFormProps = WrappedComponentProps &
    ISearchFormStateProps &
    ISearchFormDispatchProps &
    ISearchFormComponentState;

export class SearchFormComponent extends React.Component<ISearchFormProps> {
    state: ISearchFormComponentState = {
        identitetsnummer: '',
        journalpostid: '',
    };

    componentDidMount(): void {
        this.setState({
            identitetsnummer: '',
            journalpostid: '',
            visMapper: false,
            sokMedFnr: false,
        });
    }

    render() {
        const { journalpostid } = this.state;

        const disabled = !journalpostid;

        const onClick = () => {
            if (journalpostid) {
                this.props.getJournalpost(journalpostid);
            }
        };

        if (this.props.journalpost?.journalpostId) {
            window.location.assign(`journalpost/${  journalpostid}`);
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
                    {!!this.props.notFound && (
                        <AlertStripeInfo>
                            <FormattedMessage id="søk.jp.notfound" values={{ jpid: journalpostid }} />
                        </AlertStripeInfo>
                    )}
                    {!!this.props.forbidden && (
                        <AlertStripeAdvarsel>
                            <FormattedMessage id="søk.jp.forbidden" values={{ jpid: journalpostid }} />
                        </AlertStripeAdvarsel>
                    )}
                    {!!this.props.journalpost && !this.props.journalpost?.kanSendeInn && (
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
    getJournalpost: (journalpostid: string) => dispatch(getJournalpost(journalpostid)),
});

export const SearchForm = injectIntl(connect(mapStateToProps, mapDispatchToProps)(SearchFormComponent));
