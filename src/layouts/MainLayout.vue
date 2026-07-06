<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'
import logo from '@/assets/logo.png'
import AppMenu from '@/components/menus/AppMenu.vue'
import AccountMenu from '@/components/menus/AccountMenu.vue'
import Footer from '@/components/menus/Footer.vue'
import WhatsAppButton from '@/components/menus/WhatsAppButton.vue'
import { useApiRequest } from '@/composables/useApiRequest'

interface SeoData {
  seo: {
    title: string
    description: string
    keywords: string
  }
}

const route = useRoute()
const showFooter = computed(() => route.path !== '/mensajes')

const { data: settings, execute: fetchSettings } = useApiRequest<SeoData>()

onMounted(() => {
  fetchSettings({ url: '/settings/details' })
})

useHead({
  title: computed(() => settings.value?.seo.title ?? 'BuscaKine'),
  meta: [
    { name: 'description', content: computed(() => settings.value?.seo.description ?? '') },
    { name: 'keywords', content: computed(() => settings.value?.seo.keywords ?? '') },
  ],
})
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="app-header" style="background: var(--color-primary)">
      <header class="content app-header__bar">
        <div class="header_left">
          <router-link to="/" class="app-header__logo">
            <img :src="logo" alt="logo" width="96" />
          </router-link>
          <AppMenu />
        </div>
        <AccountMenu />
      </header>
    </q-header>

    <q-page-container>
      <router-view />
      <Footer v-if="showFooter" />
    </q-page-container>

    <WhatsAppButton />
  </q-layout>
</template>
