import * as React from 'react';

import DocumentTitle from 'app/components/document-title/DocumentTitle';

interface IPageProps {
    className?: string;
    title: string;
    topContentRenderer?: () => React.ReactElement<any>;
    children: React.ReactNode;
}

class Page extends React.Component<IPageProps> {
    componentDidMount() {
        window.scrollTo(0, 0);
    }

    render() {
        const { className, title, topContentRenderer, children } = this.props;
        return (
            <>
                <DocumentTitle title={title} />
                {topContentRenderer && topContentRenderer()}
                <div className={className}>{children}</div>
            </>
        );
    }
}

export default Page;
