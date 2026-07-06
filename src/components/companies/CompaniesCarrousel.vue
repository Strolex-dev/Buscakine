<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useApiRequest } from '@/composables/useApiRequest'

interface Company {
  company_id: number
  name: string
  logo: string
  url?: string
}

const { data, execute } = useApiRequest<{ status: string; list: Company[] }>()
const slide = ref('')

onMounted(async () => {
  const response = await execute({ url: '/companies/carouselList' })
  if (response?.list?.length) {
    slide.value = String(response.list[0].company_id)
  }
})
</script>

<template>
  <div v-if="data?.list?.length" class="companies_carrousel">
    <h2 class="carrousel_title">Marcas Asociadas</h2>
    <q-carousel
      v-model="slide"
      animated
      infinite
      autoplay
      arrows
      height="120px"
      control-color="primary"
    >
      <q-carousel-slide
        v-for="company in data.list"
        :key="company.company_id"
        :name="String(company.company_id)"
        class="row items-center justify-center q-gutter-md"
      >
        <div class="carrousel_company_logo">
          <a v-if="company.url" :href="company.url" target="_blank" rel="noopener noreferrer">
            <img :src="company.logo" :alt="company.name" />
          </a>
          <router-link v-else :to="`/empresas/${company.company_id}`">
            <img :src="company.logo" :alt="company.name" />
          </router-link>
        </div>
      </q-carousel-slide>
    </q-carousel>
  </div>
</template>
