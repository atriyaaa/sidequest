import { quests } from "../data/quests";
import type { Progress } from "../types/quest";

const STORAGE_KEY = "sidequest-progress-v1";

export function createEmptyProgress(): Progress {
  return {
    saved: [],
    started: [],
    completed: [],
    memories: {},
  };
}

function validIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  const knownIds = new Set(quests.map((quest) => quest.id));

  return [...new Set(
    value.filter(
      (id): id is string =>
        typeof id === "string" && knownIds.has(id),
    ),
  )];
}

export function loadProgress(): Progress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return createEmptyProgress();

    const parsed: unknown = JSON.parse(stored);

    if (!parsed || typeof parsed !== "object") {
      return createEmptyProgress();
    }

    const data = parsed as Record<string, unknown>;
    const completed = validIds(data.completed);
    const memories: Progress["memories"] = {};

    if (
      data.memories &&
      typeof data.memories === "object" &&
      !Array.isArray(data.memories)
    ) {
      for (const [id, value] of Object.entries(data.memories)) {
        if (
          !completed.includes(id) ||
          !value ||
          typeof value !== "object"
        ) {
          continue;
        }

        const entry = value as Record<string, unknown>;

        if (
          typeof entry.text === "string" &&
          typeof entry.updatedAt === "string" &&
          !Number.isNaN(Date.parse(entry.updatedAt))
        ) {
          memories[id] = {
            questId: id,
            text: entry.text.slice(0, 2000),
            updatedAt: entry.updatedAt,
          };
        }
      }
    }

    return {
      saved: validIds(data.saved),
      started: validIds(data.started),
      completed,
      memories,
    };
  } catch {
    return createEmptyProgress();
  }
}

export function saveProgress(progress: Progress): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}