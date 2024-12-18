type CollectionByKey<TMember> = Record<number | string, TMember>;

export function buildCollectionByKey<T extends AnyLiteral>(collection: T[], key: keyof T) {
  return collection.reduce((byKey: CollectionByKey<T>, member: T) => {
    byKey[member[key]] = member;
    return byKey;
  }, {});
}

export function buildCollectionByCallback<T, K extends number | string, R>(collection: T[], callback: (member: T) => [K, R]) {
  return collection.reduce(
    (byKey: Record<K, R>, member: T) => {
      const [key, value] = callback(member);
      byKey[key] = value;
      return byKey;
    },
    {} as Record<K, R>,
  );
}
