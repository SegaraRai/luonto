<template>
  <div class="flex flex-col items-center justify-center w-full h-[100dvh]">
    <UCard class="w-full sm:max-w-lg">
      <div class="w-full flex flex-col items-stretch gap-6">
        <UForm ref="form" :schema="schema" :state="state" @submit="submit">
          <div class="flex flex-col items-stretch gap-3">
            <UFormGroup
              label="アクセストークン"
              name="nature_access_token"
              description="アクセストークンはローカルで処理され、Nature の API サーバーに直接送信されます（それ以外には送信されません）"
            >
              <UInput
                v-model="state.token"
                type="password"
                autocomplete="current-password"
                placeholder="O-oooooooooo_AAAAE-A-A-I-A-U_JO-oooooooooooo_AAE-O-A-A-U-U-A-"
                required
              />
            </UFormGroup>
            <UButton
              class="justify-center"
              type="submit"
              variant="solid"
              :disabled="!state.token"
            >
              サインイン
            </UButton>
          </div>
        </UForm>
        <div class="flex items-end justify-between gap-2">
          <div class="flex flex-col items-start gap-2 text-sm">
            <ULink
              class="inline-flex items-center gap-1 text-emerald-400 rounded"
              :class="STYLE_FOCUS_VISIBLE_RING"
              to="https://home.nature.global/"
              target="_blank"
            >
              <UIcon class="text-lg" name="i-mdi:key-chain" />
              アクセストークンの発行
              <UIcon class="text-gray-400 -mt-0.5" name="i-mdi:external-link" />
            </ULink>
            <ULink
              class="inline-flex items-center gap-1 text-sky-400 rounded"
              :class="STYLE_FOCUS_VISIBLE_RING"
              to="/about"
            >
              <UIcon class="text-lg" name="i-mdi:help-circle-outline" />
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
import type { FormSubmitEvent } from "#ui/types";
import { minLength, object, pipe, string, type InferOutput } from "valibot";

useHead({
  title: "サインイン",
  titleTemplate: UNHEAD_TITLE_TEMPLATE,
  templateParams: getCommonTemplateParams(),
  meta: getCommonMeta(),
  link: getCommonLink(),
  script: getCommonScript(),
  htmlAttrs: {
    lang: "ja",
  },
});

const { signIn } = useAuth();

const schema = object({
  token: pipe(string(), minLength(48, "Must be at least 48 characters")),
});
type Schema = InferOutput<typeof schema>;

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
  } catch {
    form.value.setErrors([
      {
        path: "nature_access_token",
        message: "アクセストークンが無効か、レート制限中です",
      },
    ]);
    return;
  }
};
</script>
