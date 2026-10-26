"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getQuest } from "../data/quests";
import {
  createEmptyProgress,
  loadProgress,
  saveProgress,
} from "../lib/storage";
import type { Progress } from "../types/quest";

type QuestContextValue = {
  progress: Progress;
  toggleSaved: (id: string) => void;
  startQuest: (id: string) => void;
  completeQuest: (id: string) => void;
  saveMemory: (id: string, text: string) => void;
};

const QuestContext = createContext<QuestContextValue | null>(null);

export function QuestProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Progress>(
    createEmptyProgress,
  );
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    setProgress(loadProgress());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;

    setStorageError(!saveProgress(progress));
  }, [progress, ready]);

  function toggleSaved(id: string) {
    if (!getQuest(id)) return;

    setProgress((current) => ({
      ...current,
      saved: current.saved.includes(id)
        ? current.saved.filter((savedId) => savedId !== id)
        : [...current.saved, id],
    }));
  }

  function startQuest(id: string) {
    if (!getQuest(id)) return;

    setProgress((current) => {
      if (current.started.includes(id)) return current;

      return {
        ...current,
        started: [...current.started, id],
      };
    });
  }

  function completeQuest(id: string) {
    if (!getQuest(id)) return;

    setProgress((current) => {
      if (
        !current.started.includes(id) ||
        current.completed.includes(id)
      ) {
        return current;
      }

      return {
        ...current,
        completed: [...current.completed, id],
      };
    });
  }

  function saveMemory(id: string, text: string) {
    const trimmed = text.trim().slice(0, 2000);
    if (!getQuest(id) || !trimmed) return;

    setProgress((current) => {
      if (!current.completed.includes(id)) return current;

      return {
        ...current,
        memories: {
          ...current.memories,
          [id]: {
            questId: id,
            text: trimmed,
            updatedAt: new Date().toISOString(),
          },
        },
      };
    });
  }

  return (
    <QuestContext.Provider
      value={{
        progress,
        toggleSaved,
        startQuest,
        completeQuest,
        saveMemory,
      }}
    >
      {storageError && (
        <p className="storage-warning" role="alert">
            This browser couldn’t save your progress. Changes may
            be lost when you close this page.
        </p>
        )}

        {children}
    </QuestContext.Provider>
  );
}

export function useQuests() {
  const context = useContext(QuestContext);

  if (!context) {
    throw new Error("useQuests must be used inside QuestProvider");
  }

  return context;
}