<script setup lang="ts">
import { Notify } from 'quasar'
import AppBox from '@/components/shared/AppBox.vue'
import AutocompleteField from '@/components/shared/AutocompleteField.vue'

export interface NursesFilters {
  advanced_wound_care: boolean
  online_advice: boolean
  locations: (number | string)[]
  skills: (number | string)[]
  insurance_types: (number | string)[]
}

const filters = defineModel<NursesFilters>({ required: true })

function toggleMode(key: 'advanced_wound_care' | 'online_advice', checked: boolean) {
  const updated = { ...filters.value, [key]: checked }
  if (!updated.advanced_wound_care && !updated.online_advice) {
    Notify.create({ type: 'warning', message: 'Al menos uno de los filtros debe estar activo.' })
    return
  }
  filters.value = updated
}
</script>

<template>
  <AppBox box-class="filters">
    <span class="filter_title">Filtrar búsqueda</span>
    <div class="filter_section">
      <h3>Prestaciones</h3>
      <q-checkbox
        class="filter_checkbox"
        :model-value="filters.advanced_wound_care"
        label="Kinesiología a Domicilio"
        color="secondary"
        @update:model-value="(val: boolean) => toggleMode('advanced_wound_care', val)"
      />
      <q-checkbox
        class="filter_checkbox"
        :model-value="filters.online_advice"
        label="Kinesiología en Consulta"
        color="secondary"
        @update:model-value="(val: boolean) => toggleMode('online_advice', val)"
      />
    </div>

    <div class="filter_section">
      <h3>Ubicación</h3>
      <AutocompleteField
        label="Comunas"
        endpoint="/locations/comunas/list"
        :render-values="['label', 'region']"
        multiple
        v-model="filters.locations"
      />
    </div>

    <div class="filter_section">
      <h3>Habilidades</h3>
      <AutocompleteField label="Habilidades" endpoint="/skills/list" multiple v-model="filters.skills" />
    </div>
  </AppBox>
</template>
