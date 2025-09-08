import React, { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { getOrgnavn } from 'app/api/api';
import { Alert, BodyShort, Button, ErrorMessage, Link, Skeleton, TextField } from '@navikt/ds-react';
import { kunTall } from 'app/utils/patterns';
import { ExternalLinkIcon } from '@navikt/aksel-icons';

export const EregSøk = ({
    orgnavn,
    setOrgnavn,
    orgnr,
    setOrgnr,
}: {
    orgnavn: string | undefined;
    setOrgnavn: (orgnavn: string) => void;
    orgnr: string | undefined;
    setOrgnr: (orgnr: string) => void;
}) => {
    const {
        mutate: getOrganisasjonInfoMutation,
        isError,
        error,
        isPending,
        isSuccess,
        reset,
    } = useMutation({
        mutationFn: (organisasjonsnummer: string) => getOrgnavn(organisasjonsnummer),
        onSuccess: (data, variables) => {
            setOrgnavn(data);
            setOrgnr(variables);
        },
    });

    useEffect(() => {
        if (orgnr && orgnr.length === 9) {
            getOrganisasjonInfoMutation(orgnr);
        }

        if (!orgnr || orgnr.length !== 9) {
            setOrgnavn('');
            reset();
        }
    }, [orgnr]);

    return (
        <div>
            <div className="flex flex-row gap-x-5 items-end">
                <TextField
                    size="small"
                    label="Organisasjonsnummer (9 siffer)"
                    onChange={(event) => {
                        const filteredValue = event.target.value.replace(kunTall, '');
                        setOrgnr(filteredValue);
                    }}
                    value={orgnr}
                    maxLength={9}
                />
                <div>
                    <Link href="https://www.brreg.no/enhet/sok" target="_blank" className="no-underline">
                        <Button variant="tertiary" icon={<ExternalLinkIcon />} type="button" size="small">
                            Gå til Brønnøysundregistrene
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="mt-4">
                {isPending && <Skeleton variant="text" width="100%" height="50px" />}
                {orgnavn && (
                    <div>
                        <BodyShort size="small">{orgnavn}</BodyShort>
                    </div>
                )}
                {isError && <ErrorMessage size="small">{error?.message}</ErrorMessage>}
                {!orgnavn && isSuccess && (
                    <Alert size="small" variant="warning">
                        Fant ingen institusjon med organisasjonsnummer {orgnr}.
                    </Alert>
                )}
            </div>
        </div>
    );
};
