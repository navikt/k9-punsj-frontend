/**
 * @jest-environment jsdom
 */

import React from 'react';
import { screen, render } from '@testing-library/react';
import fireEvent from '@testing-library/user-event';
import ValgForDokument from 'app/containers/pleiepenger/Fordeling/Komponenter/ValgForDokument';
import { Sakstype } from 'app/models/enums/Sakstype';
import { IFordelingState } from 'app/models/types';
import { Pleiepenger } from 'app/containers/SakstypeImpls';
import { lukkJournalpostOppgave, setSakstypeAction } from 'app/state/actions';
import journalpostStatus from 'app/models/enums/JournalpostStatus';

const journalpostid = '201';

const fordelingState: IFordelingState = {
    omfordelingDone: false,
    lukkOppgaveDone: false,
    isAwaitingOmfordelingResponse: false,
    isAwaitingSjekkTilK9Response: false,
    isAwaitingLukkOppgaveResponse: false,
    sakstype: Sakstype.PLEIEPENGER_SYKT_BARN,
    erIdent1Bekreftet: false,
    valgtGosysKategori: 'Annet',
};

const props = {
    journalpost: {
        dokumenter: [{ dokumentId: '123' }],
        journalpostId: journalpostid,
        norskIdent: '12345678901',
        kanSendeInn: true,
        erSaksbehandler: true,
        kanOpprettesJournalføringsoppgave: true,
        journalpostStatus: journalpostStatus.MOTTATT,
    },
    erJournalfoertEllerFerdigstilt: false,
    kanJournalforingsoppgaveOpprettesiGosys: false,
    identState: { ident1: '12345678901', ident2: '', annenSokerIdent: '' },
    fordelingState,
    gjelderPleiepengerEllerOmsorgspenger: true,
    lukkJournalpostOppgave,
    konfigForValgtSakstype: Pleiepenger,
    visSakstypeValg: true,
    setSakstypeAction,
};

describe('valg for dokument', () => {
    test('omfordeler', () => {
        // const omfordel = jest.fn();

        // render(<ValgForDokument {...props} omfordel={omfordel} />);
        // fireEvent.click(screen.getByRole('button'));
        // expect(omfordel).toHaveBeenCalledTimes(1);
        // expect(omfordel).toHaveBeenCalledWith(journalpostid, '12345678901', 'Annet');
    });
});
