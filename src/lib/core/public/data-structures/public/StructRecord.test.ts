import StructRecord from "./StructRecord";

describe('StructRecord', () => {
  test('1) creates immutable record', () => {
    const Emperor = StructRecord.immutable({ id: 0, name: '' });
    const marcus = Emperor.create({ id: 1, name: 'Marcus Aurelius' });
    expect(marcus).toEqual({ id: 1, name: 'Marcus Aurelius' });
    expect(Object.isFrozen(marcus)).toBe(true);
  });

  test('2) creates mutable record', () => {
    const Emperor = StructRecord.mutable({ id: 0, name: '' });
    const commodus = Emperor.create({ id: 2, name: 'Commodus' });
    expect(commodus).toEqual({ id: 2, name: 'Commodus' });
    expect(Object.isSealed(commodus)).toBe(true);
  });

  test('3) uses defaults for missing fields', () => {
    const Emperor = StructRecord.immutable({ id: 0, name: 'Unknown' });
    const defaulted = Emperor.create();
    expect(defaulted).toEqual({ id: 0, name: 'Unknown' });
  });

  test('4) fills missing field with default', () => {
    const Emperor = StructRecord.immutable({ id: 0, name: 'Unknown' });
    const result = Emperor.create({ id: 42 });
    expect(result).toEqual({ id: 42, name: 'Unknown' });
  });

  test('5) updates mutable record with type check', () => {
    const Emperor = StructRecord.mutable({ id: 0, name: '' });
    const hadrian = Emperor.create({ id: 3, name: 'Hadrian' });
    StructRecord.update(hadrian, { name: 'Publius Hadrianus' });
    expect(hadrian.name).toBe('Publius Hadrianus');
  });

  test('6) throws on updating immutable record', () => {
    const Emperor = StructRecord.immutable({ id: 0, name: '' });
    const antoninus = Emperor.create({ id: 4, name: 'Antoninus Pius' });
    expect(() => StructRecord.update(antoninus, { name: 'Titus Aurelius' }))
      .toThrow(/Cannot mutate immutable Record/);
  });

  test('7) forks immutable record', () => {
    const Emperor = StructRecord.immutable({ id: 0, name: '' });
    const lucius = Emperor.create({ id: 5, name: 'Lucius Verus' });
    const forked = StructRecord.fork(lucius, { name: 'Lucius Aelius' });
    expect(forked).not.toBe(lucius);
    expect(forked.name).toBe('Lucius Aelius');
    expect(forked.id).toBe(5);
    expect(Object.isFrozen(forked)).toBe(true);
  });

  test('8) branches with prototype chain and overrides', () => {
    const Emperor = StructRecord.immutable({ id: 0, name: '', title: '' });
    const base = Emperor.create({ id: 6, name: 'Marcus Aurelius', title: 'Philosopher King' });
    const branch1 = StructRecord.branch(base, { name: 'Marcus' });
    const branch2 = StructRecord.branch(branch1, { title: 'Imperator' });
    expect(branch2.name).toBe('Marcus');
    expect(branch2.title).toBe('Imperator');
    expect(branch2.id).toBe(6);
    expect(Object.getPrototypeOf(branch2)).toBe(branch1);
    expect(Object.getPrototypeOf(branch1)).toBe(base);
  });

  test('9) throws on type mismatch during creation and update', () => {
    const Emperor = StructRecord.immutable({ id: 0, name: '' });
    expect(() => Emperor.create({ id: 'not-a-number', name: 'Trajan' } as any))
      .toThrow(/expected number, got string/);

    const Mutable = StructRecord.mutable({ id: 0, name: '' });
    const nerva = Mutable.create({ id: 7, name: 'Nerva' });
    expect(() => StructRecord.update(nerva, { id: 'eight' } as any))
      .toThrow(/expected number, got string/);
    expect(() => StructRecord.fork(nerva, { id: 9 }))
      .not.toThrow();
    expect(() => StructRecord.branch(nerva, { id: 'X' } as any))
      .toThrow(/expected number, got string/);
  });

  test('10) ignores unknown fields during creation', () => {
    const Emperor = StructRecord.immutable({ id: 0, name: '' });
    const result = Emperor.create({ id: 10, name: 'Antoninus' });
    expect(result).toEqual({ id: 10, name: 'Antoninus' });
  });

  test('11) maintains immutability across branch chain', () => {
    const Emperor = StructRecord.immutable({ id: 0, name: '', title: '' });
    const base = Emperor.create({ id: 1, name: 'Marcus', title: 'Emperor' });
    const b1 = StructRecord.branch(base, { title: 'Philosopher' });
    const b2 = StructRecord.branch(b1, { name: 'Lucius' });
    expect(Object.isFrozen(b1)).toBe(true);
    expect(Object.isFrozen(b2)).toBe(true);
    expect(b2.title).toBe('Philosopher');
    expect(b2.name).toBe('Lucius');
    expect(b2.id).toBe(1);
  });
});
