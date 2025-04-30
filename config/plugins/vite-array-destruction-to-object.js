export default function ({ types: t }) {
  return {
    name: "array-to-object-destructuring",
    visitor: {
      VariableDeclarator(path) {
        const { id, init } = path.node;

        if (t.isArrayPattern(id) && t.isArrayExpression(init)) {
          try {
            const objectPattern = convertArrayToPattern(id);
            path.replaceWith(t.variableDeclarator(objectPattern, init));
          } catch (e) {
            console.error("Error converting array destructuring:", e.message);
          }
        }
      },
    },
  };
}

function convertArrayToPattern(arrayPattern) {
  return t.objectPattern(
    arrayPattern.elements
      .map((element, index) => {
        if (!element) return null;

        if (t.isRestElement(element)) {
          return t.objectProperty(
            t.identifier("rest"),
            element.argument,
            false,
            true,
          );
        }

        if (t.isPattern(element)) {
          const nestedPattern = convertArrayToPattern(element);
          return t.objectProperty(t.numericLiteral(index), nestedPattern);
        }

        if (t.hasDefault(element)) {
          return t.objectProperty(
            t.numericLiteral(index),
            element,
            false,
            true,
          );
        }

        return t.objectProperty(t.numericLiteral(index), element);
      })
      .filter(Boolean),
  );
}
