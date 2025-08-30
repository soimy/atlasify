module.exports = (async function config() {
    const { default: love } = await import("eslint-config-love");

    return [
        {
            ...love,
            files: ["**/*.js", "**/*.ts"],
        },
    ];
})();