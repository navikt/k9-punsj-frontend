import React from 'react';

type FeilmeldingProps = {
  feil?: string;
};

const Feilmelding = ({ feil }: FeilmeldingProps): JSX.Element | null => {
  if (!feil) {
    return null;
  }
  return <div className="typo-feilmelding">{feil}</div>;
};

export default Feilmelding;
