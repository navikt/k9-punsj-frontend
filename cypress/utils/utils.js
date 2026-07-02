export const getFagsakNavnForSelect = (
    fagsakId,
    dokumenttype,
    reservert,
    behandlingsår,
    historisk,
) =>
    `${fagsakId} (K9 ${dokumenttype}${behandlingsår ? ` ${behandlingsår}` : ''})${reservert ? ' (reservert)' : ''}${historisk ? ' (historisk)' : ''}`;

export const getBarnInfoForSelect = (barn) => `${barn.fornavn} ${barn.etternavn} - ${barn.identitetsnummer}`;
