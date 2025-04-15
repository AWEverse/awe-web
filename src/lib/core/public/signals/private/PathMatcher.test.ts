import { createPathMatcher, createPathMatcherWithTrace } from './PathMatcher';
import { PathSyntaxError } from './PathSyntaxError';

describe('PathMatcher', () => {
  describe('createPathMatcher', () => {
    test('matches exact paths', () => {
      const matcher = createPathMatcher(['user.profile']);
      expect(matcher(['user', 'profile'])).toBe(true);
      expect(matcher(['user', 'settings'])).toBe(false);
    });

    test('matches wildcard (*)', () => {
      const matcher = createPathMatcher(['user.*']);
      expect(matcher(['user', 'profile'])).toBe(true);
      expect(matcher(['user', 'settings'])).toBe(true);
      expect(matcher(['user', 123])).toBe(false);
    });

    test('matches array index ([])', () => {
      const matcher = createPathMatcher(['users.[]']);
      expect(matcher(['users', 0])).toBe(true);
      expect(matcher(['users', 'profile'])).toBe(false);
    });

    test('matches parameters (:name)', () => {
      const matcher = createPathMatcher(['user.:id']);
      expect(matcher(['user', '123'])).toBe(true);
      expect(matcher(['user', 'abc'])).toBe(true);
    });

    test('matches deep paths (**)', () => {
      const matcher = createPathMatcher(['**.settings']);
      expect(matcher(['user', 'profile', 'settings'])).toBe(true);
      expect(matcher(['settings'])).toBe(true);
      expect(matcher(['user', 'profile'])).toBe(false);
    });

    test('matches deep parameters (**:name)', () => {
      const matcher = createPathMatcher(['**:rest']);
      expect(matcher(['user', 'profile', 'settings'])).toBe(true);
      expect(matcher(['settings'])).toBe(true);
    });

    test('matches group options ((a|b))', () => {
      const matcher = createPathMatcher(['user.(profile|settings)']);
      expect(matcher(['user', 'profile'])).toBe(true);
      expect(matcher(['user', 'settings'])).toBe(true);
      expect(matcher(['user', 'other'])).toBe(false);
    });

    test('handles multiple patterns', () => {
      const matcher = createPathMatcher(['user.profile', 'user.settings']);
      expect(matcher(['user', 'profile'])).toBe(true);
      expect(matcher(['user', 'settings'])).toBe(true);
      expect(matcher(['user', 'other'])).toBe(false);
    });

    test('throws on invalid syntax', () => {
      expect(() => createPathMatcher(['user..profile'])).toThrow(PathSyntaxError);
      expect(() => createPathMatcher(['user.:'])).toThrow(PathSyntaxError);
      expect(() => createPathMatcher(['user.(:invalid)'])).toThrow(PathSyntaxError);
    });
  });

  describe('createPathMatcherWithTrace', () => {
    test('returns trace for exact matches', () => {
      const matcher = createPathMatcherWithTrace(['user.profile']);
      const trace = matcher(['user', 'profile']);
      expect(trace).toEqual([
        { pattern: 'user.profile', matched: true, params: {} }
      ]);
    });

    test('returns trace for parameter matches', () => {
      const matcher = createPathMatcherWithTrace(['user.:id']);
      const trace = matcher(['user', '123']);
      expect(trace).toEqual([
        { pattern: 'user.:id', matched: true, params: { id: '123' } }
      ]);
    });

    test('returns trace for deep parameter matches', () => {
      const matcher = createPathMatcherWithTrace(['**:rest']);
      const trace = matcher(['user', 'profile']);
      expect(trace).toEqual([
        { pattern: '**:rest', matched: true, params: { rest: 'user.profile' } }
      ]);
    });

    test('returns trace for multiple patterns', () => {
      const matcher = createPathMatcherWithTrace(['user.profile', 'user.:id']);
      const trace = matcher(['user', '123']);
      expect(trace).toEqual([
        { pattern: 'user.profile', matched: false },
        { pattern: 'user.:id', matched: true, params: { id: '123' } }
      ]);
    });

    test('handles typed parameters', () => {
      const matcher = createPathMatcherWithTrace(['user.:id:number']);
      const trace = matcher(['user', '123']);
      expect(trace).toEqual([
        { pattern: 'user.:id:number', matched: true, params: { id: '123' } }
      ]);
      expect(matcher(['user', 'abc'])).toEqual([
        { pattern: 'user.:id:number', matched: false }
      ]);
    });

    test('handles boolean parameters', () => {
      const matcher = createPathMatcherWithTrace(['user.:flag:boolean']);
      const trace = matcher(['user', 'true']);
      expect(trace).toEqual([
        { pattern: 'user.:flag:boolean', matched: true, params: { flag: 'true' } }
      ]);
      expect(matcher(['user', 'abc'])).toEqual([
        { pattern: 'user.:flag:boolean', matched: false }
      ]);
    });

    test('caches parsed patterns', () => {
      const matcher1 = createPathMatcherWithTrace(['user.profile']);
      const matcher2 = createPathMatcherWithTrace(['user.profile']);
      const trace1 = matcher1(['user', 'profile']);
      const trace2 = matcher2(['user', 'profile']);
      expect(trace1).toEqual(trace2);
    });
  });

  describe('Edge Cases', () => {
    test('handles empty path', () => {
      const matcher = createPathMatcher(['user']);
      expect(matcher([])).toBe(false);
    });

    test('handles single segment', () => {
      const matcher = createPathMatcher(['*']);
      expect(matcher(['test'])).toBe(true);
    });

    test('handles long deep paths', () => {
      const matcher = createPathMatcher(['**.end']);
      expect(matcher(['a', 'b', 'c', 'd', 'end'])).toBe(true);
    });

    test('reuses params pool correctly', () => {
      const matcher = createPathMatcherWithTrace(['user.:id', 'user.:name']);
      const trace1 = matcher(['user', '123']);
      const trace2 = matcher(['user', 'abc']);
      expect(trace1[0].params).toEqual({ id: '123' });
      expect(trace1[0].params).not.toHaveProperty('name');
      expect(trace2[1].params).toEqual({ name: 'abc' });
      expect(trace2[1].params).not.toHaveProperty('id');
    });
  });
});
