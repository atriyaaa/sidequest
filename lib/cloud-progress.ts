import { createClient } from "./supabase/client";
import type { Progress } from "../types/quest";

export type ProgressAction =
  | { type: "toggle-saved"; questId: string }
  | { type: "start"; questId: string }
  | { type: "complete"; questId: string }
  | { type: "memory"; questId: string; text: string };

export async function loadCloudProgress(
  userId: string,
): Promise<Progress> {
  const supabase = createClient();

  const [progressResult, journalResult] = await Promise.all([
    supabase
      .from("quest_progress")
      .select("quest_id, is_saved, started_at, completed_at")
      .eq("user_id", userId),

    supabase
      .from("journal_entries")
      .select("quest_id, body, updated_at")
      .eq("user_id", userId),
  ]);

  if (progressResult.error) throw progressResult.error;
  if (journalResult.error) throw journalResult.error;

  const progress: Progress = {
    saved: [],
    started: [],
    completed: [],
    memories: {},
  };

  for (const row of progressResult.data ?? []) {
    if (row.is_saved) progress.saved.push(row.quest_id);
    if (row.started_at) progress.started.push(row.quest_id);
    if (row.completed_at) progress.completed.push(row.quest_id);
  }

  for (const row of journalResult.data ?? []) {
    progress.memories[row.quest_id] = {
      questId: row.quest_id,
      text: row.body,
      updatedAt: row.updated_at,
    };
  }

  return progress;
}

export async function applyProgressAction(
  userId: string,
  action: ProgressAction,
) {
  const supabase = createClient();

  // Check that the request still belongs to this account.
  const { data: authData, error: authError } =
    await supabase.auth.getUser();

  if (authError) throw authError;

  if (authData.user?.id !== userId) {
    throw new Error("Your account changed. Refresh and try again.");
  }

  // Create the relationship if it doesn't exist.
  // Existing rows are left untouched.
  const { error: createError } = await supabase
    .from("quest_progress")
    .upsert(
      {
        user_id: userId,
        quest_id: action.questId,
      },
      {
        onConflict: "user_id,quest_id",
        ignoreDuplicates: true,
      },
    );

  if (createError) throw createError;

  const { data: row, error: readError } = await supabase
    .from("quest_progress")
    .select("is_saved, started_at, completed_at")
    .eq("user_id", userId)
    .eq("quest_id", action.questId)
    .single();

  if (readError) throw readError;

  if (action.type === "memory") {
    if (!row.completed_at) {
      throw new Error("Complete this quest before adding a memory.");
    }

    const text = action.text.trim();

    if (!text || text.length > 2000) {
      throw new Error("Write a memory between 1 and 2,000 characters.");
    }

    const { error } = await supabase
      .from("journal_entries")
      .upsert(
        {
          user_id: userId,
          quest_id: action.questId,
          body: text,
        },
        {
          onConflict: "user_id,quest_id",
        },
      );

    if (error) throw error;

    return;
  }

  if (action.type === "toggle-saved") {
    const { error } = await supabase
      .from("quest_progress")
      .update({ is_saved: !row.is_saved })
      .eq("user_id", userId)
      .eq("quest_id", action.questId)
      .select("quest_id")
      .single();

    if (error) throw error;

    return;
  }

  if (action.type === "start") {
    if (row.started_at || row.completed_at) return;

    const { error } = await supabase
      .from("quest_progress")
      .update({ started_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("quest_id", action.questId)
      .is("started_at", null);

    if (error) throw error;

    return;
  }

  if (action.type === "complete") {
    if (row.completed_at) return;

    if (!row.started_at) {
      throw new Error("Start this quest before completing it.");
    }

    // Avoid an earlier completion time if device clocks differ.
    const completedAt = new Date(
      Math.max(Date.now(), Date.parse(row.started_at)),
    ).toISOString();

    const { error } = await supabase
      .from("quest_progress")
      .update({ completed_at: completedAt })
      .eq("user_id", userId)
      .eq("quest_id", action.questId)
      .is("completed_at", null);

    if (error) throw error;
  }
}