import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';

const readyUrl = process.env.E2E_READY_URL ?? 'http://127.0.0.1:8080/health/isReady';
const defaultReadyTimeoutMs = 60000;
const parseReadyTimeoutMs = (value) => {
    if (value === undefined) {
        return defaultReadyTimeoutMs;
    }

    const parsedValue = Number(value);

    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
        throw new Error('Expected E2E_READY_TIMEOUT_MS to be a positive number of milliseconds');
    }

    return parsedValue;
};
const readyTimeoutMs = parseReadyTimeoutMs(process.env.E2E_READY_TIMEOUT_MS);
const pollIntervalMs = 1000;

const [, , cypressScript, ...forwardedArgs] = process.argv;

if (!cypressScript) {
    throw new Error('Expected Cypress script name, for example: cypress:headless');
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const cypressCommandMap = {
    'cypress:headless': ['cypress', 'run', '--e2e', '--browser', 'electron', '--headless'],
    'cypress:headless:chrome': ['cypress', 'run', '--e2e', '--browser', 'chrome', '--headless'],
    'cypress:open': ['cypress', 'open', '--e2e'],
    'cypress:open:electron': ['cypress', 'open', '--e2e', '--browser', 'electron'],
    'cypress:open:chrome': ['cypress', 'open', '--e2e', '--browser', 'chrome'],
};

const spawnYarnScript = (scriptName, args = [], detached = false) => {
    const cypressCommand = cypressCommandMap[scriptName];

    if (cypressCommand) {
        return spawn('yarn', [...cypressCommand, ...args], {
            stdio: 'inherit',
            env: process.env,
            detached,
        });
    }

    const commandArgs = ['run', scriptName];

    if (args.length > 0) {
        commandArgs.push('--', ...args);
    }

    return spawn('yarn', commandArgs, {
        stdio: 'inherit',
        env: process.env,
        detached,
    });
};

const terminateProcess = async (childProcess) => {
    if (!childProcess?.pid) return;

    // Yarn oppretter flere underprosesser; stopp hele gruppen slik at Vite ikke blir igjen.
    const signalGroup = (signal) => {
        try {
            process.kill(-childProcess.pid, signal);
            return true;
        } catch (error) {
            if (error.code === 'ESRCH') return false;
            throw error;
        }
    };

    if (!signalGroup('SIGTERM')) return;
    const deadline = Date.now() + 5000;
    while (Date.now() < deadline) {
        await delay(100);
        if (!signalGroup(0)) return;
    }
    signalGroup('SIGKILL');
};

const waitForReady = async (signal) => {
    const deadline = Date.now() + readyTimeoutMs;

    while (Date.now() < deadline) {
        signal.throwIfAborted();

        try {
            const response = await fetch(readyUrl, {
                signal: AbortSignal.any([signal, AbortSignal.timeout(pollIntervalMs)]),
            });
            await response.body?.cancel();

            if (response.ok) {
                return;
            }
        } catch {
            // Poll until timeout. Startup can legitimately fail the first requests.
        }

        await wait(pollIntervalMs, undefined, { signal });
    }

    throw new Error(`Timed out waiting for ${readyUrl} after ${readyTimeoutMs}ms`);
};

const waitForExit = (childProcess, name) =>
    new Promise((resolve, reject) => {
        childProcess.once('exit', (code, signal) => resolve({ code, signal }));
        childProcess.once('error', (error) => reject(new Error(`Failed to spawn ${name}: ${error.message}`)));
    });

const run = async () => {
    const startProcess = spawnYarnScript('start:e2e', [], true);
    const serverFailure = waitForExit(startProcess, 'start:e2e').then(({ code, signal }) => {
        throw new Error(`E2E server exited unexpectedly (code: ${code}, signal: ${signal}, URL: ${readyUrl})`);
    });
    const readiness = new AbortController();
    let cypressProcess;
    let rejectInterrupted;
    const interrupted = new Promise((resolve, reject) => {
        rejectInterrupted = reject;
    });

    const handleSignal = (signal) => {
        process.exitCode = signal === 'SIGINT' ? 130 : 143;
        rejectInterrupted(new Error(`E2E run interrupted by ${signal}`));
    };
    const handleSigint = () => handleSignal('SIGINT');
    const handleSigterm = () => handleSignal('SIGTERM');
    process.once('SIGINT', handleSigint);
    process.once('SIGTERM', handleSigterm);

    try {
        await Promise.race([waitForReady(readiness.signal), serverFailure, interrupted]);
        cypressProcess = spawnYarnScript(cypressScript, forwardedArgs, true);
        const { code, signal } = await Promise.race([
            waitForExit(cypressProcess, 'Cypress'),
            serverFailure,
            interrupted,
        ]);
        if (signal) {
            throw new Error(`Cypress exited after receiving ${signal}`);
        }
        process.exitCode = code ?? 1;
    } finally {
        readiness.abort();
        await Promise.all([terminateProcess(cypressProcess), terminateProcess(startProcess)]);
        process.off('SIGINT', handleSigint);
        process.off('SIGTERM', handleSigterm);
    }
};

run().catch(async (error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    if (!process.exitCode) process.exitCode = 1;
});
