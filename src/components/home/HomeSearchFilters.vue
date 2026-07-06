<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import AutocompleteField from '@/components/shared/AutocompleteField.vue'

interface Filters {
  advanced_wound_care: boolean
  online_advice: boolean
  locations: (number | string)[]
  skills: (number | string)[]
  insurance_types: (number | string)[]
}

const router = useRouter()

const filters = reactive<Filters>({
  advanced_wound_care: true,
  online_advice: false,
  locations: [],
  skills: [],
  insurance_types: [],
})

const insuranceOptions = [
  { value: 'Fonasa', label: 'Fonasa' },
  { value: 'Particular', label: 'Particular' },
  { value: 'Reembolsable con Isapre', label: 'Reembolsable con Isapre' },
]

function setMode(key: 'advanced_wound_care' | 'online_advice') {
  filters.advanced_wound_care = key === 'advanced_wound_care'
  filters.online_advice = key === 'online_advice'
}

function handleSearch() {
  const params = new URLSearchParams()
  params.set('advanced_wound_care', String(filters.advanced_wound_care))
  params.set('online_advice', String(filters.online_advice))
  filters.locations.forEach((loc) => params.append('locations', JSON.stringify(loc)))
  filters.skills.forEach((skill) => params.append('skills', JSON.stringify(skill)))
  filters.insurance_types.forEach((item) => params.append('insurance_types', JSON.stringify(item)))
  router.push({ path: '/kinesiologos', query: Object.fromEntries(params) })
}
</script>

<template>
  <div class="home_filters">
    <div class="input_row">
      <q-btn
        class="filter_button"
        :class="{ filter_is_active: filters.advanced_wound_care }"
        unelevated
        icon="home"
        label="Kinesiología a Domicilio"
        @click="setMode('advanced_wound_care')"
      />
      <q-btn
        class="filter_button"
        :class="{ filter_is_active: filters.online_advice }"
        unelevated
        icon="local_hospital"
        label="Kinesiología en Consulta"
        @click="setMode('online_advice')"
      />
    </div>

    <div class="input_row">
      <AutocompleteField
        label="Comunas"
        endpoint="/locations/comunas/list"
        :render-values="['label', 'region']"
        multiple
        v-model="filters.locations"
      />
      <AutocompleteField label="Especialidades" endpoint="/skills/list" multiple v-model="filters.skills" />
    </div>
    <div class="input_row">
      <AutocompleteField
        label="Atención / pago"
        :preloaded-list="insuranceOptions"
        multiple
        v-model="filters.insurance_types"
      />
    </div>
    <q-btn color="secondary" unelevated label="Buscar Profesionales" @click="handleSearch" />
  </div>
</template>
