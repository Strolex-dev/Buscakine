<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { Notify } from 'quasar'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { useApiRequest } from '@/composables/useApiRequest'
import AppBox from '@/components/shared/AppBox.vue'

const formValues = reactive({ title: '', description: '', keywords: '', terms_content: '', preferente_terms: '' })
const loading = ref(false)

const toolbarOptions = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['link'],
  ['clean'],
]

onMounted(async () => {
  const response = await useApiRequest<{ seo: typeof formValues }>().execute({ url: '/settings/details' })
  Object.assign(formValues, response.seo)
})

async function handleSubmit() {
  if (!formValues.title) return Notify.create({ type: 'negative', message: 'Título es requerido' })
  if (!formValues.description) return Notify.create({ type: 'negative', message: 'Descripción es requerida' })
  if (!formValues.keywords) return Notify.create({ type: 'negative', message: 'Palabra clave es requerida' })

  loading.value = true
  await useApiRequest().execute({ url: '/settings/update', method: 'POST', body: formValues })
  loading.value = false
  Notify.create({ type: 'positive', message: 'Datos guardados' })
}
</script>

<template>
  <q-page class="content">
    <div class="blog_title_row">
      <h2 class="titles">Configuración</h2>
    </div>

    <AppBox>
      <h2>SEO</h2>
      <q-input v-model="formValues.title" label="Título" outlined dense class="q-mb-sm" />
      <q-input v-model="formValues.description" label="Descripción" type="textarea" outlined dense class="q-mb-sm" />
      <q-input v-model="formValues.keywords" label="Palabras clave" outlined dense class="q-mb-md" />
    </AppBox>

    <AppBox style="margin-top: 24px">
      <h2>Términos y Condiciones</h2>
      <p style="color: #666; margin-bottom: 12px">Contenido visible en la página /terminos.</p>
      <div style="margin-bottom: 60px">
        <QuillEditor v-model:content="formValues.terms_content" content-type="html" :toolbar="toolbarOptions" style="height: 400px" />
      </div>
    </AppBox>

    <AppBox style="margin-top: 24px">
      <h2>Condiciones de Derivación Preferente</h2>
      <p style="color: #666; margin-bottom: 12px">
        Este texto se muestra a los kinesiólogos cuando seleccionan la Derivación Preferente en su perfil.
      </p>
      <div style="margin-bottom: 60px">
        <QuillEditor v-model:content="formValues.preferente_terms" content-type="html" :toolbar="toolbarOptions" style="height: 300px" />
      </div>
    </AppBox>

    <div style="margin-top: 24px">
      <q-btn :loading="loading" unelevated color="primary" label="Guardar todo" @click="handleSubmit" />
    </div>
  </q-page>
</template>
