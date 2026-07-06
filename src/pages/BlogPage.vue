<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useApiRequest } from '@/composables/useApiRequest'
import AppBox from '@/components/shared/AppBox.vue'
import Banner from '@/components/shared/Banner.vue'

interface BlogListItem {
  alias: string
  title: string
  created_at: string
  image?: string
  short_content: string
  author: string
  user_image?: string
  user_id: number
}

const { data, execute } = useApiRequest<{ list: BlogListItem[]; total_pages: number }>()
const page = ref(1)

function loadList() {
  execute({ url: '/blog/globalList', query: { page: page.value } })
}

onMounted(loadList)
watch(page, loadList)
</script>

<template>
  <q-page>
    <Banner section="blog" />
    <div class="content">
      <div class="blog_title_row">
        <h2 class="titles"><q-icon name="rss_feed" size="25px" />Blog</h2>
      </div>

      <div class="blog_entries">
        <AppBox v-for="blog in data?.list ?? []" :key="blog.alias" box-class="blog_entry">
          <div class="blog_entry_header">
            <router-link :to="`/${blog.alias}`" class="blog_link">
              <h2>{{ blog.title }}</h2>
            </router-link>
            <span class="blog_date">{{ blog.created_at }}</span>
          </div>
          <div class="short_blog_content">
            <img v-if="blog.image" :src="blog.image" :alt="blog.title" />
            <div class="short_blog_content_text">
              <p class="p_short_content" v-html="blog.short_content"></p>
              <div class="blog_author">
                <router-link class="blog_author_link" :to="`/kinesiologos/${blog.user_id}`">
                  <span>Por: {{ blog.author }}</span>
                  <q-avatar size="32px"><img v-if="blog.user_image" :src="blog.user_image" /></q-avatar>
                </router-link>
              </div>
            </div>
          </div>
        </AppBox>
      </div>

      <div v-if="(data?.total_pages ?? 0) > 1" class="pagination_container">
        <q-pagination v-model="page" :max="data?.total_pages ?? 1" color="primary" style="margin-top: 20px" />
      </div>
    </div>
  </q-page>
</template>
