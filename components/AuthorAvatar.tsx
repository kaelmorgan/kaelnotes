import { author } from "@/lib/site";

const sizes = {
  sm: "h-7 w-7",
  md: "h-10 w-10",
  lg: "h-20 w-20",
} as const;

type AuthorAvatarProps = {
  size?: keyof typeof sizes;
  className?: string;
  alt?: string;
};

export function AuthorAvatar({
  size = "md",
  className = "",
  alt = "",
}: AuthorAvatarProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={author.image}
      alt={alt}
      width={size === "lg" ? 80 : size === "md" ? 40 : 28}
      height={size === "lg" ? 80 : size === "md" ? 40 : 28}
      className={`${sizes[size]} shrink-0 rounded-full object-cover ring-1 ring-line ${className}`.trim()}
    />
  );
}
