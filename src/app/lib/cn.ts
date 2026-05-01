/**
 * Utility for conditionally joining classNames
 * Similar to clsx or classnames packages
 */
export function cn(
  ...classes: (string | undefined | false | null | boolean)[]
): string {
  return classes.filter(Boolean).join(" ");
}
