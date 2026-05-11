/**
 * Chronicle validator — run with:  npm run validate [path/to/scenes.ts]
 *
 * Checks:
 *   • All next / success_next / fail_next / victory_next / defeat_next / flee_next / ending refs resolve
 *   • No orphan scenes (unreachable from 'start')
 *   • No dead ends (scenes with no exits, excluding intentional endings)
 *   • All requires_clan values are valid ClanName
 *   • All clan_notes keys are valid ClanName
 *   • starting_hunger in [0, 5] if set
 */

import { pathToFileURL } from 'url';
import { resolve } from 'path';
import type { Chronicle, Scene } from '../src/engine/story';

const VALID_CLANS = [
  'Ventrue', 'Toreador', 'Malkavian', 'Nosferatu', 'Brujah',
  'Tremere', 'Gangrel', 'Lasombra', 'Tzimisce',
] as const;

type Severity = 'error' | 'warn';
interface Issue { severity: Severity; msg: string }

function collectExits(scene: Scene): string[] {
  const exits: string[] = [];
  if (scene.next) exits.push(scene.next);
  if (scene.ending) exits.push(scene.ending);
  if (scene.check) {
    exits.push(scene.check.success_next);
    exits.push(scene.check.fail_next);
  }
  if (scene.combat) {
    exits.push(scene.combat.victory_next);
    exits.push(scene.combat.defeat_next);
    if (scene.combat.flee_next) exits.push(scene.combat.flee_next);
  }
  for (const c of scene.choices ?? []) exits.push(c.next);
  return exits;
}

async function validateChronicle(chronicle: Chronicle): Promise<Issue[]> {
  const issues: Issue[] = [];
  const err  = (msg: string) => issues.push({ severity: 'error', msg });
  const warn = (msg: string) => issues.push({ severity: 'warn',  msg });

  const sceneIds  = new Set(Object.keys(chronicle.scenes));
  const endingIds = new Set(Object.keys(chronicle.endings));
  const allIds    = new Set([...sceneIds, ...endingIds]);

  // ── starting_hunger ────────────────────────────────────────────────────
  if (chronicle.starting_hunger != null) {
    if (chronicle.starting_hunger < 0 || chronicle.starting_hunger > 5) {
      err(`starting_hunger ${chronicle.starting_hunger} is outside [0, 5]`);
    }
  }

  // ── 'start' scene must exist ───────────────────────────────────────────
  if (!sceneIds.has('start')) err("No 'start' scene found");

  // ── Ref integrity ──────────────────────────────────────────────────────
  for (const [id, scene] of Object.entries(chronicle.scenes)) {
    for (const ref of collectExits(scene)) {
      if (!allIds.has(ref)) err(`Scene "${id}" → ref "${ref}" does not exist`);
    }
    for (const choice of scene.choices ?? []) {
      if (choice.requires_clan && !(VALID_CLANS as readonly string[]).includes(choice.requires_clan)) {
        err(`Scene "${id}": requires_clan "${choice.requires_clan}" is not a valid ClanName`);
      }
    }
    if (scene.clan_notes) {
      for (const clan of Object.keys(scene.clan_notes)) {
        if (!(VALID_CLANS as readonly string[]).includes(clan)) {
          err(`Scene "${id}": clan_notes key "${clan}" is not a valid ClanName`);
        }
      }
    }
    if (scene.humanity_change != null && scene.humanity_change < 0 && !scene.stain_note) {
      warn(`Scene "${id}": humanity_change < 0 but no stain_note — will use generic fallback`);
    }
  }

  // ── Reachability (BFS from 'start') ───────────────────────────────────
  const visited = new Set<string>();
  const queue   = ['start'];
  while (queue.length) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    if (!sceneIds.has(id)) continue; // endings are valid terminal nodes
    const scene = chronicle.scenes[id];
    for (const ref of collectExits(scene)) {
      if (!visited.has(ref)) queue.push(ref);
    }
  }
  for (const id of sceneIds) {
    if (!visited.has(id)) warn(`Scene "${id}" is unreachable from 'start'`);
  }

  // ── Dead ends (scenes with no exits) ──────────────────────────────────
  for (const [id, scene] of Object.entries(chronicle.scenes)) {
    if (collectExits(scene).length === 0 && !scene.resolution) {
      err(`Scene "${id}" is a dead end (no exits and resolution: false)`);
    }
  }

  return issues;
}

async function main() {
  const targets = process.argv.slice(2);
  if (targets.length === 0) {
    // Default: validate all known chronicles
    targets.push(
      'content/ash-ivory/scenes.ts',
      'content/blood-games/scenes.ts',
    );
  }

  let totalErrors = 0;

  for (const target of targets) {
    const abs = resolve(process.cwd(), target);
    let mod: Record<string, unknown>;
    try {
      mod = await import(pathToFileURL(abs).href) as Record<string, unknown>;
    } catch (e) {
      console.error(`✗ Failed to import ${target}: ${e}`);
      totalErrors++;
      continue;
    }

    // Find the Chronicle export (the object with .scenes and .endings)
    const chronicles = Object.values(mod).filter(
      v => v && typeof v === 'object' && 'scenes' in (v as object) && 'endings' in (v as object)
    ) as Chronicle[];

    if (chronicles.length === 0) {
      console.error(`✗ ${target}: no Chronicle export found`);
      totalErrors++;
      continue;
    }

    for (const chronicle of chronicles) {
      const issues = await validateChronicle(chronicle);
      const errors = issues.filter(i => i.severity === 'error');
      const warns  = issues.filter(i => i.severity === 'warn');

      const sceneCount  = Object.keys(chronicle.scenes).length;
      const endingCount = Object.keys(chronicle.endings).length;

      if (errors.length === 0) {
        console.log(`✓ ${chronicle.id} (${sceneCount} scenes, ${endingCount} endings)${warns.length ? ` — ${warns.length} warning(s)` : ''}`);
      } else {
        console.error(`✗ ${chronicle.id} — ${errors.length} error(s), ${warns.length} warning(s)`);
        totalErrors += errors.length;
      }
      for (const issue of issues) {
        const prefix = issue.severity === 'error' ? '  ✗' : '  ⚠';
        console.log(`${prefix} ${issue.msg}`);
      }
    }
  }

  if (totalErrors > 0) process.exit(1);
}

main().catch(e => { console.error(e); process.exit(1); });
