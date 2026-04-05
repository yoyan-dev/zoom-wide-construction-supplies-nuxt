<template>
  <div class="space-y-8">
    <div class="grid gap-8 lg:grid-cols-12">
      <div class="lg:col-span-7 grid grid-cols-6 gap-4">
        <StorefrontSectionCard class="col-span-6 overflow-hidden" padding="none">
          <USkeleton class="h-[360px] w-full md:h-[500px]" />
        </StorefrontSectionCard>
        <StorefrontSectionCard
          v-for="index in 3"
          :key="index"
          class="col-span-2 overflow-hidden"
          padding="none"
        >
          <USkeleton class="aspect-square w-full" />
        </StorefrontSectionCard>
      </div>

      <div class="lg:col-span-5 space-y-6">
        <StorefrontSectionCard padding="lg">
          <div class="space-y-4">
            <USkeleton class="h-6 w-32 rounded-full" />
            <USkeleton class="h-14 w-full rounded-xl" />
            <USkeleton class="h-5 w-48 rounded-xl" />
          </div>
        </StorefrontSectionCard>

        <StorefrontSectionCard padding="lg">
          <div class="space-y-4">
            <USkeleton class="h-10 w-36 rounded-xl" />
            <USkeleton class="h-5 w-full rounded-xl" />
            <USkeleton class="h-14 w-full rounded-xl" />
            <USkeleton class="h-12 w-full rounded-xl" />
          </div>
        </StorefrontSectionCard>

        <div class="grid grid-cols-2 gap-4">
          <StorefrontSectionCard
            v-for="index in 6"
            :key="index"
            padding="md"
          >
            <div class="space-y-3">
              <USkeleton class="h-4 w-20 rounded-lg" />
              <USkeleton class="h-7 w-24 rounded-lg" />
            </div>
          </StorefrontSectionCard>
        </div>
      </div>
    </div>

    <div class="grid gap-6 xl:grid-cols-2">
      <StorefrontSectionCard
        v-for="index in 2"
        :key="index"
        padding="lg"
      >
        <div class="space-y-4">
          <USkeleton class="h-6 w-40 rounded-lg" />
          <USkeleton class="h-4 w-full rounded-lg" />
          <USkeleton class="h-4 w-11/12 rounded-lg" />
          <USkeleton class="h-4 w-10/12 rounded-lg" />
        </div>
      </StorefrontSectionCard>
    </div>
  </div>
</template>
