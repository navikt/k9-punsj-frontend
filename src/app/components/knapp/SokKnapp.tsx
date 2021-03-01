import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Knapp} from 'nav-frontend-knapper';
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
    <Knapp
        onClick={onClick}
        htmlType="button"
        className="sokknapp"
        disabled={disabled}
    >
        <span>
      <FormattedMessage id={tekstId}/>
    </span>
    </Knapp>
);

export default SokKnapp;
