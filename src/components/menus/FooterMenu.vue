<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const patientMenuItems = [
  { label: 'INICIO', to: '/' },
  { label: 'QUIENES SOMOS', to: '/quienes-somos' },
  { label: 'BUSCADOR DE KINESIÓLOGOS', to: '/kinesiologos' },
  { label: 'MENSAJES', to: '/mensajes' },
  { label: 'Blog', to: '/blog' },
]

const adminMenuItems = [
  { label: 'Banners', to: '/banners' },
  { label: 'Usuarios', to: '/usuarios' },
  { label: 'Blog', to: '/admin-blog' },
  { label: 'Mensajes', to: '/admin-mensajes' },
  { label: 'Contratos', to: '/admin-contratos' },
]

const menuItems = computed(() => (auth.isAdmin ? adminMenuItems : patientMenuItems))
</script>

<template>
  <div id="footer_menu" class="menu-buttons">
    <router-link v-for="item in menuItems" :key="item.label" :to="item.to" class="footer_link">
      {{ item.label }}
    </router-link>
  </div>
</template>
