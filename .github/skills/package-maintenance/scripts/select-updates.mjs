import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';

const execFileAsync = promisify(execFile);
const MAX_OUTPUT = 8 * 1024 * 1024;
const QUERY_TIMEOUT = 30_000;
const CONCURRENCY = 4;
const EXACT_VERSION = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/;

function versionParts(version) {
    const match = EXACT_VERSION.exec(version);
    if (!match || match.slice(1, 4).some((part) => !Number.isSafeInteger(Number(part)))) return null;
    return { major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3]), prerelease: match[4] ?? null };
}

function compareStable(a, b) {
    const left = versionParts(a);
    const right = versionParts(b);
    return (
        left.major - right.major ||
        left.minor - right.minor ||
        left.patch - right.patch ||
        Number(Boolean(left.prerelease)) * -1 + Number(Boolean(right.prerelease))
    );
}

function readInfo(raw) {
    let parsed;
    try {
        parsed = JSON.parse(raw);
    } catch {
        parsed = raw
            .trim()
            .split(/\r?\n/)
            .filter(Boolean)
            .map((line) => JSON.parse(line));
    }
    const candidates = Array.isArray(parsed) ? parsed : [parsed];
    const info = candidates.find((value) => value && typeof value === 'object' && value.versions && value.time);
    if (!info || !Array.isArray(info.versions) || typeof info.time !== 'object')
        throw new Error('Ugyldig metadataformat');
    return info;
}

function globRegex(pattern) {
    if (typeof pattern !== 'string' || !/^(?:@[\w.*-]+\/)?[\w.*-]+$/.test(pattern) || pattern.includes('**'))
        return null;
    return new RegExp(
        `^${pattern
            .split('*')
            .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
            .join('.*')}$`,
    );
}

function isExempt(name, patterns) {
    return patterns.some((pattern) => globRegex(pattern)?.test(name));
}

export function selectUpdate({ current, metadata, cutoff, ageExempt = false }) {
    const currentParts = versionParts(current);
    if (!currentParts) return { status: 'skipped', reason: 'Ugyldig eller ikke-eksakt versjon' };
    const stable = metadata.versions.filter((version) => {
        const parts = versionParts(version);
        return parts && !parts.prerelease && parts.major === currentParts.major;
    });
    const eligible = stable.filter((version) => {
        const publishedAt = metadata.time[version];
        return (
            typeof publishedAt === 'string' &&
            Number.isFinite(Date.parse(publishedAt)) &&
            (ageExempt || Date.parse(publishedAt) < Date.parse(cutoff))
        );
    });
    const newer = (items) => items.filter((version) => compareStable(version, current) > 0).sort(compareStable);
    const targets = newer(eligible);
    const unknownNewer = stable.filter(
        (version) =>
            compareStable(version, current) > 0 &&
            (!metadata.time[version] || !Number.isFinite(Date.parse(metadata.time[version]))),
    );
    const latestPublished = newer(
        stable.filter(
            (version) =>
                typeof metadata.time[version] === 'string' && Number.isFinite(Date.parse(metadata.time[version])),
        ),
    );
    const result = {
        status: 'unchanged',
        reason: 'Ingen nyere kvalifisert stabil versjon i samme hovedversjon',
        target: null,
        publishedAt: null,
        cooldownBlocked: null,
        majorFollowup: null,
    };
    if (unknownNewer.length) {
        result.status = 'error';
        result.reason = 'Publiseringstid mangler; versjonen er utelatt av sikkerhetshensyn';
    } else if (targets.length) {
        result.status = 'update';
        result.reason = 'Nyere stabil versjon i samme hovedversjon';
        result.target = targets.at(-1);
        result.publishedAt = metadata.time[result.target];
    } else {
        if (!ageExempt && latestPublished.length)
            result.reason = 'Nyeste versjon i samme hovedversjon er innenfor nedkjølingstiden';
    }
    const blocked = ageExempt
        ? []
        : latestPublished.filter((version) => Date.parse(metadata.time[version]) >= Date.parse(cutoff));
    if (blocked.length) {
        const version = blocked.at(-1);
        result.cooldownBlocked = { version, publishedAt: metadata.time[version] };
    }
    const major = metadata.versions
        .filter((version) => {
            const parts = versionParts(version);
            return (
                parts &&
                !parts.prerelease &&
                parts.major > currentParts.major &&
                typeof metadata.time[version] === 'string' &&
                Number.isFinite(Date.parse(metadata.time[version]))
            );
        })
        .sort(compareStable);
    if (major.length) {
        const version = major.at(-1);
        result.majorFollowup = { version, publishedAt: metadata.time[version] };
    }
    return result;
}

async function yarn(args) {
    const { stdout } = await execFileAsync('yarn', args, {
        timeout: QUERY_TIMEOUT,
        maxBuffer: MAX_OUTPUT,
        windowsHide: true,
    });
    return stdout.trim();
}

function parseYarnJson(text) {
    const lines = text.split(/\r?\n/).filter(Boolean);
    const candidate = lines.at(-1);
    try {
        return JSON.parse(candidate);
    } catch {
        return candidate;
    }
}

async function mapLimit(items, limit, mapper) {
    const results = new Array(items.length);
    let next = 0;
    await Promise.all(
        Array.from({ length: Math.min(limit, items.length) }, async () => {
            while (true) {
                const index = next++;
                if (index >= items.length) return;
                results[index] = await mapper(items[index]);
            }
        }),
    );
    return results;
}

async function run(argv) {
    const filters = [];
    for (let i = 0; i < argv.length; i++) {
        if (argv[i] === '--help' || argv[i] === '-h') {
            console.log('Usage: node select-updates.mjs [--package NAME ...]');
            return 0;
        }
        if (argv[i] === '--package' && argv[i + 1]) filters.push(argv[++i]);
        else throw new Error('Ugyldig argument. Bruk --help for bruk.');
    }
    const generatedAt = new Date().toISOString();
    const ageMinutesRaw = parseYarnJson(await yarn(['config', 'get', 'npmMinimalAgeGate', '--json']));
    const ageMinutes = Number(ageMinutesRaw);
    if (!Number.isFinite(ageMinutes) || ageMinutes < 0) throw new Error('Ugyldig npmMinimalAgeGate-konfigurasjon');
    const cutoff = new Date(Date.parse(generatedAt) - ageMinutes * 60_000).toISOString();
    const exemptRaw = parseYarnJson(await yarn(['config', 'get', 'npmPreapprovedPackages', '--json']));
    if (!Array.isArray(exemptRaw)) throw new Error('Ugyldig npmPreapprovedPackages-konfigurasjon');
    const exemptions = exemptRaw.filter((entry) => typeof entry === 'string');
    const unsupportedExemptions = exemptRaw.filter((entry) => typeof entry !== 'string' || !globRegex(entry));
    const workspaces = ['.', 'server'];
    const byName = new Map();
    for (const workspace of workspaces) {
        const pkg = JSON.parse(await readFile(`${workspace}/package.json`, 'utf8'));
        for (const section of ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']) {
            for (const [name, current] of Object.entries(pkg[section] ?? {})) {
                if (filters.length && !filters.includes(name)) continue;
                const row = byName.get(name) ?? { package: name, current, workspaces: [] };
                if (!row.workspaces.includes(workspace)) row.workspaces.push(workspace);
                if (row.current !== current) row.conflict = true;
                byName.set(name, row);
            }
        }
    }
    const rows = await mapLimit(
        [...byName.values()].sort((a, b) => a.package.localeCompare(b.package)),
        CONCURRENCY,
        async (row) => {
            if (row.conflict)
                return {
                    ...row,
                    target: null,
                    publishedAt: null,
                    status: 'skipped',
                    manualReview: true,
                    reason: 'Ulike versjonskrav i arbeidsområdene',
                };
            if (!versionParts(row.current))
                return {
                    ...row,
                    target: null,
                    publishedAt: null,
                    status: 'skipped',
                    manualReview: !/^(workspace:|file:|link:|portal:)/.test(row.current),
                    reason: 'Ikke en eksakt kanonisk versjon',
                };
            try {
                const output = await yarn(['npm', 'info', row.package, '--fields', 'versions,time', '--json']);
                const metadata = readInfo(output);
                const selected = selectUpdate({
                    name: row.package,
                    current: row.current,
                    metadata,
                    cutoff,
                    ageExempt: isExempt(row.package, exemptions),
                });
                return { ...row, ...selected };
            } catch {
                return {
                    ...row,
                    target: null,
                    publishedAt: null,
                    status: 'error',
                    reason: 'Kunne ikke hente eller lese registermetadata',
                };
            }
        },
    );
    const output = { generatedAt, cutoff, ageGateMinutes: ageMinutes, unsupportedExemptions, rows };
    console.log(JSON.stringify(output, null, 2));
    return unsupportedExemptions.length || rows.some((row) => row.status === 'error' || row.manualReview) ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    run(process.argv.slice(2))
        .then((code) => {
            process.exitCode = code;
        })
        .catch(() => {
            console.error(JSON.stringify({ status: 'error', reason: 'Kunne ikke oppdage pakkeoppdateringer' }));
            process.exitCode = 1;
        });
}
