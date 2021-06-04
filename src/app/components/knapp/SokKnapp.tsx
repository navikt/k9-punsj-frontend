import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Hovedknapp, Knapp} from 'nav-frontend-knapper';
import './knapper.less';

interface ISokKnappProps {
    onClick: VoidFunction;
    tekstId: string;
    disabled: boolean;
}

const SokKnapp: React.FunctionComponent<ISokKnappProps> = ({
onClick,
tekstId,
disabled,
                                                               }) => (
    <Hovedknapp
        onClick={() => onClick()}
        mini={true}
        className="sokknapp"
        disabled={disabled}
    >
      <FormattedMessage id={tekstId}/>
    </Hovedknapp>
);

export default SokKnapp;
