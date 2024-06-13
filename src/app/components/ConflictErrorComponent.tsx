import { WrenchIcon } from '@navikt/aksel-icons';
import { Alert, AlertProps, Button, Loader } from '@navikt/ds-react';
import { getEnvironmentVariable } from 'app/utils';
import React from 'react';
import { FormattedMessage } from 'react-intl';

type AlertInfo = {
    variant: AlertProps['variant'];
    textId: string;
    goToLos: boolean;
};

interface Props {
    journalpostid: string;
    ingenJp: boolean;
    pendingLukkDebuggJp: boolean;
    lukkDebuggJpStatus?: number;
    handleLukkDebugg: () => void;
}

const getAlertInfo = (status: number): AlertInfo => {
    switch (status) {
        case 409:
            return { variant: 'warning', textId: 'startPage.feil.ikkeStøttet', goToLos: false };
        case 200:
            return { variant: 'success', textId: 'startPage.feil.ikkeStøttet.lukkDebugg.status.200', goToLos: true };
        case 400:
            return { variant: 'success', textId: 'startPage.feil.ikkeStøttet.lukkDebugg.status.400', goToLos: true };
        case 404:
            return { variant: 'success', textId: 'startPage.feil.ikkeStøttet.lukkDebugg.status.404', goToLos: true };
        default:
            return { variant: 'error', textId: 'startPage.feil.ikkeStøttet.lukkDebugg.status.ukjent', goToLos: true };
    }
};

export const ConflictErrorComponent: React.FC<Props> = ({
    journalpostid,
    ingenJp,
    pendingLukkDebuggJp,
    lukkDebuggJpStatus,
    handleLukkDebugg,
}: Props) => {
    const { variant, textId, goToLos } = getAlertInfo(lukkDebuggJpStatus || 409);

    return (
        <div className="flex justify-center py-4">
            <Alert size="small" variant={variant} className="text-left w-[376px]">
                <FormattedMessage
                    id={ingenJp ? 'startPage.feil.ikkeStøttet.lukkDebugg.ingenJp' : textId}
                    values={{ status: lukkDebuggJpStatus, jp: journalpostid }}
                />
                <div className="my-3">
                    <Button
                        variant="primary"
                        size="small"
                        icon={pendingLukkDebuggJp ? <Loader size="medium" /> : undefined}
                        onClick={() => {
                            if (goToLos) {
                                window.location.href = getEnvironmentVariable('K9_LOS_URL');
                            } else {
                                handleLukkDebugg();
                            }
                        }}
                    >
                        <FormattedMessage
                            id={`startPage.feil.ikkeStøttet.${goToLos ? 'gåTilLos' : 'lukkDebugg'}.btn`}
                        />
                    </Button>
                </div>
            </Alert>
        </div>
    );
};
