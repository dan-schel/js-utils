/**
 * Returns {@link x}, unless it is outside the range of {@link a} and {@link b}.
 * If it is, either {@link a} or {@link b} is returned, depending on which is
 * closest to x. {@link a} is not required to be lower than {@link b}.
 * @param x The input value.
 * @param a One of the two range boundaries (doesn't have to be the lower one).
 * @param b The other of the two range boundaries (doesn't have to be the upper
 * one).
 */
export function clamp(x: number, a: number, b: number): number {
  const min = Math.min(a, b);
  const max = Math.max(a, b);
  return Math.min(Math.max(x, min), max);
}

/**
 * Normalizes {@link x} with a range from {@link inA} to {@link inB} into a
 * range of {@link outA} to {@link outB}. If {@link x} exceeds
 * {@link inA}-{@link inB}, the returned value will exceed
 * {@link outA}-{@link outB} by a proportional amount.
 * @param x The number to re-range.
 * @param inA The input range's first boundary.
 * @param inB The input range's second boundary.
 * @param outA The output range's first boundary.
 * @param outB The output range's second boundary.
 */
export function map(
  x: number,
  inA: number,
  inB: number,
  outA: number,
  outB: number,
): number {
  return ((x - inA) / (inB - inA)) * (outB - outA) + outA;
}

/**
 * Normalizes {@link x} with a range from {@link inA} to {@link inB} into a
 * range of {@link outA} to {@link outB}. The returned value is clamped to be
 * within {@link outA}-{@link outB}.
 * @param x The number to re-range.
 * @param inA The input range's first boundary.
 * @param inB The input range's second boundary.
 * @param outA The output range's first boundary.
 * @param outB The output range's second boundary.
 */
export function mapClamp(
  x: number,
  inA: number,
  inB: number,
  outA: number,
  outB: number,
): number {
  return clamp(map(x, inA, inB, outA, outB), outA, outB);
}
