export default (async function config() {
    const { default: love } = await import("eslint-config-love");
    const { rules } = await import("eslint-config-prettier");

    return [
        {
            ...love,
            files: ["**/*.js", "**/*.ts"],
            languageOptions: {
                ...love.languageOptions,
                parserOptions: {
                    ...love.languageOptions.parserOptions,
                    projectService: {
                        allowDefaultProject: ["eslint.config.js", "bin/*.js"],
                        defaultProject: "tsconfig.eslint.json",
                    },
                },
            },
            rules: {
                ...rules,
                'no-magic-numbers': 'off'
            },
        },
    ];
})();