export function createTimestamps() {
  const now = new Date().toISOString();
  return {
    createdAt: now,
    updatedAt: now
  };
}

export function touchUpdatedAt<T extends { updatedAt: string }>(document: T): T {
  return {
    ...document,
    updatedAt: new Date().toISOString()
  };
}
