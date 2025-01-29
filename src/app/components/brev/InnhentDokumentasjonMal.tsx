import React from 'react';

import { FormattedMessage } from 'react-intl';
import { Tag } from '@navikt/ds-react';

import { validateText } from 'app/utils/validationHelpers';
import VerticalSpacer from '../VerticalSpacer';
import { FormTextarea } from 'app/components/form';
import { BrevFormKeys, IBrevForm } from './types';

interface InnhentDokumentasjonMalProps {
    setVisBrevIkkeSendtInfoboks: () => void;
    setPreviewMessageFeil: () => void;
}

const InnhentDokumentasjonMal: React.FC<InnhentDokumentasjonMalProps> = ({
    setVisBrevIkkeSendtInfoboks,
    setPreviewMessageFeil,
}) => {
    return (
        <>
            <VerticalSpacer sixteenPx />

            <div className="textareaContainer">
                <FormTextarea<IBrevForm>
                    name={BrevFormKeys.fritekst}
                    label={<FormattedMessage id="innhentDokumentasjonMal.fritekstTittel" />}
                    validate={(value) => validateText(value, 4000)}
                    maxLength={4000}
                    onChange={() => {
                        setVisBrevIkkeSendtInfoboks();
                        setPreviewMessageFeil();
                    }}
                />

                <Tag variant="warning" size="small" className="språkEtikett">
                    <FormattedMessage id="innhentDokumentasjonMal.språkEtikett.bokmål" />
                </Tag>
            </div>
        </>
    );
};

export default InnhentDokumentasjonMal;
