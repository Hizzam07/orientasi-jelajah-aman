// src/db/database.web.ts

// Mock database object untuk platform Web
const mockDb = {
  execAsync: async () => {},
  runAsync: async () => ({ lastInsertRowId: 0, changes: 0 }),
  getFirstAsync: async () => null,
  getAllAsync: async () => [],
  eachAsync: async () => {},
};

export function ambilDatabase(): Promise<any> {
  return Promise.resolve(mockDb);
}