import { quests } from "../data/quests";

export function getTotalXp(completedIds: string[]) {
  return quests.reduce(
    (total, quest) =>
      completedIds.includes(quest.id) ? total + quest.xp : total,
    0,
  );
}

export function getLevel(totalXp: number) {
  return Math.floor(totalXp / 100) + 1;
}

export function getLevelTitle(level: number) {
  if (level >= 3) return "Everyday adventurer";
  if (level === 2) return "Trail finder";
  return "Curious explorer";
}