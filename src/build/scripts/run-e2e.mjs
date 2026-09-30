import { spawn } from 'node:child_process';

const yarnCommand = process.platform === 'win32' ? 'yarn.cmd' : 'yarn';
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
        return spawn(yarnCommand, [...cypressCommand, ...args], {
            stdio: 'inherit',
            env: process.env,
            detached,
        });
    }

    const commandArgs = ['run', scriptName];

    if (args.length > 0) {
        commandArgs.push('--', ...args);
    }

    return spawn(yarnCommand, commandArgs, {
        stdio: 'inherit',
        env: process.env,
        detached,
    });
};

const terminateProcess = async (childProcess) => {
    if (!childProcess?.pid) return;

    if (process.platform !== 'win32') {
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
        return;
    }

    if (childProcess.exitCode !== null) return;
    childProcess.kill('SIGTERM');
    const deadline = Date.now() + 5000;
    while (childProcess.exitCode === null && Date.now() < deadline) {
        await delay(100);
    }
    if (childProcess.exitCode === null) childProcess.kill('SIGKILL');
};

const waitForReady = async (childProcess) => {
    const deadline = Date.now() + readyTimeoutMs;

    while (Date.now() < deadline) {
        if (childProcess.exitCode !== null) {
            throw new Error(`start:e2e exited before ${readyUrl} became ready`);
        }

        try {
            const response = await fetch(readyUrl, {
                signal: AbortSignal.timeout(pollIntervalMs),
            });

            if (response.ok) {
                return;
            }
        } catch {
            // Poll until timeout. Startup can legitimately fail the first requests.
        }

        await delay(pollIntervalMs);
    }

    throw new Error(`Timed out waiting for ${readyUrl} after ${readyTimeoutMs}ms`);
};

const run = async () => {
    const startProcess = spawnYarnScript('start:e2e', [], process.platform !== 'win32');

    const handleSignal = async (signal) => {
        await terminateProcess(startProcess);
        process.exit(signal === 'SIGINT' ? 130 : 143);
    };

    process.once('SIGINT', () => void handleSignal('SIGINT'));
    process.once('SIGTERM', () => void handleSignal('SIGTERM'));

    const startProcessReady = new Promise((resolve, reject) => {
        startProcess.once('error', (err) =>
            reject(new Error(`Failed to start dev server: ${err.message}`)),
        );
        waitForReady(startProcess).then(resolve, reject);
    });

    try {
        await startProcessReady;

        const cypressProcess = spawnYarnScript(cypressScript, forwardedArgs);
        const exitCode = await new Promise((resolve, reject) => {
            cypressProcess.once('exit', (code) => resolve(code ?? 1));
            cypressProcess.once('error', (err) =>
                reject(new Error(`Failed to spawn Cypress: ${err.message}`)),
            );
        });

        process.exitCode = exitCode;
    } finally {
        await terminateProcess(startProcess);
    }
};

run().catch(async (error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exitCode = 1;
});
