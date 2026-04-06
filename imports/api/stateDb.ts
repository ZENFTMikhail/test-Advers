let dbReady = false;

export function setDbReady() {
  dbReady = true;
}

export function isDbReady() {
  return dbReady;
}