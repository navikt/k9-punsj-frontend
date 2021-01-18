import React, {useEffect, useState} from 'react';
import SearchForm from "./SearchForm";
import SkjemaContext from "../../components/skjema/SkjemaContext";
import {validerSokeSkjema} from "../../models/forms/sok/SokeSkjema";

export const FnrSokIndex: React.FunctionComponent = () => {


    return (
        <SkjemaContext initialValues={{}} onSubmitCallback={() => undefined} validerSkjema={validerSokeSkjema}>
            <SearchForm
            /></SkjemaContext>
    )
};

export default FnrSokIndex;
