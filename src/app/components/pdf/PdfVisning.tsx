import classNames from 'classnames';
import { HoyreChevron, VenstreChevron } from 'nav-frontend-chevron';
import { Flatknapp } from 'nav-frontend-knapper';
import Panel from 'nav-frontend-paneler';
import { Resizable } from 're-resizable';
import React, { useMemo, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { ApiPath } from '../../apiConfig';
import useQuery from '../../hooks/useQuery';
import { IDokument } from '../../models/types';
import { apiUrl, setQueryInHash } from '../../utils';
import './pdfVisning.less';

const goToDok = (nr: number) => {
  setQueryInHash({ dok: nr.toString() });
};

const dokumentnr = (
  dokumenter: IDokument[] = [],
  dok: string | null
): number => {
  let doknr: number;
  doknr = !!dok && /^\d+$/.test(dok) ? Number(dok) : 1;
  if (doknr < 1 || doknr > dokumenter.length) {
    doknr = 1;
  }
  return doknr;
};

interface IPdfVisningProps {
  dokumenter: IDokument[];
  journalpostId: string;
}

const PdfVisning: React.FunctionComponent<IPdfVisningProps> = ({
  dokumenter = [],
  journalpostId,
}) => {
  const dok = useQuery().get('dok');
  const dokumentnummer = useMemo<number>(() => dokumentnr(dokumenter, dok), [
    dokumenter,
    dok,
  ]);
  const dokumentId = dokumenter[dokumentnummer - 1]?.dokumentId;
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
            <div>
              <p>
                <FormattedMessage
                  id="dokument.flere"
                  values={{
                    doknr: `${dokumentnummer}`,
                    totalnr: dokumenter.length.toString(),
                  }}
                />
              </p>
            </div>
            {dokumenter.map((_, i) => (
              <Flatknapp
                key={i}
                onClick={() => goToDok(i + 1)}
                className={dokumentnummer === i + 1 ? 'aktiv' : undefined}
              >
                {i + 1}
              </Flatknapp>
            ))}
          </div>
        )}
        <iframe src={pdfUrl} />
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
