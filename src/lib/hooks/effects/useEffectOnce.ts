import { EffectCallback, useEffect } from 'react';

export default function (effect: EffectCallback) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, []);
}
