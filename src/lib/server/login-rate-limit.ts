import "server-only";

const MAX_FAILED_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

type LoginAttempt = {
  count: number;
  expiresAt: number;
};

const attempts = new Map<string, LoginAttempt>();

function keyFor(username: string) {
  return username.trim().toLocaleLowerCase("en-US");
}

function currentAttempt(username: string, now = Date.now()) {
  const key = keyFor(username);
  const attempt = attempts.get(key);

  if (!attempt || attempt.expiresAt <= now) {
    attempts.delete(key);
    return undefined;
  }

  return attempt;
}

export function isLoginRateLimited(username: string) {
  return (currentAttempt(username)?.count ?? 0) >= MAX_FAILED_ATTEMPTS;
}

export function recordLoginFailure(username: string) {
  const now = Date.now();
  const key = keyFor(username);
  const attempt = currentAttempt(username, now);

  attempts.set(key, {
    count: (attempt?.count ?? 0) + 1,
    expiresAt: attempt?.expiresAt ?? now + WINDOW_MS,
  });
}

export function clearLoginAttempts(username: string) {
  attempts.delete(keyFor(username));
}
