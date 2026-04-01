<template>
  <div class="space-y-6">
    <div class="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.9fr)]">
      <USkeleton class="h-[520px] rounded-lg" />
      <USkeleton class="h-[520px] rounded-lg" />
    </div>
    <USkeleton class="h-[340px] rounded-lg" />
    <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <USkeleton v-for="idx in 3" :key="idx" class="h-[360px] rounded-lg" />
    </div>
  </div>
</template>
