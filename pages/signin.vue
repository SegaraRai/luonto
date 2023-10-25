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
        <div class="flex flex-col items-start gap-2 text-sm">
          <ULink
            class="inline-flex items-center gap-1 text-emerald-400"
            to="https://home.nature.global/"
            target="_blank"
          >
            <span
              class="i-mdi-text-box-plus-outline w-[1.25em] h-[1.25em] inline-block"
            />
            トークンの発行
            <span
              class="i-mdi-external-link w-[1.25em] h-[1.25em] inline-block text-gray-400"
            />
          </ULink>
          <ULink
            class="inline-flex items-center gap-1 text-sky-400"
            to="/about"
          >
            <span
              class="i-mdi-help-circle-outline w-[1.25em] h-[1.25em] inline-block"
            />
            このアプリについて
          </ULink>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui/dist/runtime/types";
import { type Input, string, object, minLength } from "valibot";

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
