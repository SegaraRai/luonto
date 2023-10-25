<template>
  <NuxtLayout>
    <UContainer>
      <NuxtErrorBoundary>
        <NuxtPage />
        <template #error="{ error, clearError }">
          <ErrorContent :error="toValue(error)" @handleError="clearError" />
        </template>
      </NuxtErrorBoundary>
    </UContainer>
  </NuxtLayout>
  <UNotifications />
</template>
