<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { Notify } from 'quasar'
import { api } from '@/boot/axios'
import { useApiRequest } from '@/composables/useApiRequest'
import ImageUploader from '@/components/shared/ImageUploader.vue'

const props = defineProps<{ blogId: number | null; source?: string; companyId?: number | null }>()
const open = defineModel<boolean>('open', { required: true })
const emit = defineEmits<{ saved: [] }>()

interface FormValues {
  blog_id: number | null
  title: string
  content: string
  image: string
  meta_title: string
  meta_description: string
  alias: string
  meta_keys: string
  source: string
  company_id: number | null
}

function defaultValues(): FormValues {
  return {
    blog_id: props.blogId,
    title: '',
    content: '',
    image: '',
    meta_title: '',
    meta_description: '',
    alias: '',
    meta_keys: '',
    source: props.source || 'blog',
    company_id: props.companyId || null,
  }
}

const formValues = reactive<FormValues>(defaultValues())
const loading = ref(false)
const file = ref<File | null>(null)
const quillRef = ref<InstanceType<typeof QuillEditor> | null>(null)

// ---------------------------------------------------------------------------
// Banner / CTA system. Quill's Delta format silently strips arbitrary inline
// CSS (position:relative, background-image, etc), so banners live OUTSIDE the
// Quill document: a plain-text marker "📌 [BANNER:id]" holds their position,
// and the real HTML is swapped in via <!--BANNER_START-->/<!--BANNER_END-->
// comments only at save time (and reversed on load). See EEH_Referencia_para_Bucakine.md.
// ---------------------------------------------------------------------------
interface BannerParams {
  bgType: 'color' | 'image'
  bgColor: string
  bgImage: string
  text: string
  btnText: string
  link: string
}
interface BannerItem {
  id: string
  html: string
  params?: BannerParams
}

function parseBannerHtml(html: string): BannerParams {
  const trimmed = html.trimStart()
  if (trimmed.startsWith('<a ')) {
    const hrefMatch = html.match(/href="([^"]*)"/)
    const srcMatch = html.match(/src="([^"]*)"/)
    return { bgType: 'image', bgImage: srcMatch?.[1] || '', link: hrefMatch?.[1] || '/', text: '', btnText: '', bgColor: '#005F6A' }
  }
  if (html.includes('background-image:url(')) {
    const imgMatch = html.match(/background-image:url\(([^)]+)\)/)
    const pMatch = html.match(/<p [^>]*>([^<]*)<\/p>/)
    const aMatch = html.match(/<a href="([^"]*)"[^>]*>([^<]*)<\/a>/)
    return { bgType: 'image', bgImage: imgMatch?.[1] || '', link: aMatch?.[1] || '/', text: pMatch?.[1] || '', btnText: aMatch?.[2] || '', bgColor: '#005F6A' }
  }
  const bgMatch = html.match(/background:([^;,]+)/)
  const pMatch = html.match(/<p [^>]*>([^<]*)<\/p>/)
  const aMatch = html.match(/<a href="([^"]*)"[^>]*>([^<]*)<\/a>/)
  return { bgType: 'color', bgColor: bgMatch?.[1]?.trim() || '#005F6A', bgImage: '', link: aMatch?.[1] || '/', text: pMatch?.[1] || '', btnText: aMatch?.[2] || '' }
}

function parseBanners(fullContent: string): { mainContent: string; banners: BannerItem[] } {
  const banners: BannerItem[] = []
  let counter = 0
  const mainContent = fullContent
    .replace(/<!--BANNER_START-->([\s\S]*?)<!--BANNER_END-->/g, (_match, html: string) => {
      counter++
      const id = `banner_loaded_${Date.now()}_${counter}`
      banners.push({ id, html, params: parseBannerHtml(html) })
      return `<p>📌 [BANNER:${id}]</p>`
    })
    .trim()
  return { mainContent, banners }
}

const bannerList = ref<BannerItem[]>([])
const pendingBannerPos = ref<number | null>(null)
const bannerDialog = ref(false)
const editingBannerId = ref<string | null>(null)
const bannerText = ref('¿Necesitas un kinesiólogo especializado?')
const bannerBtnText = ref('Buscar Kinesiólogo')
const bannerLink = ref('/kinesiologos')
const bannerBgType = ref<'color' | 'image'>('color')
const bannerBgColor = ref('#005F6A')
const bannerBgImage = ref('')
const bannerUploading = ref(false)

function triggerBannerImageUpload() {
  if (bannerUploading.value) return
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e: Event) => {
    const f = (e.target as HTMLInputElement).files?.[0]
    if (f) handleBannerImageUpload(f)
  }
  input.click()
}

async function handleBannerImageUpload(uploadedFile: File) {
  bannerUploading.value = true
  const body = new FormData()
  body.append('image', uploadedFile)
  try {
    const { data } = await api.post('/blog/upload-image', body, { headers: { 'Content-Type': 'multipart/form-data' } })
    bannerBgImage.value = data.imageUrl
  } catch {
    Notify.create({ type: 'negative', message: 'Error al subir la imagen de fondo' })
  } finally {
    bannerUploading.value = false
  }
}

function openBannerDialog() {
  editingBannerId.value = null
  bannerText.value = '¿Necesitas un kinesiólogo especializado?'
  bannerBtnText.value = 'Buscar Kinesiólogo'
  bannerLink.value = '/kinesiologos'
  bannerBgType.value = 'color'
  bannerBgColor.value = '#005F6A'
  bannerBgImage.value = ''
  const quill = quillRef.value?.getQuill()
  const range = quill?.getSelection()
  pendingBannerPos.value = range ? range.index : null
  bannerDialog.value = true
}

function editBanner(banner: BannerItem) {
  if (banner.params) {
    bannerBgType.value = banner.params.bgType
    bannerBgColor.value = banner.params.bgColor
    bannerBgImage.value = banner.params.bgImage
    bannerText.value = banner.params.text
    bannerBtnText.value = banner.params.btnText
    bannerLink.value = banner.params.link
  }
  editingBannerId.value = banner.id
  bannerDialog.value = true
}

function removeBanner(id: string) {
  bannerList.value = bannerList.value.filter((b) => b.id !== id)
  const quill = quillRef.value?.getQuill()
  if (!quill) return
  const text = quill.getText()
  const marker = `📌 [BANNER:${id}]`
  const idx = text.indexOf(marker)
  if (idx !== -1) {
    const start = idx > 0 && text[idx - 1] === '\n' ? idx - 1 : idx
    quill.deleteText(start, marker.length + (start < idx ? 1 : 0) + 1)
  }
}

function insertBanner() {
  const id = `banner_${Date.now()}`
  const num = bannerList.value.length + 1
  const hasText = bannerText.value.trim() !== ''
  const hasBtn = bannerBtnText.value.trim() !== ''

  let html: string
  if (bannerBgType.value === 'image' && bannerBgImage.value) {
    if (!hasText && !hasBtn) {
      html =
        `<a class="bk-banner" href="${bannerLink.value}" style="display:block;text-decoration:none;border-radius:10px;overflow:hidden;margin:20px 0;">` +
        `<img src="${bannerBgImage.value}" style="width:100%;display:block;border-radius:10px;" /></a>`
    } else {
      html =
        `<div class="bk-banner" style="position:relative;background-image:url(${bannerBgImage.value});background-size:cover;background-position:center;padding:48px 24px;text-align:center;border-radius:10px;margin:20px 0;overflow:hidden;">` +
        `<div style="position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);border-radius:10px;"></div>` +
        `<div style="position:relative;z-index:1;">` +
        (hasText ? `<p style="color:#fff;font-size:18px;font-weight:600;margin:0 0 14px 0;">${bannerText.value}</p>` : '') +
        (hasBtn ? `<a href="${bannerLink.value}" style="background:#fff;color:#005F6A;padding:10px 28px;border-radius:5px;text-decoration:none;font-weight:700;font-size:15px;">${bannerBtnText.value}</a>` : '') +
        `</div></div>`
    }
  } else {
    html =
      `<div class="bk-banner" style="background:${bannerBgColor.value};padding:24px 20px;text-align:center;border-radius:10px;margin:20px 0;">` +
      (hasText ? `<p style="color:#fff;font-size:18px;font-weight:600;margin:0 0 14px 0;">${bannerText.value}</p>` : '') +
      (hasBtn ? `<a href="${bannerLink.value}" style="background:#fff;color:${bannerBgColor.value};padding:10px 28px;border-radius:5px;text-decoration:none;font-weight:700;font-size:15px;">${bannerBtnText.value}</a>` : '') +
      `</div>`
  }

  const params: BannerParams = {
    bgType: bannerBgType.value,
    bgColor: bannerBgColor.value,
    bgImage: bannerBgImage.value,
    text: bannerText.value,
    btnText: bannerBtnText.value,
    link: bannerLink.value,
  }

  if (editingBannerId.value) {
    bannerList.value = bannerList.value.map((b) => (b.id === editingBannerId.value ? { ...b, html, params } : b))
    editingBannerId.value = null
    bannerDialog.value = false
    Notify.create({ type: 'positive', message: 'Banner actualizado' })
    return
  }

  const quill = quillRef.value?.getQuill()
  if (quill) {
    const index = pendingBannerPos.value ?? quill.getLength() - 1
    const marker = `📌 [BANNER:${id}]`
    quill.insertText(index, '\n' + marker + '\n', 'user')
  }

  bannerList.value = [...bannerList.value, { id, html, params }]
  bannerDialog.value = false
  Notify.create({ type: 'info', message: `Banner #${num} insertado en la posición del cursor` })
}

watch(open, async (isOpen) => {
  if (!isOpen) return
  if (props.blogId) {
    const response = await useApiRequest<{ data: Partial<FormValues> }>().execute({ url: '/blog/details', query: { blog_id: props.blogId } })
    const { mainContent, banners } = parseBanners(response.data.content ?? '')
    Object.assign(formValues, {
      ...response.data,
      content: mainContent,
      source: response.data.source || props.source || 'blog',
      company_id: response.data.company_id || props.companyId || null,
    })
    bannerList.value = banners
  } else {
    Object.assign(formValues, defaultValues())
    file.value = null
    bannerList.value = []
  }
})

function formatYouTubeUrl(url: string): string {
  const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.+&v=)([^&]+)/)
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/)
  const embedMatch = url.match(/youtube\.com\/embed\/([^?&]+)/)
  const videoId = watchMatch?.[1] ?? shortMatch?.[1] ?? embedMatch?.[1]
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url
}

async function imageHandler() {
  const input = document.createElement('input')
  input.setAttribute('type', 'file')
  input.setAttribute('accept', 'image/*')
  input.click()
  input.onchange = async () => {
    const uploadedFile = input.files?.[0]
    if (!uploadedFile) return
    const body = new FormData()
    body.append('image', uploadedFile)
    try {
      const { data } = await api.post('/blog/upload-image', body, { headers: { 'Content-Type': 'multipart/form-data' } })
      const quill = quillRef.value?.getQuill()
      const range = quill?.getSelection(true)
      if (quill && range) {
        quill.insertText(range.index, '\n')
        quill.insertEmbed(range.index + 1, 'image', data.imageUrl)
        quill.setSelection(range.index + 2, 0)
      }
    } catch {
      Notify.create({ type: 'negative', message: 'Error al subir la imagen' })
    }
  }
}

function videoHandler() {
  const url = window.prompt('Ingrese la URL del video:')
  const quill = quillRef.value?.getQuill()
  const range = quill?.getSelection(true)
  if (url && quill && range) {
    const formattedUrl = formatYouTubeUrl(url)
    quill.insertText(range.index, '\n')
    quill.insertEmbed(range.index + 1, 'video', formattedUrl)
    quill.setSelection(range.index + 2, 0)
  }
}

const htmlDialog = ref(false)
const rawHtml = ref('')

function insertRawHtml() {
  const quill = quillRef.value?.getQuill()
  if (!quill || !rawHtml.value.trim()) return
  quill.setContents([] as never)
  quill.clipboard.dangerouslyPasteHTML(0, rawHtml.value)
  htmlDialog.value = false
  rawHtml.value = ''
}

function onEditorReady() {
  const quill = quillRef.value?.getQuill()
  const toolbar = quill?.getModule('toolbar') as { addHandler: (name: string, fn: () => void) => void } | undefined
  toolbar?.addHandler('image', imageHandler)
  toolbar?.addHandler('video', videoHandler)
}

const toolbarOptions = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ color: [] }],
  ['blockquote', 'code-block'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ align: [] }],
  ['link', 'image', 'video'],
  ['clean'],
]

function isFormValid() {
  const hasContent = formValues.content !== '' && formValues.content !== '<p><br></p>'
  return formValues.title !== '' && (hasContent || bannerList.value.length > 0)
}

async function handleSubmit() {
  loading.value = true

  // Swap each 📌 [BANNER:id] marker for the banner's real HTML, wrapped in
  // comments so it round-trips through parseBanners() on the next edit.
  let finalContent = formValues.content
  bannerList.value.forEach(({ id, html }) => {
    finalContent = finalContent.replace(
      new RegExp(`<p[^>]*>\\s*📌 \\[BANNER:${id}\\]\\s*</p>`, 'g'),
      `<!--BANNER_START-->${html}<!--BANNER_END-->`,
    )
  })

  const body = new FormData()
  body.append('formValues', JSON.stringify({ ...formValues, content: finalContent }))
  if (file.value) body.append('image', file.value)

  await useApiRequest().execute({ url: '/blog/create', method: 'POST', formData: true, body })
  loading.value = false
  Notify.create({ type: 'positive', message: props.blogId ? 'Entrada actualizada correctamente' : 'Entrada creada correctamente' })
  open.value = false
  emit('saved')
}
</script>

<template>
  <q-dialog v-model="open">
    <q-card style="min-width: 700px; max-width: 900px">
      <q-card-section>
        <div class="text-h6">{{ blogId ? 'Editar' : 'Añadir' }} entrada de blog</div>
      </q-card-section>
      <q-card-section class="q-gutter-md">
        <ImageUploader
          uploader-class="blog_image_uploader"
          :image="formValues.image"
          @update:image="(img: string) => (formValues.image = img)"
          @update:file="(f: File) => (file = f)"
        />

        <q-input v-model="formValues.title" label="Título" outlined dense />

        <div>
          <div class="row q-gutter-sm" style="margin-bottom: 8px">
            <q-btn outline label="+ Insertar Banner / CTA" @click="openBannerDialog" />
            <q-btn outline color="secondary" label="</> Pegar / Editar HTML" @click="() => { rawHtml = formValues.content; htmlDialog = true }" />
          </div>
          <QuillEditor
            ref="quillRef"
            v-model:content="formValues.content"
            content-type="html"
            :toolbar="toolbarOptions"
            style="height: 300px"
            @ready="onEditorReady"
          />

          <div v-if="bannerList.length > 0" style="margin-top: 60px">
            <p style="font-size: 11px; color: #94a3b8; margin: 0 0 8px 0; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em">
              Banners insertados — aparecen donde está el marcador 📌 en el texto
            </p>
            <div v-for="(banner, i) in bannerList" :key="banner.id" style="margin-bottom: 12px; position: relative">
              <div v-html="banner.html" style="pointer-events: none; border-radius: 8px; overflow: hidden"></div>
              <div style="position: absolute; top: 8px; right: 8px; display: flex; gap: 6px">
                <q-btn size="sm" dense unelevated color="primary" label="Editar" @click="editBanner(banner)" />
                <q-btn size="sm" dense unelevated color="dark" label="Eliminar" @click="removeBanner(banner.id)" />
              </div>
              <span style="position: absolute; top: 8px; left: 8px; font-size: 11px; background: rgba(0, 0, 0, 0.5); color: #fff; padding: 2px 8px; border-radius: 4px">
                Banner #{{ i + 1 }}
              </span>
            </div>
          </div>
        </div>

        <div style="margin-top: 20px">
          <h3>SEO</h3>
          <q-input v-model="formValues.meta_title" label="Título" outlined dense class="q-mb-sm" />
          <q-input v-model="formValues.meta_description" label="Descripción" type="textarea" outlined dense class="q-mb-sm" />
          <q-input
            v-model="formValues.alias"
            label="Alias (URL)"
            outlined
            dense
            class="q-mb-sm"
            :readonly="!!blogId"
            :hint="blogId ? 'El alias no se puede cambiar en publicaciones existentes' : ''"
          />
          <q-input v-model="formValues.meta_keys" label="Palabras Clave" outlined dense />
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancelar" @click="open = false" />
        <q-btn unelevated color="primary" :disable="!isFormValid() || loading" :label="blogId ? 'Actualizar entrada' : 'Crear entrada'" @click="handleSubmit" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Banner / CTA dialog -->
  <q-dialog v-model="bannerDialog">
    <q-card style="min-width: 480px">
      <q-card-section>
        <div class="text-h6">{{ editingBannerId ? 'Editar Banner / CTA' : 'Insertar Banner / CTA' }}</div>
      </q-card-section>
      <q-card-section class="q-gutter-md">
        <div class="row q-gutter-sm">
          <q-btn size="sm" :outline="bannerBgType !== 'color'" :unelevated="bannerBgType === 'color'" color="primary" label="Color de fondo" @click="bannerBgType = 'color'" />
          <q-btn size="sm" :outline="bannerBgType !== 'image'" :unelevated="bannerBgType === 'image'" color="primary" label="Imagen de fondo" @click="bannerBgType = 'image'" />
        </div>

        <div v-if="bannerBgType === 'color'" class="row items-center q-gutter-sm">
          <span style="font-size: 14px; color: #555">Color:</span>
          <input type="color" v-model="bannerBgColor" style="width: 48px; height: 36px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer; padding: 2px" />
          <span style="font-size: 13px; color: #888">{{ bannerBgColor }}</span>
        </div>

        <div v-if="bannerBgType === 'image'">
          <div v-if="bannerBgImage" style="position: relative; border-radius: 8px; overflow: hidden; height: 90px">
            <img :src="bannerBgImage" alt="fondo" style="width: 100%; height: 100%; object-fit: cover" />
            <q-btn size="sm" dense unelevated color="dark" label="Cambiar" style="position: absolute; top: 6px; right: 6px" @click="bannerBgImage = ''" />
          </div>
          <div
            v-else
            style="border: 2px dashed #cbd5e1; border-radius: 8px; padding: 24px 16px; text-align: center; color: #94a3b8; font-size: 14px; background: #f8fafc; cursor: pointer"
            @click="triggerBannerImageUpload"
          >
            {{ bannerUploading ? 'Subiendo imagen...' : '📷 Clic para subir imagen de fondo' }}
          </div>
        </div>

        <q-input
          v-model="bannerText"
          label="Texto del banner (opcional)"
          outlined
          dense
          :hint="bannerBgType === 'image' ? 'Déjalo vacío si la foto ya tiene el texto incluido' : ''"
        />
        <q-input
          v-model="bannerBtnText"
          label="Texto del botón (opcional)"
          outlined
          dense
          :hint="bannerBgType === 'image' && !bannerBtnText.trim() ? 'Sin botón — toda la imagen será clickeable' : ''"
        />
        <q-input v-model="bannerLink" label="URL del enlace" outlined dense hint="Ej: /kinesiologos o https://buscakine.cl/kinesiologos" />

        <!-- Live preview -->
        <div
          v-if="bannerBgType === 'image' && bannerBgImage && !bannerText.trim() && !bannerBtnText.trim()"
          style="margin-top: 8px; border-radius: 8px; overflow: hidden; position: relative"
        >
          <img :src="bannerBgImage" alt="preview" style="width: 100%; display: block; border-radius: 8px" />
          <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(0, 0, 0, 0.15)">
            <span style="color: #fff; font-size: 12px; background: rgba(0, 0, 0, 0.5); padding: 4px 10px; border-radius: 4px">Toda la imagen será clickeable</span>
          </div>
        </div>
        <div
          v-else
          :style="{
            marginTop: '8px', borderRadius: '8px', overflow: 'hidden', position: 'relative', textAlign: 'center', padding: '24px 16px',
            ...(bannerBgType === 'image' && bannerBgImage
              ? { backgroundImage: `url(${bannerBgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : { background: bannerBgColor }),
          }"
        >
          <div v-if="bannerBgType === 'image' && bannerBgImage" style="position: absolute; inset: 0; background: rgba(0, 0, 0, 0.5)"></div>
          <div style="position: relative; z-index: 1">
            <p v-if="bannerText.trim()" style="color: #fff; margin: 0 0 12px 0; font-weight: 600; font-size: 16px">{{ bannerText }}</p>
            <span v-if="bannerBtnText.trim()" :style="{ background: '#fff', color: bannerBgType === 'color' ? bannerBgColor : '#005F6A', padding: '8px 20px', borderRadius: '4px', fontWeight: 700, fontSize: '14px' }">
              {{ bannerBtnText }}
            </span>
            <span v-if="!bannerText.trim() && !bannerBtnText.trim()" style="color: rgba(255, 255, 255, 0.6); font-size: 13px">Banner vacío</span>
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancelar" @click="() => { bannerDialog = false; editingBannerId = null }" />
        <q-btn unelevated color="primary" :disable="bannerBgType === 'image' && (!bannerBgImage || bannerUploading)" :label="editingBannerId ? 'Guardar cambios' : 'Insertar'" @click="insertBanner" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Raw HTML paste dialog -->
  <q-dialog v-model="htmlDialog">
    <q-card style="min-width: 600px">
      <q-card-section>
        <div class="text-h6">Pegar / Editar HTML</div>
        <p style="margin: 8px 0 0 0; font-size: 13px; color: #555">
          Pega aquí el HTML generado por IA (con etiquetas h1, h2, p, etc). Al hacer clic en <b>Aplicar</b> se renderizará en el editor.
        </p>
      </q-card-section>
      <q-card-section>
        <q-input v-model="rawHtml" type="textarea" outlined :rows="14" style="font-family: monospace" placeholder="<h1>Título del blog</h1><p>Contenido del párrafo...</p>" />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancelar" @click="htmlDialog = false" />
        <q-btn unelevated color="primary" :disable="!rawHtml.trim()" label="Aplicar HTML al editor" @click="insertRawHtml" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
