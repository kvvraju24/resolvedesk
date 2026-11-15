// Runtime configuration, validated once at startup.
//
// Fail closed: an unset NODE_ENV counts as production. Only NODE_ENV=development
// or NODE_ENV=test unlock the conveniences below (a built-in signing secret and
// an open CORS policy), so a deployment that forgets its settings refuses to
// start instead of running with a secret that is published in this repository.

export const DEV_ONLY_SECRET = 'dev-only-secret-change-me';
export const MIN_SECRET_BYTES = 32;

export class ConfigError extends Error {
  constructor(problems) {
    super(`Invalid configuration:\n${problems.map((p) => `  - ${p}`).join('\n')}`);
    this.name = 'ConfigError';
    this.problems = problems;
  }
}

function parseOrigins(raw, problems) {
  const origins = raw.split(',').map((s) => s.trim()).filter(Boolean);
  for (const o of origins) {
    let url;
    try {
      url = new URL(o);
    } catch {
      problems.push(`CORS_ORIGIN entry "${o}" is not a URL (expected e.g. https://app.example.com).`);
      continue;
    }
    if (!['http:', 'https:'].includes(url.protocol) || url.origin !== o.replace(/\/$/, '')) {
      problems.push(`CORS_ORIGIN entry "${o}" must be an origin only: scheme, host and optional port, no path.`);
    }
  }
  return origins.map((o) => o.replace(/\/$/, ''));
}

export function loadConfig(env = process.env) {
  const mode = env.NODE_ENV === 'development' || env.NODE_ENV === 'test' ? env.NODE_ENV : 'production';
  const production = mode === 'production';
  const problems = [];
  const warnings = [];

  let jwtSecret = env.JWT_SECRET;
  if (!jwtSecret) {
    if (production) {
      problems.push(`JWT_SECRET is required (at least ${MIN_SECRET_BYTES} bytes). Generate one with: node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`);
    } else {
      jwtSecret = DEV_ONLY_SECRET;
      warnings.push(`JWT_SECRET is not set; using the built-in development secret (${mode} mode only).`);
    }
  } else if (production && jwtSecret === DEV_ONLY_SECRET) {
    problems.push('JWT_SECRET is the published development secret. Generate a new one.');
  } else if (production && Buffer.byteLength(jwtSecret) < MIN_SECRET_BYTES) {
    problems.push(`JWT_SECRET is too short (${Buffer.byteLength(jwtSecret)} bytes; at least ${MIN_SECRET_BYTES} required).`);
  }

  let corsOrigins = true; // development/test: allow any origin
  if (env.CORS_ORIGIN?.trim()) {
    corsOrigins = parseOrigins(env.CORS_ORIGIN, problems);
  } else if (production) {
    problems.push('CORS_ORIGIN is required: a comma-separated list of frontend origins, e.g. https://app.example.com');
  }

  // Demo mode creates accounts whose password is published on the login page.
  // On by default only in development and test; production must opt in.
  let demoMode = !production;
  if (env.DEMO_MODE === 'true' || env.DEMO_MODE === 'false') demoMode = env.DEMO_MODE === 'true';
  else if (env.DEMO_MODE) problems.push(`DEMO_MODE must be "true" or "false" (got "${env.DEMO_MODE}").`);
  if (production && demoMode) {
    warnings.push('DEMO_MODE is on: demo accounts with a published password exist. Do not store real data.');
  }

  if (problems.length) throw new ConfigError(problems);
  return { mode, production, jwtSecret, corsOrigins, demoMode, warnings };
}
