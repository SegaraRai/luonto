<template>
  <AppHeader />
  <slot />
  <ClientOnly>
    <OfflineStatusBar />
  </ClientOnly>
</template>
