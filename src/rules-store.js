// The person's rule list, saved with host.storage under "rules".
import { cleanRules, expand } from './rules.js';
import { groupLabels } from './groups.js';

const DEFAULT_RULES = ['Social', 'Video'];

export function createRuleStore(host) {
  let rules = DEFAULT_RULES;
  const get = () => ({ rules, groups: groupLabels(), ...expand(rules) });
  return {
    async load() {
      const saved = await host.get('rules');
      if (Array.isArray(saved)) rules = cleanRules(saved);
    },
    get,
    async set(list) {
      rules = cleanRules(list);
      await host.set('rules', rules);
      return get();
    },
    // The sites and apps to block right now.
    targets: () => expand(rules)
  };
}
