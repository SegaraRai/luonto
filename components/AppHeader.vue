<template>
  <div class="h-16">
    <div
      class="fixed top-0 left-0 right-0 h-16 flex px-4 gap-4 items-center justify-end border-b dark:border-gray-600 dark:bg-gray-800"
    >
      <ULink to="/" class="flex-none text-2xl font-bold">Luonto</ULink>
      <div class="flex-1" />
      <template v-if="user">
        <UTooltip :text="`${user.name} としてサインイン中`">
          <UAvatar :alt="user.name ?? undefined" size="sm" />
        </UTooltip>
        <UButton variant="outline" @click="signOutHandler">
          サインアウト
        </UButton>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const { signOut, user } = useAuth();

const signOutHandler = async () => {
  await signOut();
  navigateTo("/");
};
</script>
