export interface ApiProblemDetail {
    type?: string;
    title?: string;
    status?: number;
    detail?: unknown;
    instance?: string;
    correlationId?: string;
    properties?: Record<string, unknown>;
    [key: string]: unknown;
}
