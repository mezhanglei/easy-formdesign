import React, { useEffect } from 'react';
import { useRuleBuilder, useRuleBuilderTree } from './hooks';
import { RuleBuilderGroupItem, RuleBuilderProps, RuleBuilderRuleItem } from './typings';
import { deepClone } from './utils/object';
import Group from './components/Group';
import Rule from './components/Rule';


export default function Builder(props: RuleBuilderProps) {
  const curBuilder = useRuleBuilder();
  const {
    builder = curBuilder,
    ...config
  } = props;

  const { tree: propTree, onRenderChange } = config || {};

  builder.defineConfig({ ...props });

  const [tree, setTree] = useRuleBuilderTree(builder, onRenderChange);

  // 从props中同步, 不触发监听
  useEffect(() => {
    if (!builder) return;
    const cloneData = deepClone(propTree);
    setTree(cloneData);
    builder.setTree(cloneData, { ignore: true });
  }, [propTree]);

  const actions = builder?.getActions();

  const renderItem = (item: RuleBuilderGroupItem | RuleBuilderRuleItem, path?: Array<string | number>) => {
    if (!item) return;
    const isGroup = item?.type === 'group';
    const curPath = path || [];
    if (isGroup) {
      const groupItem = item as RuleBuilderGroupItem;
      const groupProperties = groupItem?.properties;
      const children = groupItem?.children;
      const childPath = curPath?.concat('children');
      return (
        <Group
          key={childPath.toString()}
          properties={groupProperties}
          path={curPath}
          actions={actions}
          config={config}
        >
          {children
            ? children
              .map((child, index) => renderItem(child, childPath.concat(index)))
            : null}
        </Group>
      );
    } else {
      const ruleItem = item as RuleBuilderRuleItem;
      const ruleProperties = ruleItem?.properties;
      // 单个规则
      return <Rule
        key={curPath.toString()}
        properties={ruleProperties}
        path={curPath}
        actions={actions}
        config={config}
      />;
    }
  };

  return tree && renderItem(tree);
};
