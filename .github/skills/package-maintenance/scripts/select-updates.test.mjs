import test from 'node:test';
import assert from 'node:assert/strict';
import { selectUpdate } from './select-updates.mjs';

const cutoff = '2026-10-13T12:00:00.000Z';
const metadata = (versions, time) => ({ versions, time });

test('velger patch når nyere minor fortsatt er i nedkjølingstiden', () => {
    const result = selectUpdate({
        current: '1.2.0',
        cutoff,
        metadata: metadata(['1.3.0', '1.2.9'], { '1.3.0': '2026-10-15T00:00:00Z', '1.2.9': '2026-10-01T00:00:00Z' }),
    });
    assert.equal(result.target, '1.2.9');
});

test('velger høyeste kvalifiserte minorversjon uavhengig av registerrekkefølge', () => {
    const result = selectUpdate({
        name: 'pakke',
        current: '1.2.0',
        cutoff,
        metadata: metadata(['1.4.0', '1.3.9', '1.3.0'], {
            '1.4.0': '2026-10-10T00:00:00Z',
            '1.3.9': '2026-10-01T00:00:00Z',
            '1.3.0': '2026-09-01T00:00:00Z',
        }),
    });
    assert.equal(result.target, '1.4.0');
});

test('faller tilbake til eldre versjon når nyeste er i nedkjølingstiden', () => {
    const result = selectUpdate({
        name: 'pakke',
        current: '1.2.0',
        cutoff,
        metadata: metadata(['1.4.0', '1.3.0'], { '1.4.0': '2026-10-15T00:00:00Z', '1.3.0': '2026-10-01T00:00:00Z' }),
    });
    assert.equal(result.target, '1.3.0');
    assert.equal(result.cooldownBlocked.version, '1.4.0');
});

test('rapporterer seneste versjon når alle nyere versjoner er blokkert', () => {
    const result = selectUpdate({
        name: 'pakke',
        current: '1.2.0',
        cutoff,
        metadata: metadata(['1.4.0', '1.3.0'], { '1.4.0': '2026-10-19T00:00:00Z', '1.3.0': '2026-10-15T00:00:00Z' }),
    });
    assert.equal(result.target, null);
    assert.equal(result.cooldownBlocked.version, '1.4.0');
});

test('utelater hovedversjoner og prereleases fra mål og lager separat major-oppfølging', () => {
    const result = selectUpdate({
        name: 'pakke',
        current: '1.2.0',
        cutoff,
        metadata: metadata(['2.0.0', '1.9.0-beta.1', '1.3.0'], {
            '2.0.0': '2026-01-01T00:00:00Z',
            '1.9.0-beta.1': '2026-01-01T00:00:00Z',
            '1.3.0': '2026-01-01T00:00:00Z',
        }),
    });
    assert.equal(result.target, '1.3.0');
    assert.equal(result.majorFollowup.version, '2.0.0');
});

test('behandler prerelease-strøm som stabil oppgradering', () => {
    const result = selectUpdate({
        name: 'pakke',
        current: '2.0.0-rc.1',
        cutoff,
        metadata: metadata(['2.0.0', '2.1.0-beta.1'], {
            '2.0.0': '2026-10-01T00:00:00Z',
            '2.1.0-beta.1': '2026-10-01T00:00:00Z',
        }),
    });
    assert.equal(result.target, '2.0.0');
});

test('aldersunntak tillater fersk stabil versjon', () => {
    const result = selectUpdate({
        name: '@navikt/pakke',
        current: '1.0.0',
        cutoff,
        ageExempt: true,
        metadata: metadata(['1.1.0'], { '1.1.0': '2026-10-19T00:00:00Z' }),
    });
    assert.equal(result.target, '1.1.0');
    assert.equal(result.cooldownBlocked, null);
});

test('manglende publiseringstid brukes ikke som oppgraderingsmål', () => {
    const result = selectUpdate({
        name: 'pakke',
        current: '1.0.0',
        cutoff,
        metadata: metadata(['1.2.0', '1.1.0'], { '1.1.0': '2026-09-01T00:00:00Z' }),
    });
    assert.equal(result.target, null);
    assert.equal(result.status, 'error');
    assert.equal(result.reason, 'Publiseringstid mangler; versjonen er utelatt av sikkerhetshensyn');
});

test('hopper over intervaller og forhindrer nedgradering', () => {
    const skipped = selectUpdate({
        name: 'pakke',
        current: '^1.0.0',
        cutoff,
        metadata: metadata(['1.1.0'], { '1.1.0': '2026-01-01T00:00:00Z' }),
    });
    const stable = selectUpdate({
        name: 'pakke',
        current: '2.0.0',
        cutoff,
        metadata: metadata(['1.9.0', '1.8.0'], { '1.9.0': '2026-01-01T00:00:00Z', '1.8.0': '2026-01-01T00:00:00Z' }),
    });
    assert.equal(skipped.status, 'skipped');
    assert.equal(stable.target, null);
    assert.equal(stable.status, 'unchanged');
});
