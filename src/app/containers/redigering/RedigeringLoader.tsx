import React from 'react';
import { connect } from 'react-redux';

interface IRedigeringProps {
    renderOnLoadComplete: () => React.ReactNode;
}

export const RedigeringLoaderImpl: React.FunctionComponent<IRedigeringProps> = ({ renderOnLoadComplete }) => <>{renderOnLoadComplete()}</>;

export default connect(RedigeringLoaderImpl);
