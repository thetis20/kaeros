class UninstallAppUseCase {
    /**
     * @param {() => void} clearStore
     * @param {() => Promise<void>} removeMediaDir
     * @param {string} platform
     * @param {boolean} isPackaged
     * @param {string|null} appBundlePath
     * @param {(path: string) => Promise<void>} trashItem
     * @param {() => void} launchWinUninstaller
     */
    constructor(clearStore, removeMediaDir, platform, isPackaged, appBundlePath, trashItem, launchWinUninstaller) {
        this.clearStore = clearStore;
        this.removeMediaDir = removeMediaDir;
        this.platform = platform;
        this.isPackaged = isPackaged;
        this.appBundlePath = appBundlePath;
        this.trashItem = trashItem;
        this.launchWinUninstaller = launchWinUninstaller;
    }

    /**
     * @returns {Promise<{ok: true, mode: 'windows-uninstaller' | 'mac-trash' | 'data-only'} | {ok: false, error: string}>}
     */
    async execute() {
        try {
            if (this.isPackaged && this.platform === 'win32') {
                this.launchWinUninstaller();
                return {ok: true, mode: 'windows-uninstaller'};
            }

            if (this.isPackaged && this.platform === 'darwin') {
                if (typeof this.appBundlePath !== 'string' || !this.appBundlePath.endsWith('.app')) {
                    return {ok: false, error: 'invalid-app-bundle'};
                }
                await this.clearData();
                await this.trashItem(this.appBundlePath);
                return {ok: true, mode: 'mac-trash'};
            }

            await this.clearData();
            return {ok: true, mode: 'data-only'};
        } catch (err) {
            return {ok: false, error: err && err.message ? err.message : String(err)};
        }
    }

    async clearData() {
        this.clearStore();
        await this.removeMediaDir();
    }
}

module.exports = UninstallAppUseCase;
