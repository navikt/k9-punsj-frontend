module.exports = (api) => {
    const isTest = api.env('test');

    return {
        presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
        plugins: ['@babel/plugin-transform-runtime'],
        overrides: isTest
            ? [
                  {
                      test: /node_modules\/react-router\/dist\/.*\/routeModules\.js$/,
                      plugins: [
                          () => ({
                              visitor: {
                                  MemberExpression(path) {
                                      const { object, property, computed } = path.node;
                                      if (
                                          !computed &&
                                          object.type === 'MetaProperty' &&
                                          object.meta.name === 'import' &&
                                          object.property.name === 'meta' &&
                                          property.type === 'Identifier' &&
                                          property.name === 'hot'
                                      ) {
                                          path.replaceWithSourceString('false');
                                      }
                                  },
                              },
                          }),
                      ],
                  },
              ]
            : [],
    };
};
