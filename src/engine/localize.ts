import type { Chronicle, Scene, SceneLocale } from './story';

function mergeScene(scene: Scene, loc: SceneLocale): Scene {
  const result: Scene = { ...scene };
  if (loc.title !== undefined) result.title = loc.title;
  if (loc.narrative !== undefined) result.narrative = loc.narrative;
  if (loc.choices && scene.choices) {
    result.choices = scene.choices.map((c, i) => {
      const t = loc.choices![i];
      return t ? { ...c, text: t } : c;
    });
  }
  if (loc.check && scene.check) {
    result.check = {
      ...scene.check,
      ...(loc.check.label && { label: loc.check.label }),
      ...(loc.check.pool_label && { pool_label: loc.check.pool_label }),
      ...(loc.check.success_text && { success_text: loc.check.success_text }),
      ...(loc.check.fail_text && { fail_text: loc.check.fail_text }),
    };
  }
  if (loc.combat && scene.combat) {
    result.combat = {
      ...scene.combat,
      ...(loc.combat.label && { label: loc.combat.label }),
      ...(loc.combat.description && { description: loc.combat.description }),
    };
  }
  return result;
}

export function localizeChronicle(chronicle: Chronicle, lang: string): Chronicle {
  if (lang === 'en') return chronicle;
  const locale = chronicle.locales?.[lang];
  if (!locale) return chronicle;

  const endings = locale.endings
    ? Object.fromEntries(
        Object.entries(chronicle.endings).map(([k, e]) => [
          k,
          locale.endings![k] ? { ...e, ...locale.endings![k] } : e,
        ])
      )
    : chronicle.endings;

  const scenes = locale.scenes
    ? Object.fromEntries(
        Object.entries(chronicle.scenes).map(([k, s]) => {
          const ls = locale.scenes![k];
          return [k, ls ? mergeScene(s, ls) : s];
        })
      )
    : chronicle.scenes;

  return {
    ...chronicle,
    title: locale.title ?? chronicle.title,
    subtitle: locale.subtitle ?? chronicle.subtitle,
    setting: locale.setting ?? chronicle.setting,
    acts: locale.acts ? { ...chronicle.acts, ...locale.acts } as Record<number, string> : chronicle.acts,
    endings,
    scenes,
  };
}
