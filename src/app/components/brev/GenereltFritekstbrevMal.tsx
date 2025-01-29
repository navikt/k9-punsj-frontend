import React from 'react';

import { FormattedMessage } from 'react-intl';
import { Tag } from '@navikt/ds-react';

import { validateText } from 'app/utils/validationHelpers';
import VerticalSpacer from '../VerticalSpacer';
import { FormTextField, FormTextarea } from 'app/components/form';
import { BrevFormKeys, IBrevForm } from './types';

interface Props {
    setVisBrevIkkeSendtInfoboks: () => void;
    setPreviewMessageFeil: () => void;
}

const GenereltFritekstbrevMal: React.FC<Props> = ({ setVisBrevIkkeSendtInfoboks, setPreviewMessageFeil }) => {
    return (
        <>
            <VerticalSpacer sixteenPx />

            <FormTextField<IBrevForm>
                name={`${BrevFormKeys.fritekstbrev}.overskrift`}
                label={<FormattedMessage id={`genereltFritekstbrevMal.fritekstTittel`} />}
                validate={(value) => validateText(value, 200)}
                maxLength={200}
                onChange={() => {
                    setPreviewMessageFeil();
                    setVisBrevIkkeSendtInfoboks();
                }}
            />

            <VerticalSpacer sixteenPx />

            <div className="textareaContainer">
                <FormTextarea<IBrevForm>
                    name={`${BrevFormKeys.fritekstbrev}.brødtekst`}
                    label={<FormattedMessage id={`genereltFritekstbrevMal.innholdIBrev`} />}
                    validate={(value) => validateText(value, 100000)}
                    maxLength={100000}
                    onChange={() => {
                        setPreviewMessageFeil();
                        setVisBrevIkkeSendtInfoboks();
                    }}
                />

                <Tag variant="warning" size="small" className="språkEtikett">
                    <FormattedMessage id={`genereltFritekstbrevMal.språkEtikett.bokmål`} />
                </Tag>
            </div>
        </>
    );
};

export default GenereltFritekstbrevMal;
