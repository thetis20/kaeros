const UninstallAppUseCase = require('../UninstallAppUseCase.js');

const build = ({platform, isPackaged = true, appBundlePath = '/Applications/Kaeros.app'} = {}) => {
    const deps = {
        clearStore: jest.fn(),
        removeMediaDir: jest.fn().mockResolvedValue(undefined),
        trashItem: jest.fn().mockResolvedValue(undefined),
        launchWinUninstaller: jest.fn(),
    };
    const useCase = new UninstallAppUseCase(
        deps.clearStore,
        deps.removeMediaDir,
        platform,
        isPackaged,
        appBundlePath,
        deps.trashItem,
        deps.launchWinUninstaller
    );
    return {useCase, ...deps};
};

describe('UninstallAppUseCase', () => {
    it('launches the NSIS uninstaller on packaged Windows without touching data', async () => {
        const {useCase, clearStore, removeMediaDir, trashItem, launchWinUninstaller} = build({platform: 'win32'});

        expect(await useCase.execute()).toEqual({ok: true, mode: 'windows-uninstaller'});
        expect(launchWinUninstaller).toHaveBeenCalledTimes(1);
        expect(clearStore).not.toHaveBeenCalled();
        expect(removeMediaDir).not.toHaveBeenCalled();
        expect(trashItem).not.toHaveBeenCalled();
    });

    it('clears data and trashes the bundle on packaged macOS', async () => {
        const {useCase, clearStore, removeMediaDir, trashItem, launchWinUninstaller} = build({platform: 'darwin'});

        expect(await useCase.execute()).toEqual({ok: true, mode: 'mac-trash'});
        expect(clearStore).toHaveBeenCalledTimes(1);
        expect(removeMediaDir).toHaveBeenCalledTimes(1);
        expect(trashItem).toHaveBeenCalledWith('/Applications/Kaeros.app');
        expect(launchWinUninstaller).not.toHaveBeenCalled();
    });

    it.each([['/Applications/Kaeros'], [null], ['/usr/bin']])('refuses to trash a non .app path (%s) and keeps data', async (appBundlePath) => {
        const {useCase, clearStore, removeMediaDir, trashItem} = build({platform: 'darwin', appBundlePath});

        expect(await useCase.execute()).toEqual({ok: false, error: 'invalid-app-bundle'});
        expect(trashItem).not.toHaveBeenCalled();
        expect(clearStore).not.toHaveBeenCalled();
        expect(removeMediaDir).not.toHaveBeenCalled();
    });

    it('only clears data on Linux', async () => {
        const {useCase, clearStore, removeMediaDir, trashItem, launchWinUninstaller} = build({platform: 'linux'});

        expect(await useCase.execute()).toEqual({ok: true, mode: 'data-only'});
        expect(clearStore).toHaveBeenCalledTimes(1);
        expect(removeMediaDir).toHaveBeenCalledTimes(1);
        expect(trashItem).not.toHaveBeenCalled();
        expect(launchWinUninstaller).not.toHaveBeenCalled();
    });

    it.each(['darwin', 'win32'])('never trashes nor launches the uninstaller when not packaged (%s)', async (platform) => {
        const {useCase, clearStore, trashItem, launchWinUninstaller} = build({platform, isPackaged: false});

        expect(await useCase.execute()).toEqual({ok: true, mode: 'data-only'});
        expect(clearStore).toHaveBeenCalledTimes(1);
        expect(trashItem).not.toHaveBeenCalled();
        expect(launchWinUninstaller).not.toHaveBeenCalled();
    });

    it('returns the error message when a dependency throws', async () => {
        const {useCase, removeMediaDir} = build({platform: 'linux'});
        removeMediaDir.mockRejectedValue(new Error('EACCES'));

        expect(await useCase.execute()).toEqual({ok: false, error: 'EACCES'});
    });

    it('returns an error when the Windows uninstaller fails to launch', async () => {
        const {useCase, launchWinUninstaller} = build({platform: 'win32'});
        launchWinUninstaller.mockImplementation(() => {
            throw new Error('ENOENT');
        });

        expect(await useCase.execute()).toEqual({ok: false, error: 'ENOENT'});
    });
});
