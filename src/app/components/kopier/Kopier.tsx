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
    return (
        <button aria-label="Kopier" className="kopier" type="button" onClick={() => kopierTilClipboard(verdi)}>
            <Copy />
        </button>
    );
}
