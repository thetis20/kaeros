module.exports = {
    rootDir: 'public/script',
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.test.js'],
    transformIgnorePatterns: [],
    setupFilesAfterEnv: ['./jest.setup.main.js'],
    transform: {
        '^.+\\.js$': ['babel-jest', {presets: [], plugins: ['@babel/plugin-transform-modules-commonjs']}],
    },
};
