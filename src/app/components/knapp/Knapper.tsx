import * as React from 'react';
import './knapper.less';

const Knapper: React.FunctionComponent = ({ children }) => {
  return <div className="knapper">{children}</div>;
};

export default Knapper;
