import React from 'react';
import { Button } from '@navikt/ds-react';
import { FormattedMessage } from 'react-intl';
import { IJournalpost } from 'app/models/types';
import { isSakstypeMedPleietrengende } from '../utils/fordelingUtils';
import { getEnvironmentVariable } from 'app/utils';

interface Props {
    visJournalførKnapper: boolean;
    disableJournalførKnapper: boolean;
    disableRedirectVidere: boolean;
    visFortsettKnappVedFerdistiltJp: boolean;
    journalpost: IJournalpost;
    handleRedirectVidere: () => void;
    setFortsettEtterKlassifiseringModal: (fortsett: boolean) => void;
    setVisKlassifiserModal: (vis: boolean) => void;
}

const FordelingKnapper: React.FC<Props> = ({
    visJournalførKnapper,
    disableJournalførKnapper,
    disableRedirectVidere,
    visFortsettKnappVedFerdistiltJp,
    journalpost,
    handleRedirectVidere,
    setFortsettEtterKlassifiseringModal,
    setVisKlassifiserModal,
}) => {
    if (visJournalførKnapper) {
        return (
            <div className="flex">
                <div className="mr-4">
                    <Button
                        variant="primary"
                        size="small"
                        onClick={() => {
                            setFortsettEtterKlassifiseringModal(true);
                            setVisKlassifiserModal(true);
                        }}
                        disabled={disableJournalførKnapper || disableRedirectVidere}
                        data-test-id="journalførOgFortsett"
                    >
                        <FormattedMessage id="fordeling.knapp.journalfør.fortsett" />
                    </Button>
                </div>

                <Button
                    variant="secondary"
                    size="small"
                    onClick={() => {
                        setFortsettEtterKlassifiseringModal(false);
                        setVisKlassifiserModal(true);
                    }}
                    disabled={disableJournalførKnapper}
                    data-test-id="journalførOgVent"
                >
                    <FormattedMessage id="fordeling.knapp.journalfør.vent" />
                </Button>
            </div>
        );
    }

    if (visFortsettKnappVedFerdistiltJp) {
        return (
            <div className="flex">
                <div className="mr-4">
                    <Button
                        variant="primary"
                        size="small"
                        onClick={handleRedirectVidere}
                        disabled={disableRedirectVidere}
                    >
                        <FormattedMessage id="fordeling.knapp.ferdistiltJpReservertSaksnummer.fortsett" />
                    </Button>
                </div>

                {isSakstypeMedPleietrengende(journalpost) && (
                    <Button
                        size="small"
                        variant="secondary"
                        onClick={() => {
                            window.location.href = getEnvironmentVariable('K9_LOS_URL');
                        }}
                    >
                        <FormattedMessage id="fordeling.knapp.ferdistiltJpReservertSaksnummer.avbryt" />
                    </Button>
                )}
            </div>
        );
    }

    return null;
};

export default FordelingKnapper;
