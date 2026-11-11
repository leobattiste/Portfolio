/* A damped spring, simulated once and handed to CSS as a linear() easing.
   Stiffness pulls toward the target; damping is how quickly it settles. */
export function spring(stiffness: number, damping: number, mass = 1) {
  const step = 1 / 120;
  const points = [0];
  let x = 0,
    v = 0,
    t = 0;
  while (t < 4) {
    const a = (-stiffness * (x - 1) - damping * v) / mass;
    v += a * step;
    x += v * step;
    t += step;
    points.push(x);
    if (Math.abs(x - 1) < 0.001 && Math.abs(v) < 0.01) break;
  }
  const every = Math.max(1, Math.ceil(points.length / 64));
  const sampled = points.filter((_, i) => i % every === 0).map((p) => +p.toFixed(4));
  sampled.push(1);
  return {
    easing: `linear(${sampled.join(", ")})`,
    duration: Math.round(t * 1000),
    points,
  };
}
