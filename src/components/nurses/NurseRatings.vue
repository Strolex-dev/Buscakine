<script setup lang="ts">
import { onMounted } from 'vue'
import { useApiRequest } from '@/composables/useApiRequest'

const props = defineProps<{ userId: string | number }>()

interface RatingItem {
  rating_id: number
  rating_value: number
  comment: string
  name?: string
}

const { data, execute } = useApiRequest<RatingItem[]>()

onMounted(() => {
  execute({ url: '/ratings/lastRatings', query: { user_id: props.userId } })
})
</script>

<template>
  <div class="kinesiologists_ratings">
    <h2 class="titles">Últimas Reseñas</h2>

    <template v-if="data && data.length > 0">
      <div v-for="item in data" :key="item.rating_id" class="rating_card">
        <p class="rating_comment">{{ item.comment }}</p>
        <div class="rating_author">
          <span class="rating_name">{{ item.name }}</span>
          <q-rating :model-value="item.rating_value" readonly size="1.2em" color="primary" icon="star_rate" />
        </div>
      </div>
    </template>
    <p v-else>No se encontraron reseñas</p>
  </div>
</template>
