<template>
  <div
    class="flex flex-col items-center justify-center fixed inset-0 w-full h-full"
  >
    <UCard class="w-full max-w-lg">
      <div class="w-full flex flex-col items-stretch gap-4">
        <UForm ref="form" :schema="schema" :state="state" @submit="submit">
          <div class="flex flex-col items-stretch gap-2">
            <UFormGroup label="トークン" name="token">
              <UInput
                v-model="state.token"
                type="password"
                placeholder="O-oooooooooo_AAAAE-A-A-I-A-U_JO-oooooooooooo_AAE-O-A-A-U-U-A-"
                required
              />
            </UFormGroup>
            <div class="text-center">
              <UButton variant="solid" type="submit">サインイン</UButton>
            </div>
          </div>
        </UForm>
        <div class="flex items-end justify-between gap-2">
          <div class="flex flex-col items-start gap-2 text-sm">
            <ULink
              class="inline-flex items-center gap-1 text-emerald-400"
              to="https://home.nature.global/"
              target="_blank"
            >
              <UIcon class="text-lg" name="i-mdi-text-box-plus-outline" />
              トークンの発行
              <UIcon class="text-gray-400 -mt-1" name="i-mdi-external-link" />
            </ULink>
            <ULink
              class="inline-flex items-center gap-1 text-sky-400"
              to="/about"
            >
              <UIcon class="text-lg" name="i-mdi-help-circle-outline" />
              このアプリについて
            </ULink>
          </div>
          <ThemeSelector placement="left" />
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui/dist/runtime/types";
import { type Input, string, object, minLength } from "valibot";

useHead({
  title: composeTitle("サインイン"),
  meta: getCommonMeta(),
  link: getCommonLink(),
  htmlAttrs: {
    lang: "ja",
  },
});

const { signIn } = useAuth();

const schema = object({
  token: string([minLength(48, "Must be at least 48 characters")]),
});
type Schema = Input<typeof schema>;

const state = ref<Partial<Schema>>({
  token: undefined,
});

const form = ref();
const submit = async (event: FormSubmitEvent<Schema>): Promise<void> => {
  const { token } = event.data;
  if (!token) {
    return;
  }

  try {
    form.value.clear();
    await signIn("credentials", {
      token,
      callbackUrl: "/",
      redirect: true,
    });
  } catch (error) {
    form.value.setErrors([
      {
        path: "token",
        message: "Invalid token",
      },
    ]);
    return;
  }
};
</script>
