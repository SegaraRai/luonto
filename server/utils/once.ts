export function createOnce<T>(callback: () => Promise<T>): () => Promise<T> {
  let promise: Promise<T> | undefined;
  return async (): Promise<T> => {
    if (!promise) {
      promise = callback();
    }
    return promise;
  };
}
