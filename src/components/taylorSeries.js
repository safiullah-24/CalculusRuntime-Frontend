import { create, all } from 'mathjs';

const math = create(all);

function toNumeric(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (math.typeOf(value) === 'Complex') {
    if (!Number.isFinite(value.re) || value.im !== 0) {
      return null;
    }
    return value.re;
  }
  if (math.typeOf(value) === 'BigNumber') {
    const numberResult = value.toNumber();
    return Number.isFinite(numberResult) ? numberResult : null;
  }
  return null;
}

function coefficientToString(coeffExpr, scope, variable, center) {
  const evaluated = math.evaluate(coeffExpr, { ...scope, [variable]: center });
  const numeric = toNumeric(evaluated);

  if (numeric !== null) {
    return String(numeric);
  }

  if (math.typeOf(evaluated) === 'Object' && typeof evaluated.toString === 'function') {
    return evaluated.toString();
  }

  return String(evaluated);
}

export function generateTaylorSeries(expression, center, degree, variable = 'x', scope = {}) {
  const a = Number(center);
  if (!Number.isFinite(a)) {
    throw new Error('Center point must be a finite number.');
  }

  if (!Number.isInteger(degree) || degree < 0) {
    throw new Error('Taylor degree must be a whole number greater than or equal to 0.');
  }

  let current = math.parse(expression);
  const terms = [];

  for (let k = 0; k <= degree; k += 1) {
    const coeffExpr = math.simplify(current).toString();
    const coeffStr = coefficientToString(coeffExpr, scope, variable, a);

    if (!coeffStr || coeffStr === 'null' || coeffStr === 'undefined') {
      throw new Error(`Function or derivative is undefined at ${variable} = ${a}.`);
    }

    const factorialK = math.factorial(k);
    const term = k === 0
      ? `(${coeffStr}) / (${factorialK})`
      : `(${coeffStr}) / (${factorialK}) * (${variable} - (${a}))^${k}`;

    terms.push(term);
    current = math.derivative(current, variable);
  }

  return math.simplify(math.parse(terms.join(' + '))).toString();
}
