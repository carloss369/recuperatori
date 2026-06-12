/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Numerical Methods Library for U.M.S.A. Final Challenge
// "Sistema Interactivo FANI"

// ==========================================
// SCENARIO A & F: LINEAR ALGEBRA & PORTIBILITY (TRIANGULACIÓN DE RADAR)
// ==========================================

export interface LUSol {
  L: number[][];
  U: number[][];
  y: number[];
  x: number[];
}

export interface IterationGS {
  iter: number;
  x: number[];
  error: number;
}

// 3x3 Determinant
export function det3x3(A: number[][]): number {
  return (
    A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) -
    A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) +
    A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0])
  );
}

// 3x3 Inverse Matrix using Adjugate method
export function invert3x3(A: number[][]): number[][] | null {
  const d = det3x3(A);
  if (Math.abs(d) < 1e-12) return null;

  const inv: number[][] = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ];

  inv[0][0] = (A[1][1] * A[2][2] - A[1][2] * A[2][1]) / d;
  inv[0][1] = (A[0][2] * A[2][1] - A[0][1] * A[2][2]) / d;
  inv[0][2] = (A[0][1] * A[1][2] - A[0][2] * A[1][1]) / d;

  inv[1][0] = (A[1][2] * A[2][0] - A[1][0] * A[2][2]) / d;
  inv[1][1] = (A[0][0] * A[2][2] - A[0][2] * A[2][0]) / d;
  inv[1][2] = (A[0][2] * A[1][0] - A[0][0] * A[1][2]) / d;

  inv[2][0] = (A[1][0] * A[2][1] - A[1][1] * A[2][0]) / d;
  inv[2][1] = (A[0][1] * A[2][0] - A[0][0] * A[2][1]) / d;
  inv[2][2] = (A[0][0] * A[1][1] - A[0][1] * A[1][0]) / d;

  return inv;
}

// Infinite Matrix Norm
export function matrixNormInf(A: number[][]): number {
  let maxRowSum = 0;
  for (let i = 0; i < A.length; i++) {
    let sum = 0;
    for (let j = 0; j < A[i].length; j++) {
      sum += Math.abs(A[i][j]);
    }
    if (sum > maxRowSum) maxRowSum = sum;
  }
  return maxRowSum;
}

// Vector Infinity Norm
export function vectorNormInf(v: number[]): number {
  return Math.max(...v.map(Math.abs));
}

// LU Decomposition (Doolittle) for 3x3 system
export function solveLU3x3(A: number[][], b: number[]): LUSol | null {
  const n = 3;
  const L = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1]
  ];
  const U = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ];

  // Decompose
  for (let i = 0; i < n; i++) {
    for (let k = i; k < n; k++) {
      let sum = 0;
      for (let j = 0; j < i; j++) {
        sum += L[i][j] * U[j][k];
      }
      U[i][k] = A[i][k] - sum;
    }

    for (let k = i + 1; k < n; k++) {
      let sum = 0;
      for (let j = 0; j < i; j++) {
        sum += L[k][j] * U[j][i];
      }
      if (Math.abs(U[i][i]) < 1e-12) return null; // Diagonal division check
      L[k][i] = (A[k][i] - sum) / U[i][i];
    }
  }

  // Forward solve: Ly = b
  const y = [0, 0, 0];
  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let j = 0; j < i; j++) {
      sum += L[i][j] * y[j];
    }
    y[i] = b[i] - sum;
  }

  // Backward solve: Ux = y
  const x = [0, 0, 0];
  for (let i = n - 1; i >= 0; i--) {
    let sum = 0;
    for (let j = i + 1; j < n; j++) {
      sum += U[i][j] * x[j];
    }
    if (Math.abs(U[i][i]) < 1e-12) return null;
    x[i] = (y[i] - sum) / U[i][i];
  }

  return { L, U, y, x };
}

// Gauss-Seidel with custom Relaxation (SOR / Linear System Iterative solver)
export function solveGaussSeidel3x3(
  A: number[][],
  b: number[],
  x0: number[] = [0, 0, 0],
  omega = 1.0, // Default relaxation (1.0 is traditional Gauss-Seidel, others SOR)
  tol = 1e-6,
  maxIter = 100
): IterationGS[] {
  const history: IterationGS[] = [];
  const x = [...x0];
  const n = 3;

  history.push({ iter: 0, x: [...x], error: 1.0 });

  for (let step = 1; step <= maxIter; step++) {
    const prevX = [...x];
    for (let i = 0; i < n; i++) {
      let sum = 0;
      for (let j = 0; j < n; j++) {
        if (j !== i) {
          sum += A[i][j] * x[j];
        }
      }
      
      if (Math.abs(A[i][i]) < 1e-12) {
        // Safe check for zero diagonal
        return history;
      }
      
      const nextVal = (b[i] - sum) / A[i][i];
      // Over-reflection (SOR integration)
      x[i] = (1 - omega) * prevX[i] + omega * nextVal;
    }

    // Compute error relative to prior step
    let diffNorm = 0;
    let prevNorm = 0;
    for (let i = 0; i < n; i++) {
      diffNorm += Math.pow(x[i] - prevX[i], 2);
      prevNorm += Math.pow(x[i], 2);
    }
    const currentError = Math.sqrt(diffNorm) / (Math.sqrt(prevNorm) || 1e-12);

    history.push({ iter: step, x: [...x], error: currentError });

    if (currentError < tol) {
      break;
    }
  }

  return history;
}


// ==========================================
// SCENARIO B: ORDINARY DIFFERENTIAL EQUATIONS (EDO)
// ==========================================

export interface ODENode {
  t: number;
  h: number;
}

export function solveODE(
  method: "euler" | "heun" | "rk4",
  h0: number, // Initial position
  tMax: number,
  dt: number,
  attractionRate = 1500, // Fixed descent rate or gravity constant
  thrustRate = 400, // Magnetic reverse engine thrust
  collapseThreshold = 2000,
  useAcceleration = false,
  v0 = 0
): ODENode[] {
  const points: ODENode[] = [];
  let t = 0;
  let h = h0;
  let v = v0;

  points.push({ t, h });

  if (!useAcceleration) {
    // Rate equation first-order: dH/dt = Thrust - Attraction
    const f = (_time: number, _height: number): number => {
      return thrustRate - attractionRate;
    };

    while (t < tMax && h > 0) {
      const currentH = h;
      const currentT = t;

      if (method === "euler") {
        const k1 = f(currentT, currentH);
        h = currentH + dt * k1;
      } else if (method === "heun") {
        const k1 = f(currentT, currentH);
        const hPred = currentH + dt * k1;
        const k2 = f(currentT + dt, hPred);
        h = currentH + (dt / 2) * (k1 + k2);
      } else {
        // RK4
        const k1 = f(currentT, currentH);
        const k2 = f(currentT + dt / 2, currentH + (dt / 2) * k1);
        const k3 = f(currentT + dt / 2, currentH + (dt / 2) * k2);
        const k4 = f(currentT + dt, currentH + dt * k3);
        h = currentH + (dt / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
      }

      t += dt;
      points.push({ t: parseFloat(t.toFixed(4)), h });
    }
  } else {
    // Rate equations second-order system:
    // dH/dt = V
    // dV/dt = Thrust - Attraction
    const a = thrustRate - attractionRate;

    while (t < tMax && h > 0) {
      const currentH = h;
      const currentV = v;

      if (method === "euler") {
        h = currentH + dt * currentV;
        v = currentV + dt * a;
      } else if (method === "heun") {
        // predictor step
        const hPred = currentH + dt * currentV;
        const vPred = currentV + dt * a;
        // corrector step
        h = currentH + (dt / 2) * (currentV + vPred);
        v = currentV + (dt / 2) * (a + a);
      } else {
        // RK4 system
        const k1h = currentV;
        const k1v = a;

        const k2h = currentV + (dt / 2) * k1v;
        const k2v = a;

        const k3h = currentV + (dt / 2) * k2v;
        const k3v = a;

        const k4h = currentV + dt * k3v;
        const k4v = a;

        h = currentH + (dt / 6) * (k1h + 2 * k2h + 2 * k3h + k4h);
        v = currentV + (dt / 6) * (k1v + 2 * k2v + 2 * k3v + k4v);
      }

      t += dt;
      points.push({ t: parseFloat(t.toFixed(4)), h });
    }
  }

  return points;
}

// Find exact arrival second to a particular zone (e.g., 2000 m)
export function findCrossingTime(nodes: ODENode[], targetH = 2000): number | null {
  for (let i = 0; i < nodes.length - 1; i++) {
    const current = nodes[i];
    const next = nodes[i + 1];
    if ((current.h >= targetH && next.h <= targetH) || (current.h <= targetH && next.h >= targetH)) {
      // Linear interpolation to find precise crossing time
      const fraction = (targetH - current.h) / (next.h - current.h);
      return current.t + fraction * (next.t - current.t);
    }
  }
  return null;
}


// ==========================================
// SCENARIO C & D: INTERPOLATION & INTEGRATION
// ==========================================

export interface DataPoint {
  t: number;
  val: number;
}

// Newton Divided Differences
export function calculateDividedDifferences(points: DataPoint[]): {
  coefs: number[];
  table: number[][];
} {
  const n = points.length;
  // Initialize grid table
  const table: number[][] = Array(n)
    .fill(0)
    .map(() => Array(n).fill(0));

  // First column: f[x_i] = y_i
  for (let i = 0; i < n; i++) {
    table[i][0] = points[i].val;
  }

  // Build Divided Differences
  for (let j = 1; j < n; j++) {
    for (let i = 0; i < n - j; i++) {
      table[i][j] = (table[i + 1][j - 1] - table[i][j - 1]) / (points[i + j].t - points[i].t);
    }
  }

  // Top coefficients
  const coefs = [];
  for (let j = 0; j < n; j++) {
    coefs.push(table[0][j]);
  }

  return { coefs, table };
}

// Evaluate Newton polynomial
export function evaluateNewton(coefs: number[], points: DataPoint[], t: number): number {
  if (!coefs || coefs.length === 0) return 0;
  let result = coefs[0] ?? 0;
  let factor = 1.0;
  for (let i = 1; i < coefs.length; i++) {
    factor *= t - (points[i - 1]?.t ?? 0);
    result += (coefs[i] ?? 0) * factor;
  }
  return result;
}

// Lagrange Interpolation
export function evaluateLagrange(points: DataPoint[], t: number): number {
  if (!points || points.length === 0) return 0;
  let total = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    let term = points[i]?.val ?? 0;
    for (let j = 0; j < n; j++) {
      if (j !== i) {
        const denom = (points[i]?.t ?? 1) - (points[j]?.t ?? 0);
        term *= (t - (points[j]?.t ?? 0)) / (denom || 1);
      }
    }
    total += term;
  }
  return total;
}

// Numerical Integration methods (Trapezoid, Simpson 1/3, Simpson 3/8)
// Integrating the Interpolated Polynomial continuous curve
export function integrateInterpolated(
  points: DataPoint[],
  a: number,
  b: number,
  segments: number,
  method: "trapezoid" | "simpson13" | "simpson38"
): number {
  const h = (b - a) / segments;
  
  // Helper to evaluate polynomial
  const { coefs } = calculateDividedDifferences(points);
  const f = (x: number) => evaluateNewton(coefs, points, x);

  if (method === "trapezoid") {
    let sum = 0.5 * (f(a) + f(b));
    for (let i = 1; i < segments; i++) {
      sum += f(a + i * h);
    }
    return sum * h;
  } else if (method === "simpson13") {
    // Ensure even number of segments
    const n = segments % 2 === 0 ? segments : segments + 1;
    const adjustedH = (b - a) / n;
    let sum = f(a) + f(b);
    for (let i = 1; i < n; i++) {
      const x = a + i * adjustedH;
      sum += i % 2 === 0 ? 2 * f(x) : 4 * f(x);
    }
    return (sum * adjustedH) / 3;
  } else {
    // Simpson 3/8 - segments multiple of 3
    const rem = segments % 3;
    const n = rem === 0 ? segments : segments + (3 - rem);
    const adjustedH = (b - a) / n;
    let sum = f(a) + f(b);
    for (let i = 1; i < n; i++) {
      const x = a + i * adjustedH;
      if (i % 3 === 0) {
        sum += 2 * f(x);
      } else {
        sum += 3 * f(x);
      }
    }
    return (sum * 3 * adjustedH) / 8;
  }
}


// ==========================================
// SCENARIO E: ROOTS OF NON-LINEAR EQUATIONS (UMBRAL TÉRMICO)
// ==========================================

export interface RootIteration {
  step: number;
  xVal: number;
  fxVal: number;
  dfxVal?: number;
  a?: number;
  b?: number;
  error: number;
}

// Generalized energy function for Non-linear testing
// f(v) = E_emitted * (1 - e^(-k * v)) - E_base
export function thermalBalanceFunction(v: number, baseEnergy = 500, maxEmitted = 580, k = 0.2): number {
  return maxEmitted * (1 - Math.exp(-k * v)) - baseEnergy;
}

// Numerical derivative using forward finite differences
export function dThermalBalanceFunction(v: number, baseEnergy = 500, maxEmitted = 580, k = 0.2): number {
  const h = 1e-5;
  return (
    (thermalBalanceFunction(v + h, baseEnergy, maxEmitted, k) -
      thermalBalanceFunction(v - h, baseEnergy, maxEmitted, k)) /
    (2 * h)
  );
}

// 1. BISECTION
export function solveBisection(
  f: (x: number) => number,
  initA: number,
  initB: number,
  tol = 1e-5,
  maxIter = 50
): RootIteration[] {
  const history: RootIteration[] = [];
  let a = initA;
  let b = initB;

  if (f(a) * f(b) > 0) {
    // Invalid interval
    return [];
  }

  let error = 1.0;
  let step = 0;
  let x = (a + b) / 2;

  while (error > tol && step < maxIter) {
    step++;
    const prevX = x;
    x = (a + b) / 2;
    const fx = f(x);

    error = step === 1 ? Math.abs(b - a) : Math.abs(x - prevX) / (Math.abs(x) || 1);

    history.push({
      step,
      xVal: x,
      fxVal: fx,
      a,
      b,
      error
    });

    if (Math.abs(fx) < 1e-12) {
      break;
    }

    if (f(a) * fx < 0) {
      b = x;
    } else {
      a = x;
    }
  }

  return history;
}

// 2. NEWTON-RAPHSON
export function solveNewtonRaphson(
  f: (x: number) => number,
  df: (x: number) => number,
  initX: number,
  tol = 1e-5,
  maxIter = 50
): RootIteration[] {
  const history: RootIteration[] = [];
  let x = initX;
  let error = 1.0;
  let step = 0;

  while (error > tol && step < maxIter) {
    step++;
    const fx = f(x);
    const dfx = df(x);

    if (Math.abs(dfx) < 1e-12) {
      break; // Division by zero safety
    }

    const nextX = x - fx / dfx;
    error = Math.abs(nextX - x) / (Math.abs(nextX) || 1e-12);

    history.push({
      step,
      xVal: x,
      fxVal: fx,
      dfxVal: dfx,
      error
    });

    x = nextX;

    if (Math.abs(fx) < 1e-12) {
      break;
    }
  }

  return history;
}

// 3. SECANT METHOD
export function solveSecant(
  f: (x: number) => number,
  x0: number,
  x1: number,
  tol = 1e-5,
  maxIter = 50
): RootIteration[] {
  const history: RootIteration[] = [];
  let prevV = x0;
  let currV = x1;
  let step = 0;
  let error = 1.0;

  while (error > tol && step < maxIter) {
    step++;
    const fPrev = f(prevV);
    const fCurr = f(currV);

    const denom = fCurr - fPrev;
    if (Math.abs(denom) < 1e-12) {
      break; // Safe exit
    }

    // secant step
    const nextV = currV - (fCurr * (currV - prevV)) / denom;
    error = Math.abs(nextV - currV) / (Math.abs(nextV) || 1e-12);

    history.push({
      step,
      xVal: currV,
      fxVal: fCurr,
      error
    });

    prevV = currV;
    currV = nextV;

    if (Math.abs(fCurr) < 1e-12) {
      break;
    }
  }

  return history;
}


// ==========================================
// SCENARIO G: PSYCHOSOCIAL CRISIS MODEL ODE (CONTAGIO SOCIAL)
// ==========================================

export interface SocialState {
  t: number;
  E: number; // Sceptics (Escépticos)
  A: number; // Alarmed (Alarmados)
  M: number; // Media coverage (Medios)
}

// System derivatives
// dE/dt = -a*E*A + b*M*A
// dA/dt = a*E*A - c*A*M
// dM/dt = k*A - r*M
export function evaluateSocialDynamics(
  E0: number,
  A0: number,
  M0: number,
  tMax: number,
  dt: number,
  a: number, // Conversion to Alarmed
  b: number, // Conversion back from media influence
  c: number, // Calming/alleviating rate due to media statement
  k: number, // Coverage creation
  r: number  // Coverage fatigue decay
): SocialState[] {
  const points: SocialState[] = [];
  let t = 0;
  let E = E0;
  let A = A0;
  let M = M0;

  points.push({ t, E, A, M });

  const getDerivatives = (_time: number, Esc: number, Ala: number, Med: number) => {
    const dE = -a * Esc * Ala + b * Med * Ala;
    const dA = a * Esc * Ala - c * Ala * Med;
    const dM = k * Ala - r * Med;
    return [dE, dA, dM];
  };

  const steps = Math.ceil(tMax / dt);

  for (let step = 1; step <= steps; step++) {
    // RK4 step vectorized
    const [kE1, kA1, kM1] = getDerivatives(t, E, A, M);

    const [kE2, kA2, kM2] = getDerivatives(
      t + dt / 2,
      E + (dt / 2) * kE1,
      A + (dt / 2) * kA1,
      M + (dt / 2) * kM1
    );

    const [kE3, kA3, kM3] = getDerivatives(
      t + dt / 2,
      E + (dt / 2) * kE2,
      A + (dt / 2) * kA2,
      M + (dt / 2) * kM2
    );

    const [kE4, kA4, kM4] = getDerivatives(
      t + dt,
      E + dt * kE3,
      A + dt * kA3,
      M + dt * kM3
    );

    E += (dt / 6) * (kE1 + 2 * kE2 + 2 * kE3 + kE4);
    A += (dt / 6) * (kA1 + 2 * kA2 + 2 * kA3 + kA4);
    M += (dt / 6) * (kM1 + 2 * kM2 + 2 * kM3 + kM4);

    // Clamp positive levels
    E = Math.max(0, E);
    A = Math.max(0, A);
    M = Math.max(0, M);

    t += dt;
    points.push({
      t: parseFloat(t.toFixed(2)),
      E: parseFloat(E.toFixed(1)),
      A: parseFloat(A.toFixed(1)),
      M: parseFloat(M.toFixed(1))
    });
  }

  return points;
}
