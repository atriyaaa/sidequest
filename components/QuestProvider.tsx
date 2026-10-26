"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useAuth } from "./AuthProvider";
import { getQuest } from "../data/quests";

import {
  applyProgressAction,
  loadCloudProgress,
  type ProgressAction,
} from "../lib/cloud-progress";

import type { Progress } from "../types/quest";

type QuestContextValue = {
  progress: Progress;
  loading: boolean;
  saving: boolean;
  toggleSaved: (id: string) => Promise<boolean>;
  startQuest: (id: string) => Promise<boolean>;
  completeQuest: (id: string) => Promise<boolean>;
  saveMemory: (id: string, text: string) => Promise<boolean>;
};

type LoadedProgress = {
  userId: string;
  progress: Progress;
};

type SyncNotice = {
  userId: string;
  text: string;
};

const EMPTY_PROGRESS: Progress = {
  saved: [],
  started: [],
  completed: [],
  memories: {},
};

const QuestContext = createContext<QuestContextValue | null>(null);

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Please check your connection and try again.";
}

export function QuestProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id;

  const [loaded, setLoaded] = useState<LoadedProgress | null>(null);
  const [notice, setNotice] = useState<SyncNotice | null>(null);

  const [savingUserId, setSavingUserId] = useState<string | null>(
    null,
  );

  const [reloadCount, setReloadCount] = useState(0);

  // Prevent repeated clicks from sending overlapping saves.
  const mutationRunning = useRef(false);

  // Ignore responses from an earlier account or loading request.
  const generation = useRef(0);

  useEffect(() => {
    const requestGeneration = ++generation.current;

    if (authLoading || !userId) {
      return;
    }

    const accountId = userId;
    let active = true;

    async function load() {
      try {
        const progress = await loadCloudProgress(accountId);

        if (
          !active ||
          generation.current !== requestGeneration
        ) {
          return;
        }

        setLoaded({
          userId: accountId,
          progress,
        });

        setNotice(null);
      } catch (error) {
        if (
          !active ||
          generation.current !== requestGeneration
        ) {
          return;
        }

        setNotice({
          userId: accountId,
          text:
            "Couldn’t load your progress: " +
            errorMessage(error),
        });
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [userId, authLoading, reloadCount]);

  const hasLoaded = Boolean(
    userId && loaded?.userId === userId,
  );

  // Never display another account's loaded progress.
  const progress =
    hasLoaded && loaded
      ? loaded.progress
      : EMPTY_PROGRESS;

  const loading =
    authLoading || Boolean(userId && !hasLoaded);

  const saving = Boolean(
    userId && savingUserId === userId,
  );

  // Check that notice exists before reading its text.
  const currentNotice =
    notice && notice.userId === userId
      ? notice.text
      : "";

  async function runAction(
    action: ProgressAction,
  ): Promise<boolean> {
    if (!userId || authLoading) {
      return false;
    }

    if (!hasLoaded) {
      setNotice({
        userId,
        text:
          "Your progress hasn’t loaded yet. " +
          "Please retry loading first.",
      });

      return false;
    }

    if (mutationRunning.current) {
      return false;
    }

    if (!getQuest(action.questId)) {
      setNotice({
        userId,
        text: "We couldn’t find that quest.",
      });

      return false;
    }

    const requestGeneration = generation.current;

    mutationRunning.current = true;
    setSavingUserId(userId);
    setNotice(null);

    try {
      await applyProgressAction(userId, action);

      // Read back the confirmed database state.
      const updated = await loadCloudProgress(userId);

      if (generation.current !== requestGeneration) {
        return false;
      }

      setLoaded({
        userId,
        progress: updated,
      });

      return true;
    } catch (error) {
      if (generation.current === requestGeneration) {
        setNotice({
          userId,
          text:
            "Couldn’t finish syncing. " +
            "Reload your progress before retrying: " +
            errorMessage(error),
        });
      }

      return false;
    } finally {
      mutationRunning.current = false;
      setSavingUserId(null);
    }
  }

  return (
    <QuestContext.Provider
      value={{
        progress,
        loading,
        saving,

        toggleSaved: (id) =>
          runAction({
            type: "toggle-saved",
            questId: id,
          }),

        startQuest: (id) =>
          runAction({
            type: "start",
            questId: id,
          }),

        completeQuest: (id) =>
          runAction({
            type: "complete",
            questId: id,
          }),

        saveMemory: (id, text) =>
          runAction({
            type: "memory",
            questId: id,
            text,
          }),
      }}
    >
      {userId && (
        <>
          {currentNotice ? (
            <div className="sync-notice" role="alert">
              <span>{currentNotice}</span>

              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  setReloadCount((count) => count + 1)
                }
              >
                Reload progress
              </button>
            </div>
          ) : loading ? (
            <div className="sync-notice" role="status">
              Loading your adventures…
            </div>
          ) : saving ? (
            <div className="sync-notice" role="status">
              Saving your adventure…
            </div>
          ) : null}
        </>
      )}

      {children}
    </QuestContext.Provider>
  );
}

export function useQuests() {
  const context = useContext(QuestContext);

  if (!context) {
    throw new Error(
      "useQuests must be used inside QuestProvider",
    );
  }

  return context;
}