import React from 'react';
import { IDokUrlParametre, dokumenterPreviewUtils } from 'app/utils';

export interface IDokumentIdListProps {
    dokUrlParametre: IDokUrlParametre[];
}

const DokumentIdList = ({ dokUrlParametre }: IDokumentIdListProps): React.JSX.Element => (
    <ul className="list-none p-0">
        {dokUrlParametre.map((dok) => (
            <li key={dok.dokumentId}>
                <a href={dokumenterPreviewUtils.pdfUrl(dok)} target="_blank" rel="noopener noreferrer">
                    {dok.dokumentId}
                </a>
            </li>
        ))}
    </ul>
);

export default DokumentIdList;
