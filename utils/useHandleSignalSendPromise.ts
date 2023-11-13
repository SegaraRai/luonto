import type { RateLimit } from "~/server/utils/rateLimit";

export function useHandleSignalSendPromise(): (
  promise: Promise<unknown>
) => Promise<void> {
  const toast = useToast();

  return (promise: Promise<unknown>): Promise<void> =>
    promise.then(
      (): void => {
        toast.add({
          color: "green",
          title: "送信しました",
        });
      },
      (error: any): void => {
        const rateLimit: RateLimit | undefined = error?.data?.rateLimit;
        const now = Date.now();
        const description = rateLimit
          ? [
              `Nature API の呼び出しレート制限を超過しました`,
              rateLimit.reset > now
                ? `\nレート制限は${formatTimeAgoLocalized(
                    new Date(rateLimit.reset),
                    {
                      showSecond: true,
                    },
                    now
                  )}解除されます`
                : "",
            ].join("")
          : undefined;
        toast.add({
          color: "red",
          title: "送信に失敗しました",
          description,
        });
      }
    );
}
