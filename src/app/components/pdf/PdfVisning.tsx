import classNames from 'classnames';
import { Resizable } from 're-resizable';
import React, { useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { Back, Next } from '@navikt/ds-icons';
import { Button, Panel, ToggleGroup } from '@navikt/ds-react';

import { IJournalpostDokumenter } from 'app/models/enums/Journalpost/JournalpostDokumenter';

import { ApiPath } from '../../apiConfig';
import useQuery from '../../hooks/useQuery';
import { IDokument } from '../../models/types';
import { apiUrl, setQueryInHash } from '../../utils';
import './pdfVisning.less';

const dokumentnr = (dok: string | null, dokumenter: IDokumentMedJournalpost[] = []): number => {
    let doknr: number;
    doknr = !!dok && /^\d+$/.test(dok) ? Number(dok) : 1;
    if (doknr < 1 || doknr > dokumenter.length) {
        doknr = 1;
    }
    return doknr;
};

const goToDok = (dok: string) => {
    setQueryInHash({ dok });
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

    const [aktivtDokument, setAktivtDokument] = useState<string>(dok || '1');

    const mapDokument = (dokument: IDokument, journalpostid: string) => ({
        journalpostid,
        dokumentId: dokument.dokumentId,
    });
    const dokumenter: IDokumentMedJournalpost[] = journalpostDokumenter?.reduce(
        (prev, current) => [
            ...prev,
            // eslint-disable-next-line no-unsafe-optional-chaining
            ...current.dokumenter?.map((dokument) => mapDokument(dokument, current.journalpostid)),
        ],
        [],
    );

    const dokumentnummer = useMemo<number>(() => dokumentnr(dok, dokumenter), [dokumenter, dok]);
    const foersteDokument = dokumenter[dokumentnummer - 1];
    const { dokumentId, journalpostid: journalpostId } = foersteDokument;

    const pdfUrl = useMemo<string>(
        () =>
            apiUrl(ApiPath.DOKUMENT, {
                journalpostId,
                dokumentId,
            }),
        [journalpostId, dokumentId],
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
                        <ToggleGroup
                            onChange={(v) => {
                                setAktivtDokument(v);
                                goToDok(v);
                            }}
                            value={aktivtDokument}
                        >
                            {dokumenter.map((_: unknown, i: number, array: unknown[]) => (
                                <ToggleGroup.Item value={String(i + 1)}>
                                    {`Dokument ${i + 1} / ${array.length}`}
                                </ToggleGroup.Item>
                            ))}
                        </ToggleGroup>
                    </div>
                )}
                <iframe title="pdf" src={pdfUrl} />
                <div className="knapperad">
                    <Button
                        variant="tertiary"
                        onClick={togglePdf}
                        className="knapp1"
                        icon={<Next />}
                        iconPosition="right"
                    >
                        <FormattedMessage id="dokument.skjul" />
                    </Button>
                    <Button variant="tertiary" onClick={openPdfWindow} className="knapp2">
                        <FormattedMessage id="dokument.nyttvindu" />
                    </Button>
                </div>
                <Button icon={<Back />} variant="tertiary" onClick={togglePdf} className="button_open" />
            </Panel>
        </Resizable>
    );
};

export default PdfVisning;
