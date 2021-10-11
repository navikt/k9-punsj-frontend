import classNames from 'classnames';
import { HoyreChevron, VenstreChevron } from 'nav-frontend-chevron';
import { Flatknapp } from 'nav-frontend-knapper';
import Panel from 'nav-frontend-paneler';
import { Resizable } from 're-resizable';
import React, { useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { ToggleGruppe } from 'nav-frontend-toggle';
import { IJournalpostDokumenter } from 'app/models/enums/Journalpost/JournalpostDokumenter';
import { ApiPath } from '../../apiConfig';
import useQuery from '../../hooks/useQuery';
import { IDokument } from '../../models/types';
import { apiUrl, setQueryInHash } from '../../utils';
import './pdfVisning.less';

const goToDok = (nr: number) => {
    setQueryInHash({ dok: nr.toString() });
};

const dokumentnr = (dokumenter: any = [], dok: string | null): number => {
    let doknr: number;
    doknr = !!dok && /^\d+$/.test(dok) ? Number(dok) : 1;
    if (doknr < 1 || doknr > dokumenter.length) {
        doknr = 1;
    }
    return doknr;
};

interface IPdfVisningProps {
    journalpostDokumenter: IJournalpostDokumenter[];
}

interface IDokumentMedJournalpost {
    dokumentId: string;
    journalpostid: string;
}

const PdfVisning: React.FunctionComponent<IPdfVisningProps> = ({ journalpostDokumenter }) => {
    const dok = useQuery().get('dok');
    const mapDokument = (dokument: IDokument, journalpostid: string) => ({
        journalpostid,
        dokumentId: dokument.dokumentId,
    });
    const dokumenter: IDokumentMedJournalpost[] = journalpostDokumenter.reduce(
        (prev, current) => [
            ...prev,
            ...current.dokumenter.map((dokumentId) => mapDokument(dokumentId, current.journalpostid)),
        ],
        []
    );

    const dokumentnummer = useMemo<number>(() => dokumentnr(dokumenter, dok), [dokumenter, dok]);
    const foersteDokument = dokumenter[dokumentnummer - 1];
    const { dokumentId, journalpostid: journalpostId } = foersteDokument;

    const pdfUrl = useMemo<string>(
        () =>
            apiUrl(ApiPath.DOKUMENT, {
                journalpostId,
                dokumentId,
            }),
        [journalpostId, dokumentId]
    );
    const [showPdf, setShowPdf] = useState<boolean>(true);

    const togglePdf = () => {
        setShowPdf((currentValue) => !currentValue);
    };

    const openPdfWindow = () => {
        window.open(pdfUrl, '_blank', 'toolbar=0,location=0,menubar=0');
        togglePdf();
    };

    return (
        <Resizable
            className={classNames('punch_pdf_wrapper', {
                pdf_closed: !showPdf,
            })}
            enable={{
                top: false,
                right: false,
                bottom: false,
                left: true,
                topRight: false,
                bottomRight: false,
                bottomLeft: false,
                topLeft: false,
            }}
            defaultSize={{ width: '50%', height: '100%' }}
            minWidth={400}
        >
            <Panel className="punch_pdf">
                {dokumenter.length > 1 && (
                    <div className="fleredokumenter">
                        <ToggleGruppe
                            kompakt
                            defaultToggles={dokumenter.map((_: unknown, i: number) => ({
                                children: (
                                    <FormattedMessage
                                        id="dokument.flere"
                                        values={{
                                            doknr: `${i + 1}`,
                                            totalnr: dokumenter.length.toString(),
                                        }}
                                    />
                                ),
                                pressed: dokumentnummer === i + 1,
                                onClick: () => goToDok(i + 1),
                            }))}
                        />
                    </div>
                )}
                <iframe title="pdf" src={pdfUrl} />
                <div className="knapperad">
                    <Flatknapp onClick={togglePdf} className="knapp1">
                        <FormattedMessage id="dokument.skjul" />
                        <HoyreChevron />
                    </Flatknapp>
                    <Flatknapp onClick={openPdfWindow} className="knapp2">
                        <FormattedMessage id="dokument.nyttvindu" />
                    </Flatknapp>
                </div>
                <Flatknapp onClick={togglePdf} className="button_open">
                    <VenstreChevron />
                </Flatknapp>
            </Panel>
        </Resizable>
    );
};

export default PdfVisning;
