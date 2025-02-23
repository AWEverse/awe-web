export default function ({ types: t }) {
  return {
    visitor: {
      VariableDeclarator(path) {
        const { id, init } = path.node;

        if (t.isArrayPattern(id) && t.isArrayExpression(init)) {
          const properties = id.elements
            .map((element, index) => {
              if (!element) return null;
              return t.objectProperty(t.numericLiteral(index), element);
            })
            .filter(Boolean);

          const objectPattern = t.objectPattern(properties);
          path.replaceWith(t.variableDeclarator(objectPattern, init));
        }
      },
    },
  };
}
