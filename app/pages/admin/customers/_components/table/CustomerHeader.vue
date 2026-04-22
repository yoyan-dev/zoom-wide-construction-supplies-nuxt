<script setup lang="ts">
import AdminPageHeader from "../../../_components/AdminPageHeader.vue";
import {
  getCustomerTypeCreateLabel,
  getCustomerTypeDescription,
  getCustomerTypeLabel,
} from "../customer-options";
import type { CustomerType } from "~/types/customer";

const props = defineProps<{
  total: number;
  customerType: CustomerType;
}>();

const emit = defineEmits<{
  (e: "create"): void;
}>();
</script>

<template>
  <AdminPageHeader
    :eyebrow="`${getCustomerTypeLabel(props.customerType)} Accounts`"
    :title="`${getCustomerTypeLabel(props.customerType)} Management`"
    :description="getCustomerTypeDescription(props.customerType)"
    :total="props.total"
    :total-label="`${props.customerType}s`"
    :action-label="getCustomerTypeCreateLabel(props.customerType)"
    @action="emit('create')"
  />
</template>
