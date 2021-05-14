import VerticalSpacer from "../../components/VerticalSpacer";
import {FormattedMessage, injectIntl, WrappedComponentProps} from "react-intl";
import React from "react";

import {Form} from "formik";
import SokKnapp from "../../components/knapp/SokKnapp";
import './sok.less';
import {Input, SkjemaGruppe} from "nav-frontend-skjema";
import {SoknaderVisning} from "./SoknaderVisning";
import {ToggleKnapp} from "nav-frontend-toggle";
import {getJournalpost} from "../../state/reducers/FellesReducer";
import {IJournalpost} from "../../models/types";
import {connect} from "react-redux";
import {RootStateType} from "../../state/RootState";


export interface ISearchFormStateProps {
    journalpost?: IJournalpost;
}

export interface ISearchFormDispatchProps {
    getJournalpost: typeof getJournalpost;
}

export interface ISearchFormComponentState {
    identitetsnummer?: string,
    journalpostid?: string;
    visMapper?: boolean;
    sokMedFnr?: boolean;
}

type ISearchFormProps = WrappedComponentProps & ISearchFormStateProps & ISearchFormDispatchProps & ISearchFormComponentState;

export class SearchFormComponent extends React.Component<ISearchFormProps> {
    state: ISearchFormComponentState = {
        identitetsnummer: '',
        journalpostid: '',
        visMapper: false,
        sokMedFnr: false
    };

    componentDidMount(): void {
        this.setState({
            identitetsnummer: '',
            journalpostid: '',
            visMapper: false,
            sokMedFnr: false
        });
    }

    render() {


        const { identitetsnummer, journalpostid, sokMedFnr, visMapper } = this.state;

        const disabled = sokMedFnr ? !identitetsnummer : !journalpostid;

        const onClick = () => {
            if (sokMedFnr) {
                this.setState({visMapper: true});
            } else {
                if (journalpostid) {this.props.getJournalpost(journalpostid);}
            }
        }

        if (this.props.journalpost?.journalpostId) {window.location.assign('journalpost/' + journalpostid)}

        return (
            <div className="container">
                    <SkjemaGruppe>
                        <ToggleKnapp
                            // @ts-ignore
                            className={sokMedFnr ? "venstreKnappAktiv" : "venstreKnapp"}
                            onClick={() => this.setState({sokMedFnr: true})}
                        >
                            Søk med fødselsnummer
                        </ToggleKnapp>
                        <ToggleKnapp
                            // @ts-ignore
                            className={sokMedFnr ? "hoyreKnapp" : "hoyreKnappAktiv"}
                            onClick={() => this.setState({sokMedFnr: false})}
                        >
                            Søk med journalpost-ID
                        </ToggleKnapp>
                        <VerticalSpacer eightPx={true}/>
                        {sokMedFnr &&
                        <Input
                            value={identitetsnummer}
                            bredde="L"
                            label={
                                <FormattedMessage id="søk.label.fnr"/>
                            }
                            onChange={(e) => this.setState({identitetsnummer: e.target.value})}/>}
                        {!sokMedFnr &&
                        <Input
                            value={journalpostid}
                            bredde="L"
                            onChange={(e) => this.setState({journalpostid: e.target.value})}
                            label={
                                <FormattedMessage id="søk.label.jpid"/>
                            }/>}
                        <SokKnapp
                            onClick={onClick}
                            tekstId="søk.knapp.label"
                            disabled={disabled}/>

                    </SkjemaGruppe>
                <VerticalSpacer twentyPx={true}/>
                {visMapper && identitetsnummer &&
                <SoknaderVisning
                    ident={identitetsnummer}
                />}

            </div>
        );
    }
};

const mapStateToProps = (state: RootStateType) => ({
    journalpost: state.felles.journalpost,
});

const mapDispatchToProps = (dispatch: any) => ({
    getJournalpost: (journalpostid: string) =>
        dispatch(getJournalpost(journalpostid)),
});

export const SearchForm = injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(SearchFormComponent)
);
