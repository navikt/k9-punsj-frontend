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
        <div className="fagsakContainer" data-test-id="klassifiseringInfo">
            {renderLabelValue(
                'fordeling.klassifiserModal.klassifiseringInfo.sakstype',
                fagsak?.sakstype
                    ? finnVisningsnavnForSakstype(fagsak?.sakstype)
                    : finnVisningsnavnForSakstype(finnForkortelseForDokumenttype(dokumenttype) as string),
            )}
            {renderLabelValue('fordeling.klassifiserModal.klassifiseringInfo.søkersID', identState.søkerId)}

            {renderLabelValue(
                'fordeling.klassifiserModal.klassifiseringInfo.pleietrengendeID',
                identState.pleietrengendeId,
            )}
            {renderLabelValue('fordeling.klassifiserModal.klassifiseringInfo.annenPartID', identState.annenPart)}

            {renderLabelValue('fordeling.klassifiserModal.klassifiseringInfo.saksnummer', fagsak?.fagsakId)}

            {renderLabelValue(
                'fordeling.klassifiserModal.klassifiseringInfo.periode',
                fagsak?.gyldigPeriode && fagsak?.gyldigPeriode.fom && fagsak?.gyldigPeriode.tom
                    ? new Period(fagsak?.gyldigPeriode.fom, fagsak?.gyldigPeriode.tom).prettifyPeriod()
                    : undefined,
            )}

            {identState.fosterbarn?.map((fosterbarn, index) => (
                <div key={index}>
                    {renderLabelValue('fordeling.klassifiserModal.klassifiseringInfo.fosterbarn', fosterbarn)}
                </div>
            ))}
        </div>
    );
};

export default KlassifiseringInfo;
