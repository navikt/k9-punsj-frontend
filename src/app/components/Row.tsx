import React from 'react';

interface Props {
    children: React.ReactNode;
}

const Row = ({ children }: Props) => <div className="flex flex-wrap -mr-6 -ml-6">{children}</div>;

export default Row;
