<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApiRequest } from '@/composables/useApiRequest'
import AppBox from '@/components/shared/AppBox.vue'
import EmptyElement from '@/components/shared/EmptyElement.vue'
import NursesSidebarFilters, { type NursesFilters } from '@/components/nurses/NursesSidebarFilters.vue'

interface NurseListItem {
  alias: string
  name: string
  lastname: string
  region: string
  about_me: string
  image: string
  image_position_x?: number
  image_position_y?: number
  average_rating?: number
  badge?: string
}

const route = useRoute()
const router = useRouter()

const defaultFilters: NursesFilters = {
  advanced_wound_care: true,
  online_advice: false,
  locations: [],
  skills: [],
  insurance_types: [],
}

const filters = reactive<NursesFilters>({ ...defaultFilters })
const page = ref(1)
const filtersLoaded = ref(false)

const { data, execute } = useApiRequest<{ list: NurseListItem[]; total_pages: number }>()

function parseListParam(value: string | string[] | null | undefined) {
  if (!value) return []
  const values = Array.isArray(value) ? value : [value]
  return values.map((v) => JSON.parse(v))
}

onMounted(() => {
  const query = route.query
  filters.advanced_wound_care = query.advanced_wound_care ? query.advanced_wound_care === 'true' : true
  filters.online_advice = query.online_advice ? query.online_advice === 'true' : false
  filters.locations = parseListParam(query.locations as string | string[] | undefined)
  filters.skills = parseListParam(query.skills as string | string[] | undefined)
  filters.insurance_types = parseListParam(query.insurance_types as string | string[] | undefined)
  filtersLoaded.value = true
})

watch(
  [filters, page],
  () => {
    if (!filtersLoaded.value) return

    const params = new URLSearchParams()
    params.set('advanced_wound_care', String(filters.advanced_wound_care))
    params.set('online_advice', String(filters.online_advice))
    filters.locations.forEach((loc) => params.append('locations', JSON.stringify(loc)))
    filters.skills.forEach((skill) => params.append('skills', JSON.stringify(skill)))
    filters.insurance_types.forEach((item) => params.append('insurance_types', JSON.stringify(item)))
    router.replace({ path: route.path, query: Object.fromEntries(params) })

    execute({ url: '/kinesiologists/list', query: { filters, page: page.value } })
  },
  { deep: true },
)

function handlePageChange(value: number) {
  page.value = value
}
</script>

<template>
  <q-page id="kinesiologists_list_container" class="content">
    <NursesSidebarFilters v-model="filters" />

    <div class="kinesiologists_list">
      <template v-if="data?.list?.length">
        <AppBox
          v-for="item in data.list"
          :key="item.alias"
          box-class="nurse_card"
          @click="() => router.push(`/${item.alias}`)"
        >
          <img
            class="nurse_image"
            :src="item.image"
            :alt="item.name"
            :style="{ objectPosition: `${item.image_position_x || 50}% ${item.image_position_y || 50}%` }"
          />

          <div class="nurse_info">
            <div class="nurse_header">
              <h2>{{ item.name }} {{ item.lastname }}</h2>
              <q-rating
                :model-value="Number(item.average_rating) || 0"
                readonly
                size="1.2em"
                color="primary"
                icon="star_rate"
              />
            </div>
            <p class="nurse_subtitle">{{ item.region }}</p>
            <q-chip
              v-if="item.badge"
              :label="item.badge"
              size="sm"
              icon="star"
              style="background: linear-gradient(45deg, #FFD700 30%, #DAA520 90%); color: #6B4423"
            />
            <p class="nurse_description">{{ item.about_me }}</p>
          </div>
        </AppBox>
      </template>
      <EmptyElement v-else title="No se encontraron kinesiólogos" subtitle="Intenta con otros filtros de búsqueda." />

      <q-pagination
        v-if="(data?.total_pages ?? 1) > 1"
        :model-value="page"
        :max="data?.total_pages ?? 1"
        color="primary"
        style="margin-top: 20px; display: flex; justify-content: center"
        @update:model-value="handlePageChange"
      />
    </div>
  </q-page>
</template>
