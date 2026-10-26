"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";

import { useAuth } from "./AuthProvider";
import { createClient } from "../lib/supabase/client";

const BUCKET = "journal-photos";
const MAX_SIZE = 5 * 1024 * 1024;

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

type Props = {
  questId: string;
  questTitle: string;
  editable?: boolean;
  fallback?: ReactNode;
};

type PhotoView = {
  path: string | null;
  url: string;
  ready: boolean;
  error: string;
};

function getErrorMessage(error: unknown): string {
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

  return "Something went wrong. Please try again.";
}

export default function PhotoMemory(props: Props) {
  const { user, loading } = useAuth();

  if (loading || !user) {
    return null;
  }

  // Reset photo state when the account or quest changes.
  return (
    <PhotoMemoryContent
      key={`${user.id}:${props.questId}`}
      {...props}
      userId={user.id}
    />
  );
}

function PhotoMemoryContent({
  userId,
  questId,
  questTitle,
  editable = false,
  fallback,
}: Props & { userId: string }) {
  const inputId = useId();

  const fileInput = useRef<HTMLInputElement>(null);
  const operationRunning = useRef(false);

  const [view, setView] = useState<PhotoView>({
    path: null,
    url: "",
    ready: false,
    error: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  // Fetch the saved photo using the signed-in account.
  useEffect(() => {
    let active = true;
    let objectUrl = "";

    async function loadPhoto() {
      try {
        const supabase = createClient();

        const {
          data: entry,
          error: entryError,
        } = await supabase
          .from("journal_entries")
          .select("photo_path")
          .eq("user_id", userId)
          .eq("quest_id", questId)
          .single();

        if (entryError) throw entryError;

        const path = entry.photo_path as string | null;

        if (path) {
          const {
            data: image,
            error: downloadError,
          } = await supabase.storage
            .from(BUCKET)
            .download(path);

          if (downloadError) throw downloadError;

          if (!active) return;

          objectUrl = URL.createObjectURL(image);
        }

        if (!active) return;

        setView({
          path,
          url: objectUrl,
          ready: true,
          error: "",
        });
      } catch (error) {
        if (!active) return;

        setView({
          path: null,
          url: "",
          ready: false,
          error: getErrorMessage(error),
        });
      }
    }

    void loadPhoto();

    return () => {
      active = false;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [userId, questId, reload]);

  // Release temporary previews when replaced or unmounted.
  useEffect(() => {
    if (!previewUrl) return;

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function reloadPhoto() {
    setError("");

    setView({
      path: null,
      url: "",
      ready: false,
      error: "",
    });

    setReload((count) => count + 1);
  }

  function clearSelection() {
    setFile(null);
    setPreviewUrl("");

    if (fileInput.current) {
      fileInput.current.value = "";
    }
  }

  function selectFile(nextFile: File | undefined) {
    setError("");
    setMessage("");

    if (!nextFile) return;

    if (!EXTENSIONS[nextFile.type]) {
      clearSelection();
      setError("Choose a JPEG, PNG, or WebP image.");
      return;
    }

    if (
      nextFile.size === 0 ||
      nextFile.size > MAX_SIZE
    ) {
      clearSelection();
      setError("Choose an image no larger than 5 MB.");
      return;
    }

    setFile(nextFile);
    setPreviewUrl(URL.createObjectURL(nextFile));
  }

  async function changePhoto(remove: boolean) {
    if (
      operationRunning.current ||
      !view.ready ||
      (!remove && !file)
    ) {
      return;
    }

    operationRunning.current = true;
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const supabase = createClient();

      const {
        data: auth,
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (auth.user?.id !== userId) {
        throw new Error(
          "Your account changed. Refresh before continuing.",
        );
      }

      const oldPath = view.path;
      let nextPath: string | null = null;

      if (!remove && file) {
        const extension = EXTENSIONS[file.type];

        nextPath =
          `${userId}/${questId}/` +
          `${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } =
          await supabase.storage
            .from(BUCKET)
            .upload(nextPath, file, {
              contentType: file.type,
              upsert: false,
            });

        if (uploadError) throw uploadError;
      }

      // Don't overwrite a photo changed in another tab.
      let update = supabase
        .from("journal_entries")
        .update({ photo_path: nextPath })
        .eq("user_id", userId)
        .eq("quest_id", questId);

      update = oldPath
        ? update.eq("photo_path", oldPath)
        : update.is("photo_path", null);

      const {
        data: updated,
        error: updateError,
      } = await update
        .select("quest_id")
        .maybeSingle();

      if (updateError) {
        // A network failure can leave the outcome uncertain.
        // Keep the uploaded file until the saved state is checked.
        throw updateError;
      }

      if (!updated) {
        // The journal definitely didn't attach this upload.
        if (nextPath) {
          await supabase.storage
            .from(BUCKET)
            .remove([nextPath]);
        }

        throw new Error(
          "This memory changed elsewhere. " +
            "Reload its photo before retrying.",
        );
      }

      let cleanupFailed = false;

      // Remove the old file only after updating the journal.
      if (oldPath) {
        try {
          const { error: cleanupError } =
            await supabase.storage
              .from(BUCKET)
              .remove([oldPath]);

          cleanupFailed = Boolean(cleanupError);
        } catch {
          cleanupFailed = true;
        }
      }

      clearSelection();
      reloadPhoto();

      setMessage(
        cleanupFailed
          ? "Your journal was updated, but the previous file " +
              "couldn’t be deleted from storage."
          : remove
            ? "Photo removed from your memory."
            : "Your photo is saved. A little moment, kept.",
      );
    } catch (error) {
      setError(
        getErrorMessage(error) +
          " Reload the photo before retrying " +
          "to check what was saved.",
      );
    } finally {
      operationRunning.current = false;
      setBusy(false);
    }
  }

  const imageUrl = previewUrl || view.url;

  // Read-only photo display inside a journal card.
  if (!editable) {
    return (
      <div className="journal-photo">
        {view.url ? (
          <Image
            src={view.url}
            alt={`Memory from ${questTitle}`}
            width={1000}
            height={750}
            unoptimized
            className="journal-photo-image"
          />
        ) : (
          fallback
        )}

        {!view.ready && !view.error && (
          <p className="photo-hint" role="status">
            Loading photo…
          </p>
        )}

        {view.error && (
          <div className="photo-load-error">
            <p>Couldn’t load this memory’s photo.</p>

            <button
              type="button"
              className="text-link"
              onClick={reloadPhoto}
            >
              Try again
            </button>
          </div>
        )}
      </div>
    );
  }

  // Editable photo controls on the quest details page.
  return (
    <section className="photo-editor">
      <p className="eyebrow">
        A little moment worth keeping
      </p>

      <h2>Put a picture to the memory.</h2>

      <p className="muted">
        One favourite moment, saved alongside your words.
      </p>

      {imageUrl && (
        <div className="photo-preview">
          <Image
            src={imageUrl}
            alt={
              previewUrl
                ? "Preview of your selected photo"
                : `Memory from ${questTitle}`
            }
            width={1000}
            height={750}
            unoptimized
          />

          {previewUrl && (
            <span className="photo-preview-label">
              Preview · not uploaded yet
            </span>
          )}
        </div>
      )}

      {!view.ready && !view.error && (
        <p role="status">
          Loading your photo…
        </p>
      )}

      {view.ready && (
        <>
          <label
            className="photo-picker"
            htmlFor={inputId}
          >
            {view.path
              ? "Choose a replacement photo"
              : "Choose a photo"}
          </label>

          <input
            ref={fileInput}
            id={inputId}
            className="photo-file-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={busy}
            onChange={(event) =>
              selectFile(event.target.files?.[0])
            }
          />

          <p className="photo-hint">
            JPEG, PNG, or WebP · up to 5 MB.
            For iPhone HEIC photos, export as JPEG first.
          </p>

          <div className="quest-actions">
            {file && (
              <>
                <button
                  type="button"
                  className="button"
                  disabled={busy}
                  onClick={() => {
                    void changePhoto(false);
                  }}
                >
                  {busy ? "Saving…" : "Save photo ↗"}
                </button>

                <button
                  type="button"
                  className="button secondary"
                  disabled={busy}
                  onClick={clearSelection}
                >
                  Cancel selection
                </button>
              </>
            )}

            {view.path && !file && (
              <button
                type="button"
                className="button secondary"
                disabled={busy}
                onClick={() => {
                  void changePhoto(true);
                }}
              >
                {busy ? "Removing…" : "Remove photo"}
              </button>
            )}
          </div>
        </>
      )}

      {(view.error || error) && (
        <div className="auth-error" role="alert">
          <p>{error || view.error}</p>

          <button
            type="button"
            className="text-link"
            disabled={busy}
            onClick={reloadPhoto}
          >
            Reload photo
          </button>
        </div>
      )}

      {message && (
        <p className="form-message" role="status">
          {message}
        </p>
      )}
    </section>
  );
}