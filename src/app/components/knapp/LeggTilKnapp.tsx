import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Knapp } from 'nav-frontend-knapper';
import PlussSVG from '../../assets/SVG/PlussSVG';
import './knapper.less';

interface ILeggTilKnappProps {
  onClick: VoidFunction;
  tekstId: string;
}

const LeggTilKnapp: React.FunctionComponent<ILeggTilKnappProps> = ({
  onClick,
  tekstId,
}) => (
  <Knapp
    onClick={onClick}
    htmlType="button"
    type="flat"
    mini={true}
    className="leggtilknapp"
  >
    <PlussSVG />
    <span>
      <FormattedMessage id={tekstId} />
    </span>
  </Knapp>
);

export default LeggTilKnapp;
