import type { FetchContext, FetchResponse } from "ofetch";

export function useFetchSigninRedirectHelper() {
  const nuxtApp = useNuxtApp();

  const onResponseError = ({
    response,
  }: FetchContext & {
    response: FetchResponse<unknown>;
  }): void => {
    if (response.status === 401) {
      nuxtApp.$router.push("/signin");
    }
  };

  return {
    onResponseError,
  };
}
