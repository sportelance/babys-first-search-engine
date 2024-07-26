import fs from 'node:fs/promises';
import path from 'node:path';

const LOG_FILE = 'logs.txt';
const MAX_LINES = 500;

async function archiveLog() {
    const timestamp = new Date().toISOString().replaceAll(/[.:]/g, '-');
    const archiveFile = `logs-${timestamp}.txt`;
    await fs.rename(LOG_FILE, archiveFile);
    await fs.writeFile(LOG_FILE, '');
}

async function getLogFileLines() {
    try {
        const data = await fs.readFile(LOG_FILE, 'utf8');
        return data.split('\n').filter(line => line.trim() !== '');
    } catch (error) {
        if (error.code === 'ENOENT') {
            await fs.writeFile(LOG_FILE, '');
            return [];
        }
        throw error;
    }
}

const exists = await fs.access(LOG_FILE).then(() => true).catch(() => false);
const createIfNotExists = async () => { 
    if (!exists) {
        await fs.writeFile(LOG_FILE, '');
    }
}
async function writeLog(message) {
    await createIfNotExists();
    const logLine = `${new Date().toISOString()} - ${message}\n`;
    await fs.appendFile(LOG_FILE, logLine);
    
    const lines = await getLogFileLines();
    if (lines.length > MAX_LINES) {
        await archiveLog();
    }
}

async function getLogs() {
    const lines = await getLogFileLines();
    return lines.join('\n');
}

export { getLogs,writeLog };
