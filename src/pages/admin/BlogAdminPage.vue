<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { Notify } from 'quasar'
import { useApiRequest } from '@/composables/useApiRequest'
import AppBox from '@/components/shared/AppBox.vue'
import AlertDialog from '@/components/shared/AlertDialog.vue'
import BlogEditorDialog from '@/components/admin/BlogEditorDialog.vue'

interface BlogRow {
  blog_id: number
  title: string
  created_at: string
  author: string
  user_image?: string
}

const { data, execute } = useApiRequest<{ list: BlogRow[]; total_pages: number }>()
const page = ref(1)

function loadList() {
  execute({ url: '/blog/globalList', query: { page: page.value } })
}
onMounted(loadList)
watch(page, loadList)

const openEditor = ref(false)
const openAlert = ref(false)
const activeItem = ref<number | null>(null)

function openNew() {
  activeItem.value = null
  openEditor.value = true
}
function openEdit(blog_id: number) {
  activeItem.value = blog_id
  openEditor.value = true
}
function handleDelete(blog_id: number) {
  activeItem.value = blog_id
  openAlert.value = true
}
async function deleteItem() {
  const response = await useApiRequest<{ status: string }>().execute({ url: '/blog/deleteItem', method: 'POST', body: { blog_id: activeItem.value } })
  if (response.status === 'success') {
    Notify.create({ type: 'positive', message: 'Entrada de blog eliminada con éxito' })
    loadList()
  }
  openAlert.value = false
}
</script>

<template>
  <q-page class="content">
    <div class="blog_title_row">
      <h2 class="titles"><q-icon name="rss_feed" size="25px" />Blog</h2>
      <q-btn unelevated color="primary" icon="add" label="Nueva entrada" @click="openNew" />
    </div>

    <AppBox box-class="blog_entries">
      <q-table
        :rows="data?.list ?? []"
        :columns="[
          { name: 'title', label: 'Título', field: 'title', align: 'left' },
          { name: 'created_at', label: 'Fecha', field: 'created_at', align: 'left' },
          { name: 'author', label: 'Autor', field: 'author', align: 'left' },
          { name: 'actions', label: 'Acciones', field: 'blog_id', align: 'right' },
        ]"
        row-key="blog_id"
        flat
        hide-bottom
      >
        <template #body-cell-author="props">
          <q-td :props="props">
            <div class="blog_author_link">
              <q-avatar size="32px"><img v-if="props.row.user_image" :src="props.row.user_image" /></q-avatar>
              <span>{{ props.row.author }}</span>
            </div>
          </q-td>
        </template>
        <template #body-cell-actions="props">
          <q-td :props="props" class="text-right">
            <q-btn size="sm" unelevated color="primary" icon="edit" label="Editar" style="margin-right: 10px" @click="openEdit(props.row.blog_id)" />
            <q-btn size="sm" flat round color="negative" icon="delete_outline" @click="handleDelete(props.row.blog_id)" />
          </q-td>
        </template>
      </q-table>
    </AppBox>

    <div v-if="(data?.total_pages ?? 0) > 1" class="pagination_container">
      <q-pagination v-model="page" :max="data?.total_pages ?? 1" color="primary" style="margin-top: 20px" />
    </div>

    <BlogEditorDialog v-model:open="openEditor" :blog-id="activeItem" @saved="loadList" />
    <AlertDialog v-model:open="openAlert" subtitle="¿Está seguro que desea eliminar esta entrada de blog?" @confirm="deleteItem" />
  </q-page>
</template>
