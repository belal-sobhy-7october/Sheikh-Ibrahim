const locks = new Map<string, Promise<void>>();

export async function withMutex<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const existingLock = locks.get(key);
  if (existingLock) {
    await existingLock;
  }

  let release: () => void;
  const lockPromise = new Promise<void>((resolve) => {
    release = resolve;
  });

  locks.set(key, lockPromise);

  try {
    return await fn();
  } finally {
    release!();
    locks.delete(key);
  }
}