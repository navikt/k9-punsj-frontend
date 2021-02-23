import VerticalSpacer from "../../components/VerticalSpacer";
import TextInput from "../../components/skjema/TextInput";
import {FormattedMessage} from "react-intl";
import React, {useEffect, useState} from "react";
import {ISokeSkjema} from "../../models/forms/sok/SokeSkjema";

import {Form, useFormikContext} from "formik";
import SokKnapp from "../../components/knapp/SokKnapp";
import './sok.less';
import {SkjemaGruppe} from "nav-frontend-skjema";
import {SoknaderVisning} from "./SoknaderVisning";
import DateInput from "../../components/skjema/DateInput";
import {ISoknadPeriode} from "../../models/types/HentSoknad";

export const SearchForm: React.FunctionComponent = () => {
    const {values} = useFormikContext<ISokeSkjema>();
    const { identitetsnummer, fraOgMed, tilOgMed } = values;
    const [ visMapper, setVisMapper ] = useState<boolean>(false);

    const onClick = () => {
        setVisMapper(true);
    }

    const periode = (fra: string, til: string): ISoknadPeriode => {
        return {
            fom: fra,
            tom: til
        }
    }
    return (
        <div className="container">
            <Form>
                <SkjemaGruppe>
                    <TextInput
                        feltnavn="identitetsnummer"
                        bredde="L"
                        label={
                            <FormattedMessage id="søk.label"/>
                        }/>
                    <div className={"container"}>
                        <strong><FormattedMessage id={"søk.info.perioder"}/></strong>
                        <DateInput feltnavn={"fraOgMed"} bredde="M"/>
                        <DateInput feltnavn={"tilOgMed"} bredde="M"/>
                    </div>
                    <SokKnapp
                        onClick={() => onClick()}
                        tekstId="søk.knapp.label"
                        disabled={!identitetsnummer}/>
                </SkjemaGruppe>
            </Form>
            <VerticalSpacer twentyPx={true} />
            {visMapper &&
            <SoknaderVisning
                ident={identitetsnummer}
                periode={periode(fraOgMed, tilOgMed)}
            />}

        </div>
    );
}

export default SearchForm;
