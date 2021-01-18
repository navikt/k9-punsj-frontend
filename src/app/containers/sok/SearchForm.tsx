import VerticalSpacer from "../../components/VerticalSpacer";
import TextInput from "../../components/skjema/TextInput";
import {FormattedMessage} from "react-intl";
import {Knapp} from "nav-frontend-knapper";
import React, {useEffect, useState} from "react";
import {ISokeSkjema, validerSokeSkjema} from "../../models/forms/sok/SokeSkjema";

import {Form, useFormikContext} from "formik";
import SokKnapp from "../../components/knapp/SokKnapp";
import './sok.less';
import {SkjemaGruppe} from "nav-frontend-skjema";
import {MapperVisning} from "./MapperVisning";

export const SearchForm: React.FunctionComponent = () => {
    const {values, setFieldValue} = useFormikContext<ISokeSkjema>();
    const { identitetsnummer } = values;
    const [ ident, setIdent ] = useState<string| undefined>(undefined);
    const [ visMapper, setVisMapper ] = useState<boolean>(false);

    useEffect(() => {
        if (identitetsnummer) {
            setIdent(identitetsnummer);
        }
    }, [identitetsnummer]);

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
                    <SokKnapp
                        onClick={() => setVisMapper(true)}
                        tekstId="søk.knapp.label"
                        disabled={!identitetsnummer}/>
                </SkjemaGruppe>
            </Form>
            <VerticalSpacer twentyPx={true} />
            {visMapper &&
            <MapperVisning
                ident={identitetsnummer}
            />}

        </div>
    );
}

export default SearchForm;
