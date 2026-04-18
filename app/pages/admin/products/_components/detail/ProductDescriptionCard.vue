<script setup lang="ts">
import type { Product } from "~/types/product";

const props = defineProps<{
  product: Product;
}>();
</script>

<template>
  <UCard>
    <div class="space-y-4">
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Description
        </p>
        <p class="mt-2 text-sm leading-7 text-slate-700">
          {{
            props.product.description?.trim() ||
            "No product description has been added yet."
          }}
        </p>
      </div>

      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Handbook Summary
        </p>
        <p class="mt-2 text-sm leading-7 text-slate-700">
          {{
            props.product.handbook?.summary?.trim() ||
            "No handbook summary has been provided yet."
          }}
        </p>
      </div>
    </div>
  </UCard>
</template>
