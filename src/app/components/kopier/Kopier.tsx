import React from 'react';
import { Copy } from '@navikt/ds-icons';
import './kopier.less';

export default function Kopier({ verdi }: { verdi?: string }): JSX.Element | null {
    const kopierTilClipboard = (v: string) => {
        navigator.clipboard.writeText(v);
    };

    if (!verdi) {
        return null;
    }
    return <Copy className="kopier" onClick={() => kopierTilClipboard(verdi)} />;
}
