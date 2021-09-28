module.exports = {
    presets: ["@babel/preset-env", "@babel/preset-react", "@babel/preset-typescript"],
    env: {
        test: {
            plugins: [
                "@babel/plugin-proposal-optional-chaining",
                "@babel/plugin-proposal-class-properties",
                "@babel/plugin-transform-modules-commonjs",
                "@babel/plugin-transform-react-jsx"
            ]
        }
    }
};