export const getFagsakNavnForSelect = (fagsakId, dokumenttype, reservert) =>
    `${fagsakId} (K9 ${dokumenttype})${reservert ? ' (reservert)' : ''}`;

export const getBarnInfoForSelect = (barn) => `${barn.fornavn} ${barn.etternavn} - ${barn.identitetsnummer}`;
