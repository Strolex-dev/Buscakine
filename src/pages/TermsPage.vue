<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useApiRequest } from '@/composables/useApiRequest'

const termsContent = ref('')

onMounted(async () => {
  const response = await useApiRequest<{ seo: { terms_content?: string } }>().execute({ url: '/settings/details' })
  termsContent.value = response.seo?.terms_content ?? ''
})
</script>

<template>
  <q-page class="content terms_page">
    <div v-if="termsContent" v-html="termsContent"></div>
  </q-page>
</template>
