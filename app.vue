<template>
  <NuxtLayout>
    <UContainer as="main" class="min-w-[300px]">
      <NuxtErrorBoundary>
        <NuxtPage />
        <template #error="{ error, clearError }">
          <ErrorContent :error="toValue(error)" @handle-error="clearError" />
        </template>
      </NuxtErrorBoundary>
    </UContainer>
  </NuxtLayout>
  <UNotifications />
</template>
