<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { Notify } from 'quasar'
import { useApiRequest } from '@/composables/useApiRequest'
import AppBox from '@/components/shared/AppBox.vue'
import AlertDialog from '@/components/shared/AlertDialog.vue'
import ImageUploader from '@/components/shared/ImageUploader.vue'
import BlogEditorDialog from '@/components/admin/BlogEditorDialog.vue'

interface Company {
  company_id: number
  name: string
  description: string
  logo?: string
}
interface CompanyBlog {
  blog_id: number
  title: string
}

const { data, execute } = useApiRequest<{ status: string; list: Company[] }>()
function loadList() {
  execute({ url: '/companies/list' })
}
onMounted(loadList)

const openEditor = ref(false)
const openAlert = ref(false)
const activeCompany = ref<number | null>(null)
const file = ref<File | null>(null)
const formValues = reactive({ company_id: null as number | null, name: '', description: '', logo: '', url: '' })

const blogsList = ref<CompanyBlog[]>([])
const openBlogEditor = ref(false)
const selectedBlogId = ref<number | null>(null)
const openBlogDeleteAlert = ref(false)
const activeBlogId = ref<number | null>(null)

async function loadCompanyBlogs() {
  if (!activeCompany.value) return
  const response = await useApiRequest<{ status: string; list: CompanyBlog[] }>().execute({
    url: '/blog/companyList',
    query: { company_id: activeCompany.value },
  })
  if (response.status === 'success') blogsList.value = response.list
}

async function openNew() {
  activeCompany.value = null
  Object.assign(formValues, { company_id: null, name: '', description: '', logo: '', url: '' })
  file.value = null
  blogsList.value = []
  openEditor.value = true
}

async function openEdit(company_id: number) {
  activeCompany.value = company_id
  const response = await useApiRequest<{ status: string; data: Company & { url?: string } }>().execute({
    url: '/companies/details',
    query: { company_id },
  })
  Object.assign(formValues, response.data)
  file.value = null
  await loadCompanyBlogs()
  openEditor.value = true
}

async function submit() {
  if (!formValues.name) return
  const body = new FormData()
  body.append('formValues', JSON.stringify(formValues))
  if (file.value) body.append('logo', file.value)

  await useApiRequest().execute({ url: '/companies/addedit', method: 'POST', formData: true, body })
  Notify.create({ type: 'positive', message: activeCompany.value ? 'Empresa actualizada correctamente' : 'Empresa creada correctamente' })
  openEditor.value = false
  loadList()
}

function handleDelete(company_id: number) {
  activeCompany.value = company_id
  openAlert.value = true
}

async function deleteCompany() {
  const response = await useApiRequest<{ status: string }>().execute({ url: '/companies/delete', method: 'POST', body: { company_id: activeCompany.value } })
  if (response.status === 'success') {
    Notify.create({ type: 'positive', message: 'Empresa eliminada correctamente' })
    loadList()
  } else {
    Notify.create({ type: 'negative', message: 'Error al eliminar empresa' })
  }
  openAlert.value = false
}

function handleBlogDelete(blog_id: number) {
  activeBlogId.value = blog_id
  openBlogDeleteAlert.value = true
}

async function deleteBlog() {
  const response = await useApiRequest<{ status: string }>().execute({ url: '/blog/deleteItem', method: 'POST', body: { blog_id: activeBlogId.value } })
  if (response.status === 'success') {
    Notify.create({ type: 'positive', message: 'Entrada de blog eliminada con éxito' })
    loadCompanyBlogs()
  }
  openBlogDeleteAlert.value = false
}
</script>

<template>
  <q-page class="content">
    <div class="boxContainerHeader">
      <div class="boxContainerTitle">
        <h2 class="h2_title">Empresas</h2>
        <span class="h2_subtitle">{{ data?.list?.length ?? 0 }} empresas registradas</span>
      </div>
      <q-btn unelevated color="primary" icon="add" label="Agregar Empresa" @click="openNew" />
    </div>

    <AppBox box-class="box100">
      <q-table
        :rows="data?.list ?? []"
        :columns="[
          { name: 'logo', label: 'Logo', field: 'logo', align: 'left' },
          { name: 'name', label: 'Nombre', field: 'name', align: 'left' },
          { name: 'description', label: 'Descripción', field: 'description', align: 'left' },
          { name: 'actions', label: 'Acciones', field: 'company_id', align: 'right' },
        ]"
        row-key="company_id"
        flat
        hide-bottom
      >
        <template #body-cell-logo="props">
          <q-td :props="props"><img v-if="props.row.logo" :src="props.row.logo" alt="Logo" style="height: 40px; max-width: 100px" /><span v-else>-</span></q-td>
        </template>
        <template #body-cell-actions="props">
          <q-td :props="props" class="text-right">
            <q-btn size="sm" unelevated color="primary" icon="edit" label="Editar" style="margin-right: 10px" @click="openEdit(props.row.company_id)" />
            <q-btn size="sm" flat round color="negative" icon="delete" @click="handleDelete(props.row.company_id)" />
          </q-td>
        </template>
      </q-table>
    </AppBox>

    <q-dialog v-model="openEditor">
      <q-card style="min-width: 500px">
        <q-card-section><div class="text-h6">{{ activeCompany ? 'Editar empresa' : 'Añadir empresa' }}</div></q-card-section>
        <q-card-section class="q-gutter-md">
          <ImageUploader
            uploader-class="company_logo_uploader"
            :image="formValues.logo"
            label="Logo de la empresa"
            @update:image="(img: string) => (formValues.logo = img)"
            @update:file="(f: File) => (file = f)"
          />
          <q-input v-model="formValues.name" label="Nombre" outlined dense required />
          <q-input v-model="formValues.url" label="URL de destino (opcional)" outlined dense hint="Al hacer clic en el logo se abrirá esta URL." />
          <q-input v-model="formValues.description" label="Descripción" type="textarea" outlined dense />

          <div v-if="activeCompany" class="company_blogs_section">
            <div class="blogs_list_header">
              <h3>Entradas de esta empresa</h3>
              <q-btn unelevated color="primary" icon="add" label="Nueva" @click="() => { selectedBlogId = null; openBlogEditor = true }" />
            </div>

            <div v-if="blogsList.length > 0">
              <div v-for="blog in blogsList" :key="blog.blog_id" class="blog_list_item">
                {{ blog.title }}
                <div>
                  <q-btn flat dense size="sm" label="Editar" @click="() => { selectedBlogId = blog.blog_id; openBlogEditor = true }" />
                  <q-btn flat dense round size="sm" color="negative" icon="delete_outline" @click="handleBlogDelete(blog.blog_id)" />
                </div>
              </div>
            </div>
            <p v-else>No hay blogs asociados</p>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="openEditor = false" />
          <q-btn unelevated color="primary" :disable="!formValues.name" label="Guardar" @click="submit" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <BlogEditorDialog
      v-model:open="openBlogEditor"
      :blog-id="selectedBlogId"
      source="companies"
      :company-id="activeCompany"
      @saved="loadCompanyBlogs"
    />

    <AlertDialog v-model:open="openAlert" subtitle="¿Está seguro que desea eliminar esta empresa?" @confirm="deleteCompany" />
    <AlertDialog v-model:open="openBlogDeleteAlert" subtitle="¿Está seguro que desea eliminar esta entrada de blog?" @confirm="deleteBlog" />
  </q-page>
</template>
