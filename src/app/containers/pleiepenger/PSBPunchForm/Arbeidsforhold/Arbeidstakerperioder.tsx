import { pfArbeidstaker } from 'app/containers/pleiepenger/pfArbeidstaker';
import React from 'react';
import { useIntl } from 'react-intl';
import { Arbeidstaker } from '../../../../models/types/Arbeidstaker';
import { IPSBSoknad } from '../../../../models/types/PSBSoknad';
import { Listepaneler } from '../../Listepaneler';

interface ArbeidstakerperioderProps {
    soknad: IPSBSoknad;
    initialArbeidstaker: Arbeidstaker;
    updateSoknad: (soknad: Partial<IPSBSoknad>) => (dispatch: any) => Promise<Response>;
    updateSoknadState: (soknad: Partial<IPSBSoknad>, showStatus?: boolean) => void;
    getErrorMessage: (attribute: string, indeks?: number) => string | undefined;
}

const Arbeidstakerperioder = ({
    soknad,
    initialArbeidstaker,
    updateSoknad,
    updateSoknadState,
    getErrorMessage,
}: ArbeidstakerperioderProps): JSX.Element => {
    const intl = useIntl();
    const { arbeidstid } = soknad;

    return (
        <Listepaneler
            intl={intl}
            items={arbeidstid?.arbeidstakerList || []}
            component={pfArbeidstaker(soknad.soekerId)}
            panelid={(i) => `arbeidstakerpanel_${i}`}
            initialItem={initialArbeidstaker}
            editSoknad={(arbeidstakerList) =>
                updateSoknad({
                    arbeidstid: {
                        ...arbeidstid,
                        arbeidstakerList,
                    },
                })
            }
            editSoknadState={(arbeidstakerList, showStatus) =>
                updateSoknadState(
                    {
                        arbeidstid: {
                            ...arbeidstid,
                            arbeidstakerList,
                        },
                    },
                    showStatus
                )
            }
            textLeggTil="skjema.arbeid.arbeidstaker.leggtilperiode"
            textFjern="skjema.arbeid.arbeidstaker.fjernarbeidsgiver"
            panelClassName="arbeidstakerpanel"
            feilkodeprefiks="arbeidstid.arbeidstaker"
            getErrorMessage={getErrorMessage}
            kanHaFlere
            medSlettKnapp
        />
    );
};
export default Arbeidstakerperioder;
