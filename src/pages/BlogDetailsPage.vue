<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'
import { useApiRequest } from '@/composables/useApiRequest'
import AppBox from '@/components/shared/AppBox.vue'

interface BlogDetails {
  title: string
  created_at: string
  image?: string
  content: string
  meta_title?: string
  meta_description?: string
}

const route = useRoute()
const details = ref<BlogDetails | null>(null)

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr.replace(' ', 'T'))
  return d.toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })
}

// Banners are stored as <!--BANNER_START-->...<!--BANNER_END--> around plain HTML
// (see BlogEditorDialog.vue); tag them with the bk-banner class here so the CSS
// (rounded corners, responsive padding) applies without baking a class into every
// banner ever saved.
function addBannerClass(html: string): string {
  return html.replace(/<!--BANNER_START-->([\s\S]*?)<!--BANNER_END-->/g, (_match, inner: string) => {
    const patched = inner.replace(/^(<(?:div|a)\s)/, '$1class="bk-banner" ')
    return `<!--BANNER_START-->${patched}<!--BANNER_END-->`
  })
}

// The React app's direct /blog/:alias route never actually resolved blog_id (it only
// worked through the catch-all alias resolver). Resolve the alias properly here via
// /alias/getURL, matching how AliasController.GetURL expects it (bare slug, no slashes).
onMounted(async () => {
  const alias = route.params.alias as string
  const aliasResponse = await useApiRequest<{ status: string; module: string; id: number }>().execute({
    url: '/alias/getURL',
    query: { alias },
  })
  if (aliasResponse.status === 'success' && aliasResponse.module === 'blog') {
    const response = await useApiRequest<{ data: BlogDetails }>().execute({
      url: '/blog/details',
      query: { blog_id: aliasResponse.id },
    })
    details.value = response.data
  }
})

useHead({
  title: () => details.value?.meta_title || details.value?.title || 'Blog',
  meta: [{ name: 'description', content: () => details.value?.meta_description ?? '' }],
})
</script>

<template>
  <q-page v-if="details" class="blog_details">
    <div class="blog_entry_header">
      <h2>{{ details.title }}</h2>
      <span class="blog_date">{{ formatDate(details.created_at) }}</span>
      <img v-if="details.image" :src="details.image" :alt="details.title" class="blog_image" />
      <div class="blog_header_overlay"></div>
    </div>
    <AppBox box-class="blog_entry">
      <div class="blog_content_html" v-html="addBannerClass(details.content)"></div>
    </AppBox>
  </q-page>
</template>
