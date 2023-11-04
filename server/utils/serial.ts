export function createSerial<T>(callback: () => Promise<T>): () => Promise<T> {
  let primary: Promise<T> | undefined;
  let secondary: Promise<T> | undefined;

  const onFinally = (): void => {
    primary = secondary;
    secondary = undefined;
  };

  return (): Promise<T> => {
    if (!primary) {
      primary = callback().finally(onFinally);
    } else if (!secondary) {
      secondary = primary.then(callback, callback).finally(onFinally);
    }

    return secondary ?? primary;
  };
}
