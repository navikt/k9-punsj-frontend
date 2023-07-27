import React from 'react';

interface Props {
    children: React.ReactNode;
    className?: string;
}

const Row = ({ children, className }: Props) => <div className={`flex flex-wrap ${className}`}>{children}</div>;

export default Row;
