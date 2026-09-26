const os = require('os');
const fs = require('fs');
const path = require('path');
const CheckMediaFilesUseCase = require('../CheckMediaFilesUseCase.js');

describe('CheckMediaFilesUseCase', () => {
    let dir;

    beforeEach(() => {
        dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kaeros-media-check-'));
    });

    afterEach(() => {
        fs.rmSync(dir, {recursive: true, force: true});
    });

    it('reports ok for a normal, readable, non-empty file', async () => {
        const filePath = path.join(dir, 'ok.txt');
        fs.writeFileSync(filePath, 'content');
        const useCase = new CheckMediaFilesUseCase();

        const result = await useCase.execute([{id: '1', kind: 'step', name: 'Ok', src: filePath}]);

        expect(result).toEqual([{id: '1', kind: 'step', name: 'Ok', src: filePath, code: 'ok'}]);
    });

    it('reports missing for a path that does not exist', async () => {
        const filePath = path.join(dir, 'does-not-exist.txt');
        const useCase = new CheckMediaFilesUseCase();

        const result = await useCase.execute([{id: '2', kind: 'step', name: 'Missing', src: filePath}]);

        expect(result).toEqual([{id: '2', kind: 'step', name: 'Missing', src: filePath, code: 'missing'}]);
    });

    it('reports not-a-file for a directory', async () => {
        const subDir = path.join(dir, 'a-directory');
        fs.mkdirSync(subDir);
        const useCase = new CheckMediaFilesUseCase();

        const result = await useCase.execute([{id: '3', kind: 'step', name: 'Dir', src: subDir}]);

        expect(result).toEqual([{id: '3', kind: 'step', name: 'Dir', src: subDir, code: 'not-a-file'}]);
    });

    it('reports empty for a zero-byte file', async () => {
        const filePath = path.join(dir, 'empty.txt');
        fs.writeFileSync(filePath, '');
        const useCase = new CheckMediaFilesUseCase();

        const result = await useCase.execute([{id: '4', kind: 'step', name: 'Empty', src: filePath}]);

        expect(result).toEqual([{id: '4', kind: 'step', name: 'Empty', src: filePath, code: 'empty'}]);
    });

    it('reports no-source when src is absent or empty', async () => {
        const useCase = new CheckMediaFilesUseCase();

        const result = await useCase.execute([
            {id: '5', kind: 'step', name: 'NoSrc'},
            {id: '6', kind: 'step', name: 'EmptySrc', src: ''},
        ]);

        expect(result).toEqual([
            {id: '5', kind: 'step', name: 'NoSrc', code: 'no-source'},
            {id: '6', kind: 'step', name: 'EmptySrc', src: '', code: 'no-source'},
        ]);
    });

    it('reports ok entries in parallel, preserving input order in the output', async () => {
        const filePathA = path.join(dir, 'a.txt');
        const filePathB = path.join(dir, 'b.txt');
        fs.writeFileSync(filePathA, 'a');
        fs.writeFileSync(filePathB, 'b');
        const useCase = new CheckMediaFilesUseCase();

        const result = await useCase.execute([
            {id: 'a', kind: 'step', name: 'A', src: filePathA},
            {id: 'b', kind: 'step', name: 'B', src: filePathB},
        ]);

        expect(result.map((r) => r.id)).toEqual(['a', 'b']);
        expect(result.every((r) => r.code === 'ok')).toBe(true);
    });

    const itUnlessRoot = process.getuid && process.getuid() === 0 ? it.skip : it;

    itUnlessRoot('reports unreadable for a file without read permission', async () => {
        const filePath = path.join(dir, 'no-read.txt');
        fs.writeFileSync(filePath, 'content');
        fs.chmodSync(filePath, 0o000);
        const useCase = new CheckMediaFilesUseCase();

        try {
            const result = await useCase.execute([{id: '7', kind: 'step', name: 'NoRead', src: filePath}]);

            expect(result).toEqual([{id: '7', kind: 'step', name: 'NoRead', src: filePath, code: 'unreadable'}]);
        } finally {
            fs.chmodSync(filePath, 0o644);
        }
    });

    it('never throws even if execute is called with an empty array', async () => {
        const useCase = new CheckMediaFilesUseCase();

        await expect(useCase.execute([])).resolves.toEqual([]);
    });
});
