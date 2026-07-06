<script setup lang="ts">
import { onMounted } from 'vue'
import { useApiRequest } from '@/composables/useApiRequest'

const props = withDefaults(defineProps<{ section?: string }>(), { section: 'home' })

interface BannerResponse {
  status: string
  image: string
  url?: string
}

const { data, execute } = useApiRequest<BannerResponse>()

onMounted(() => {
  execute({ url: '/banners/getBanner', query: { section: props.section } })
})
</script>

<template>
  <div v-if="data?.status === 'success' && data.image" :id="`${section}_banner`" class="banner">
    <a v-if="data.url" :href="data.url" target="_blank" rel="noopener noreferrer">
      <img :src="data.image" alt="banner" />
    </a>
    <img v-else :src="data.image" alt="banner" />
  </div>
</template>
