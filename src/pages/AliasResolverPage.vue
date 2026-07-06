<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApiRequest } from '@/composables/useApiRequest'

// Public blog and nurse cards link to root-level aliases (e.g. "/mi-articulo"), not to the
// explicit /blog/:alias or /kinesiologos/:id routes. This catch-all mirrors the React app's
// AppRoutes alias resolver: look up the alias, then land on the canonical page for it.
const route = useRoute()
const router = useRouter()

onMounted(async () => {
  const alias = route.path.replace(/^\//, '')
  const response = await useApiRequest<{ status: string; module: string; id: number }>().execute({
    url: '/alias/getURL',
    query: { alias },
  })

  if (response.status === 'success' && response.module === 'blog') {
    router.replace(`/blog/${alias}`)
  } else if (response.status === 'success' && response.module === 'kinesiologists') {
    router.replace(`/kinesiologos/${response.id}`)
  } else {
    router.replace('/')
  }
})
</script>

<template>
  <q-page class="flex flex-center">
    <q-spinner color="primary" size="3em" />
  </q-page>
</template>
