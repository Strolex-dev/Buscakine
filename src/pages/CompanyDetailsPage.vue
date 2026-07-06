<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useApiRequest } from '@/composables/useApiRequest'
import AppBox from '@/components/shared/AppBox.vue'

interface Company {
  name: string
  logo?: string
  description: string
}

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

const route = useRoute()
const companyId = route.params.company_id as string

const { data: company, execute: fetchCompany } = useApiRequest<{ status: string; data: Company }>()
const { data: blogData, execute: fetchBlogs } = useApiRequest<{ status: string; list: BlogListItem[]; total_pages: number }>()
const page = ref(1)

function loadBlogs() {
  fetchBlogs({ url: '/blog/globalCompanyList', query: { company_id: companyId, page: page.value } })
}

onMounted(() => {
  fetchCompany({ url: '/companies/details', query: { company_id: companyId } })
  loadBlogs()
})
watch(page, loadBlogs)
</script>

<template>
  <q-page class="content">
    <div class="company_content">
      <div class="company_details">
        <img v-if="company?.data?.logo" :src="company.data.logo" :alt="company.data.name" />
        <div class="company_info">
          <h2>{{ company?.data?.name }}</h2>
          <q-separator />
          <p>{{ company?.data?.description }}</p>
        </div>
      </div>

      <q-separator />

      <div id="company_blog" class="blog_entries">
        <AppBox v-for="blog in blogData?.list ?? []" :key="blog.alias" box-class="blog_entry">
          <router-link :to="`/${blog.alias}`" class="blog_link">
            <img v-if="blog.image" class="blog_img" :src="blog.image" :alt="blog.title" />
            <div class="short_blog_content">
              <div class="blog_entry_header">
                <h2>{{ blog.title }}</h2>
                <span class="blog_date">{{ blog.created_at }}</span>
              </div>
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
          </router-link>
        </AppBox>
      </div>

      <div v-if="(blogData?.total_pages ?? 0) > 1" class="pagination_container">
        <q-pagination v-model="page" :max="blogData?.total_pages ?? 1" color="primary" style="margin-top: 20px" />
      </div>
    </div>
  </q-page>
</template>
