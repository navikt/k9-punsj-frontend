import React from 'react';
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';

import LabelValue from 'app/components/skjema/LabelValue';
import { FordelingDokumenttype } from 'app/models/enums';
import { RootStateType } from 'app/state/RootState';
import { finnForkortelseForDokumenttype, finnVisningsnavnForSakstype } from 'app/utils';
import Period from 'app/utils/Period';
import intlHelper from 'app/utils/intlUtils';

import './klassifiseringInfo.css';

const KlassifiseringInfo = () => {
    const intl = useIntl();

    const fagsak = useSelector((state: RootStateType) => state.fordelingState.fagsak);
    const identState = useSelector((state: RootStateType) => state.identState);
    const dokumenttype = useSelector(
        (state: RootStateType) => state.fordelingState.dokumenttype as FordelingDokumenttype,
    );

    const renderLabelValue = (textKey: string, value: string | undefined) => {
        if (!value) return null;
        return (
            <div>
                <LabelValue text={intlHelper(intl, textKey)} value={value} />
            </div>
        );
    };

    return (
        <div className="fagsakContainer">
            {renderLabelValue(
                'fordeling.klassifiserModal.klassifiseringInfo.sakstype',
                fagsak?.sakstype
                    ? finnVisningsnavnForSakstype(fagsak?.sakstype)
                    : finnVisningsnavnForSakstype(finnForkortelseForDokumenttype(dokumenttype) as string),
            )}
            {renderLabelValue('fordeling.klassifiserModal.klassifiseringInfo.søkersID', identState.søkerId)}

            {renderLabelValue('fordeling.klassifiserModal.klassifiseringInfo.saksnummer', fagsak?.fagsakId)}

            {renderLabelValue(
                'fordeling.klassifiserModal.klassifiseringInfo.periode',
                fagsak?.gyldigPeriode
                    ? new Period(fagsak?.gyldigPeriode.fom, fagsak?.gyldigPeriode.tom).prettifyPeriod()
                    : undefined,
            )}
        </div>
    );
};

export default KlassifiseringInfo;
