<template>
  <div class="flex flex-col items-start">
    <UForm ref="form" :schema="schema" :state="state" @submit="submit">
      <UFormGroup label="トークン" name="token">
        <UInput
          v-model="state.token"
          type="password"
          placeholder="O-oooooooooo_AAAAE-A-A-I-A-U_JO-oooooooooooo_AAE-O-A-A-U-U-A-"
          required
        />
      </UFormGroup>
      <UButton type="submit">サインイン</UButton>
    </UForm>
    <ULink to="https://home.nature.global/" target="_blank">
      トークンの発行
    </ULink>
    <ULink to="/about">このアプリについて</ULink>
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
