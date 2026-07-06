<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { Notify } from 'quasar'
import { useApiRequest } from '@/composables/useApiRequest'
import AppBox from '@/components/shared/AppBox.vue'
import AlertDialog from '@/components/shared/AlertDialog.vue'
import ImageUploader from '@/components/shared/ImageUploader.vue'

interface Banner {
  banner_id: number
  section: string
  image: string
  url?: string
}

const { data, execute } = useApiRequest<{ list: Banner[] }>()
const page = ref(1)

function loadList() {
  execute({ url: '/banners/list', query: { page: page.value } })
}
onMounted(loadList)

const openEditor = ref(false)
const openAlert = ref(false)
const activeItem = ref<number | null>(null)
const file = ref<File | null>(null)
const formValues = reactive({ banner_id: null as number | null, section: '', image: '', url: '' })

function openNew() {
  activeItem.value = null
  Object.assign(formValues, { banner_id: null, section: '', image: '', url: '' })
  file.value = null
  openEditor.value = true
}

async function submit() {
  if (!formValues.section) {
    Notify.create({ type: 'negative', message: 'Sección es requerida' })
    return
  }
  if (!formValues.image) {
    Notify.create({ type: 'negative', message: 'Imagen es requerida' })
    return
  }

  const body = new FormData()
  body.append('formValues', JSON.stringify(formValues))
  if (file.value) body.append('image', file.value)

  const response = await useApiRequest<{ message: string }>().execute({ url: '/banners/addedit', method: 'POST', formData: true, body })
  openEditor.value = false
  loadList()
  Notify.create({ type: 'positive', message: response.message })
}

function handleDelete(banner_id: number) {
  activeItem.value = banner_id
  openAlert.value = true
}

async function deleteItem() {
  const response = await useApiRequest<{ status: string }>().execute({ url: '/banners/deleteItem', method: 'POST', body: { banner_id: activeItem.value } })
  if (response.status === 'success') {
    Notify.create({ type: 'positive', message: 'Banner eliminado con éxito' })
    loadList()
  }
  openAlert.value = false
}
</script>

<template>
  <q-page class="content">
    <div class="boxContainerHeader">
      <div class="boxContainerTitle">
        <h2 class="h2_title">Marcas</h2>
        <span class="h2_subtitle">Lista de banners</span>
      </div>
      <q-btn unelevated color="primary" icon="add" label="Crear banner" @click="openNew" />
    </div>

    <AppBox box-class="box100">
      <q-table
        :rows="data?.list ?? []"
        :columns="[
          { name: 'image', label: 'Banner', field: 'image', align: 'left' },
          { name: 'section', label: 'Section', field: 'section', align: 'left' },
          { name: 'actions', label: '', field: 'banner_id', align: 'right' },
        ]"
        row-key="banner_id"
        flat
        hide-bottom
      >
        <template #body-cell-image="props">
          <q-td :props="props"><img :src="props.row.image" :alt="props.row.section" style="width: 100px; height: 50px; object-fit: contain" /></q-td>
        </template>
        <template #body-cell-section="props">
          <q-td :props="props">{{ props.row.section.toUpperCase() }}</q-td>
        </template>
        <template #body-cell-actions="props">
          <q-td :props="props" class="text-right">
            <q-btn size="sm" flat round color="negative" icon="delete_outline" @click="handleDelete(props.row.banner_id)" />
          </q-td>
        </template>
      </q-table>
    </AppBox>

    <q-dialog v-model="openEditor">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="h2_title">Banner</div>
          <span class="h2_subtitle">Editar</span>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <ImageUploader
            uploader-class="banner_image_uploader"
            :image="formValues.image"
            @update:image="(img: string) => (formValues.image = img)"
            @update:file="(f: File) => (file = f)"
          />
          <q-input v-model="formValues.url" label="URL de destino (opcional)" outlined dense hint="Al hacer clic en el banner abrirá esta URL." />
          <q-select
            v-model="formValues.section"
            :options="[{ label: 'Home', value: 'home' }, { label: 'Blog', value: 'blog' }, { label: 'Chat', value: 'chat' }]"
            label="Sección"
            emit-value
            map-options
            outlined
            dense
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="openEditor = false" />
          <q-btn unelevated color="primary" label="Guardar" @click="submit" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <AlertDialog v-model:open="openAlert" subtitle="¿Está seguro que desea eliminar esta banner?" @confirm="deleteItem" />
  </q-page>
</template>
