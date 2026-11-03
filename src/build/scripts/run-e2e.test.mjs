import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { setTimeout as wait } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const runnerPath = fileURLToPath(new URL('./run-e2e.mjs', import.meta.url));
const fakeYarn = `#!${process.execPath}
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const role = process.argv[2] === 'run' ? 'server' : 'cypress';
const record = (name, value) => fs.writeFileSync(path.join(process.env.FIXTURE_DIR, name), String(value));
record(role + '.pid', process.pid);
if (role === 'server') {
    if (process.env.SCENARIO === 'startup-exit') process.exit(7);
    if (process.env.SCENARIO === 'startup-signal') process.kill(process.pid, 'SIGTERM');
    http.createServer((req, res) => {
        res.statusCode = process.env.SCENARIO === 'timeout' ? 503 : 200;
        res.end('ready');
    }).listen(Number(process.env.FIXTURE_PORT), '127.0.0.1');
} else {
    record('args.json', JSON.stringify(process.argv.slice(2)));
    if (process.env.SCENARIO === 'server-exit') {
        process.kill(Number(fs.readFileSync(path.join(process.env.FIXTURE_DIR, 'server.pid'))), 'SIGTERM');
    }
    if (['server-exit', 'cancel'].includes(process.env.SCENARIO)) setInterval(() => {}, 1000);
    else process.exit(process.env.SCENARIO === 'test-failure' ? 9 : 0);
}
`;

const isAlive = (pid) => {
    try {
        process.kill(pid, 0);
        return true;
    } catch (error) {
        if (error.code === 'ESRCH') return false;
        throw error;
    }
};

const runFixture = async (t, scenario) => {
    const dir = await mkdtemp(path.join(tmpdir(), 'k9-e2e-runner-'));
    const socket = createServer();
    await new Promise((resolve) => socket.listen(0, '127.0.0.1', resolve));
    const port = socket.address().port;
    await new Promise((resolve) => socket.close(resolve));
    await writeFile(path.join(dir, 'yarn'), fakeYarn, { mode: 0o755 });
    const child = spawn(process.execPath, [runnerPath, 'cypress:headless', '--spec', 'first.cy.js,second.cy.js'], {
        cwd: dir,
        env: {
            ...process.env,
            PATH: `${dir}${path.delimiter}${process.env.PATH}`,
            FIXTURE_DIR: dir,
            FIXTURE_PORT: String(port),
            SCENARIO: scenario,
            E2E_READY_URL: `http://127.0.0.1:${port}/health/isReady`,
            E2E_READY_TIMEOUT_MS: scenario === 'timeout' ? '100' : '5000',
        },
        stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    child.stdout.on('data', (chunk) => {
        output += chunk;
    });
    child.stderr.on('data', (chunk) => {
        output += chunk;
    });
    const done = new Promise((resolve, reject) => {
        child.once('error', reject);
        child.once('close', (code, signal) => resolve({ code, signal, output }));
    });
    t.after(async () => {
        child.kill('SIGKILL');
        for (const role of ['server', 'cypress']) {
            try {
                process.kill(-Number(await readFile(path.join(dir, `${role}.pid`), 'utf8')), 'SIGKILL');
            } catch (error) {
                if (!['ENOENT', 'ESRCH'].includes(error.code)) throw error;
            }
        }
        await rm(dir, { recursive: true, force: true });
    });
    const assertStopped = async () => {
        for (const role of ['server', 'cypress']) {
            try {
                assert.equal(isAlive(Number(await readFile(path.join(dir, `${role}.pid`), 'utf8'))), false, role);
            } catch (error) {
                if (error.code !== 'ENOENT') throw error;
            }
        }
    };
    return { child, done, dir, assertStopped };
};

for (const [description, scenario, code, message] of [
    ['Videresender testutvalg og rydder opp etter vellykkede tester', 'success', 0, null],
    ['Beholder feilkoden fra Cypress', 'test-failure', 9, null],
    ['Rapporterer serverfeil før readiness', 'startup-exit', 1, /E2E server exited unexpectedly \(code: 7/],
    ['Rapporterer signal før readiness', 'startup-signal', 1, /E2E server exited unexpectedly.*signal: SIGTERM/],
    [
        'Stopper Cypress når serveren avsluttes under testene',
        'server-exit',
        1,
        /E2E server exited unexpectedly.*signal: SIGTERM/,
    ],
    ['Rydder opp når readiness ikke svarer innen fristen', 'timeout', 1, /Timed out waiting/],
]) {
    test(description, { timeout: 15000 }, async (t) => {
        const fixture = await runFixture(t, scenario);
        const result = await fixture.done;
        assert.equal(result.code, code, result.output);
        if (message) assert.match(result.output, message);
        if (scenario === 'success') {
            assert.deepEqual(JSON.parse(await readFile(path.join(fixture.dir, 'args.json'), 'utf8')), [
                'cypress',
                'run',
                '--e2e',
                '--browser',
                'electron',
                '--headless',
                '--spec',
                'first.cy.js,second.cy.js',
            ]);
        }
        await fixture.assertStopped();
    });
}

test('Stopper server og Cypress når kjøringen avbrytes', { timeout: 15000 }, async (t) => {
    const fixture = await runFixture(t, 'cancel');
    const deadline = Date.now() + 7000;
    while (true) {
        try {
            await readFile(path.join(fixture.dir, 'args.json'));
            break;
        } catch (error) {
            if (error.code !== 'ENOENT' || Date.now() > deadline) throw error;
            await wait(20);
        }
    }
    fixture.child.kill('SIGTERM');
    const result = await fixture.done;
    assert.equal(result.code, 143, result.output);
    assert.match(result.output, /E2E run interrupted by SIGTERM/);
    await fixture.assertStopped();
});
