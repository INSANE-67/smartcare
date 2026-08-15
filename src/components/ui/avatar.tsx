/**
 * Avatar — displays a user avatar image with an initials fallback.
 *
 * Server Component safe (no state, no effects).
 *
 * Props:
 *   src       — signed URL from getAvatarSignedUrl(); null shows initials
 *   name      — full name used to generate initials fallback
 *   size      — CSS size in px (default 64)
 *   className — additional class names
 */
interface AvatarProps {
  src: string | null;
  name: string;
  size?: number;
  className?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function Avatar({ src, name, size = 64, className = "" }: AvatarProps) {
  const initials = getInitials(name);
  const style = {
    width: size,
    height: size,
    minWidth: size,
    fontSize: Math.round(size * 0.36),
  };

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={`${name}'s avatar`}
        width={size}
        height={size}
        className={`avatar-img ${className}`}
        style={style}
      />
    );
  }

  return (
    <div
      className={`avatar-initials ${className}`}
      style={style}
      aria-label={`${name}'s avatar — initials ${initials}`}
      role="img"
    >
      {initials}
    </div>
  );
}
