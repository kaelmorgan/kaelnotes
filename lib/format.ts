export function formatCount(value: number) {
  return new Intl.NumberFormat("en-GB").format(value);
}
