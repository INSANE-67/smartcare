"use client";

import { useRef, useState, useTransition } from "react";
import { uploadAvatarAction } from "@/lib/actions/profile";
import { Avatar } from "@/components/ui/avatar";

interface AvatarUploadProps {
  currentSrc: string | null;
  name: string;
}

export function AvatarUpload({ currentSrc, name }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentSrc);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview before upload
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append("avatar", file);

    startTransition(async () => {
      const result = await uploadAvatarAction(formData);
      if (result.error) {
        setError(result.error);
        setPreview(currentSrc); // revert on error
      } else {
        setSuccess(true);
      }
    });
  }

  return (
    <div className="avatar-upload-wrapper">
      <div className="avatar-upload-block">
        <Avatar src={preview} name={name} size={96} className="avatar-upload-preview" />

        <div className="avatar-upload-actions">
          <button
            id="avatar-upload-btn"
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isPending}
            className="avatar-upload-trigger"
            aria-busy={isPending}
          >
            {isPending ? (
              <>
                <span className="auth-spinner auth-spinner-sm" aria-hidden="true" />
                Uploading…
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                </svg>
                Change photo
              </>
            )}
          </button>

          <p className="avatar-upload-hint">JPG, PNG, WebP or GIF · Max 5 MB</p>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={handleFileChange}
        aria-label="Upload avatar image"
        id="avatar-file-input"
      />

      {error && (
        <p className="avatar-upload-error" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="avatar-upload-success" role="status" aria-live="polite">
          ✓ Photo updated
        </p>
      )}
    </div>
  );
}
