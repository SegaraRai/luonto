<template>
  <div class="h-16">
    <div
      class="fixed z-10 top-0 left-0 right-0 h-16 flex px-4 gap-4 items-center justify-end border-b border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900"
    >
      <ULink to="/" class="flex-none text-2xl font-bold">Luonto</ULink>
      <div class="flex-1" />
      <template v-if="user">
        <ThemeSelector placement="left" />
        <UDropdown
          v-if="user.name != null"
          :items="items"
          :ui="{ item: { disabled: 'cursor-text select-text opacity-100' } }"
        >
          <div role="img" aria-label="アカウント">
            <UAvatar
              class="select-none"
              :alt="user.name ?? undefined"
              size="sm"
            />
          </div>
          <template #account>
            <div class="flex flex-col gap-2 text-start items-start">
              <div class="text-sm font-bold text-gray-600 dark:text-gray-300">
                {{ user.name }} としてサインイン中
              </div>
              <div
                class="text-xs text-gray-400 dark:text-gray-500"
                v-text="userId"
              />
            </div>
          </template>
          <template #item="{ item }">
            <span class="truncate">{{ item.label }}</span>
            <UIcon
              :name="item.icon"
              class="flex-shrink-0 h-4 w-4 text-gray-400 dark:text-gray-500 ms-auto"
            />
          </template>
        </UDropdown>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const { signOut, user } = useAuth();

const toast = useToast();

const signOutHandler = (): void => {
  signOut().then(
    (): void => {
      toast.add({
        color: "blue",
        title: "サインアウトしました",
      });
      navigateTo("/");
    },
    (): void => {
      toast.add({
        color: "red",
        title: "サインアウトできませんでした",
      });
    }
  );
};

const items = computed(() => [
  [
    {
      slot: "account",
      disabled: true,
      label: user.value?.name ?? "",
    },
  ],
  [
    {
      label: "サインアウト",
      icon: "i-ph-sign-out-bold",
      onClick: signOutHandler,
    },
  ],
]);

const userId = computed(() => JSON.parse(user.value?.email || "{}").id);
</script>
