import React from 'react';
import { render } from '@testing-library/react';
import { IntlProvider } from 'react-intl';

import InnholdForDokumenttypeAnnet from '../../../app/fordeling/Komponenter/InnholdForDokumenttypeAnnet';
import JournalpostStatus from '../../../app/models/enums/JournalpostStatus';

type Props = React.ComponentProps<typeof InnholdForDokumenttypeAnnet>;

const createProps = (): Props => ({
    journalpost: {
        journalpostId: '123',
        dokumenter: [],
        journalpostStatus: JournalpostStatus.MOTTATT,
        kanSendeInn: false,
        erSaksbehandler: true,
    },
    sokersIdent: '',
    identState: { søkerId: '', pleietrengendeId: '', annenSokerIdent: null, annenPart: '' },
    fordelingState: {
        erSøkerIdBekreftet: false,
        omfordelingDone: false,
        isAwaitingOmfordelingResponse: false,
        isAwaitingLukkOppgaveResponse: false,
        lukkOppgaveDone: false,
        valgtGosysKategori: '',
        isAwaitingGosysGjelderResponse: false,
    },
    kanJournalforingsoppgaveOpprettesiGosys: false,
    handleSøkerIdChange: vi.fn(),
    handleSøkerIdBlur: vi.fn(),
    lukkJournalpostOppgave: vi.fn<Props['lukkJournalpostOppgave']>(),
    omfordel: vi.fn<Props['omfordel']>(),
    hentGjelderKategorier: vi.fn<Props['hentGjelderKategorier']>(),
    setValgtGosysKategori: vi.fn<Props['setValgtGosysKategori']>(),
});

const renderContent = (props: Props) => (
    <IntlProvider locale="nb" messages={{}} onError={() => undefined}>
        <InnholdForDokumenttypeAnnet {...props} />
    </IntlProvider>
);

describe('InnholdForDokumenttypeAnnet', () => {
    it('henter kategorier først når Gosys er tillatt og tåler at tillatelsen endres', () => {
        const props = createProps();
        const { rerender } = render(renderContent(props));
        expect(props.hentGjelderKategorier).not.toHaveBeenCalled();

        rerender(renderContent({ ...props, kanJournalforingsoppgaveOpprettesiGosys: true }));
        expect(props.hentGjelderKategorier).toHaveBeenCalledTimes(1);

        rerender(renderContent(props));
        expect(props.hentGjelderKategorier).toHaveBeenCalledTimes(1);
    });

    it('henter ikke kategorier som allerede er lastet', () => {
        const props = createProps();
        render(
            renderContent({
                ...props,
                kanJournalforingsoppgaveOpprettesiGosys: true,
                fordelingState: { ...props.fordelingState, gosysGjelderKategorier: { test: 'Testkategori' } },
            }),
        );
        expect(props.hentGjelderKategorier).not.toHaveBeenCalled();
    });
});
