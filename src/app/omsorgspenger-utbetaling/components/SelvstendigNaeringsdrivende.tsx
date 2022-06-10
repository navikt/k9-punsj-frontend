import { useFormikContext } from 'formik';
import React from 'react';
import { IOMPUTSoknad } from '../types/OMPUTSoknad';

const SelvstendigNaeringsdrivende = () => {
    const { values } = useFormikContext<IOMPUTSoknad>();
    const {
        opptjeningAktivitet: { selvstendigNæringsdrivende },
    } = values;

    return <div>SN </div>;
};

export default SelvstendigNaeringsdrivende;
