<script setup lang="ts">
import { computed } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from '@/stores/auth'

const $q = useQuasar()
const auth = useAuthStore()

const patientMenuItems = [
  { label: 'INICIO', to: '/' },
  { label: 'QUIENES SOMOS', to: '/quienes-somos' },
  { label: 'BUSCADOR DE KINESIÓLOGOS', to: '/kinesiologos' },
  { label: 'MENSAJES', to: '/mensajes' },
  { label: 'BLOG', to: '/blog' },
]

const adminMenuItems = [
  { label: 'Banners', to: '/banners' },
  { label: 'Usuarios', to: '/usuarios' },
  { label: 'Gestión Usuarios', to: '/reporte-usuarios' },
  { label: 'Blog', to: '/admin-blog' },
  { label: 'Mensajes', to: '/admin-mensajes' },
  { label: 'Contratos', to: '/admin-contratos' },
  { label: 'Configuración', to: '/configuracion' },
  { label: 'Distintivos', to: '/distintivos' },
  { label: 'Planes', to: '/planes' },
  { label: 'Empresas', to: '/empresas' },
]

const menuItems = computed(() => (auth.isAdmin ? adminMenuItems : patientMenuItems))
</script>

<template>
  <div v-if="$q.screen.lt.md">
    <q-btn flat round dense icon="menu" color="white">
      <q-menu>
        <q-list style="min-width: 200px">
          <q-item v-for="item in menuItems" :key="item.label" :to="item.to" clickable v-close-popup>
            <q-item-section>{{ item.label }}</q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>
  </div>
  <div v-else class="menu-buttons row">
    <q-btn v-for="item in menuItems" :key="item.label" :to="item.to" flat color="white" :label="item.label" />
  </div>
</template>
