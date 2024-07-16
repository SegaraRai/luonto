import { expect, expectTypeOf, test, vi } from "vitest";
import { createSerial } from "./serial";

function createPromise(): [Promise<void>, () => void] {
  let resolve: () => void;
  const promise = new Promise<void>((res) => {
    resolve = res;
  });
  return [promise, resolve!];
}

test("should return function that executes specified function", () => {
  const fn = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
  const serial = createSerial(fn);
  expectTypeOf(serial).toBeFunction();
  serial();
  expect(fn).toHaveBeenCalled();
});

test("should not call next one until running one finishes", async () => {
  const resolves: (() => void)[] = [];
  const serial = createSerial(() => {
    const [promise, resolve] = createPromise();
    resolves.push(resolve);
    return promise;
  });

  const promises = new Array(20).fill(0).map(() => {
    const onResolved = vi.fn();
    return [serial().then(onResolved), onResolved] as const;
  });

  expect(resolves).toHaveLength(1);
  expect(promises[0]![1]).not.toHaveBeenCalled();
  expect(promises[1]![1]).not.toHaveBeenCalled();
  resolves[0]!();
  await promises[0]![0];
  expect(promises[0]![1]).toHaveBeenCalled();
  expect(promises[1]![1]).not.toHaveBeenCalled();

  expect(resolves).toHaveLength(2);
  resolves[1]!();
  await promises[1]![0];
  expect(promises[1]![1]).toHaveBeenCalled();
  expect(promises[19]![1]).toHaveBeenCalled();

  expect(resolves).toHaveLength(2);
});
