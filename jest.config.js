const expoTransformIgnorePattern =
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|expo-modules-core|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@testing-library/react-native|test-renderer|react-native-svg))';

module.exports = {
    preset: 'jest-expo',
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    testPathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/src/api/generated/',
    ],
    transformIgnorePatterns: [expoTransformIgnorePattern],
};
