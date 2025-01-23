import { useCallback, useEffect, useMemo, useState } from 'react';
import { RuleBuilder } from './store';

export function useRuleBuilder() {
  return useMemo(() => new RuleBuilder(), []);
}

// 返回
export function useRuleBuilderTree(builder: RuleBuilder, callback?: Function) {
  const [data, setData] = useState<RuleBuilder['tree']>();

  const subscribe = useCallback(() => {
    if (builder?.subscribeTree) {
      builder.subscribeTree((newValue, oldValue) => {
        setData(newValue);
        callback?.(newValue, oldValue);
      });
    }
  }, [builder?.subscribeTree, callback]);

  useMemo(() => {
    subscribe?.();
  }, [subscribe]);

  useEffect(() => {
    subscribe?.();
    return () => {
      builder && builder.unsubscribeTree();
    };
  }, [subscribe]);

  return [data, setData] as const;
}
