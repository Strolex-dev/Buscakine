<script setup lang="ts">
import { nextTick, reactive, ref, watch } from 'vue'
import { useApiRequest } from '@/composables/useApiRequest'
import ImageUploader from '@/components/shared/ImageUploader.vue'
import ImageViewer from '@/components/messages/ImageViewer.vue'
import AlertDialog from '@/components/shared/AlertDialog.vue'

const props = defineProps<{ conversationId: string }>()

interface Message {
  message_id: number
  message_text: string
  image?: string
  sent_at: string
  is_owner: boolean
  sender_username: string
  sender_lastname: string
}

const { data, execute: fetchMessages } = useApiRequest<{ messages: Message[]; is_admin: boolean }>()
const formValues = reactive({ message_text: '', image: '', conversation_id: '' })
const file = ref<File | null>(null)
const openImageViewer = ref(false)
const selectedImage = ref('')
const openAlert = ref(false)
const activeMessage = ref<number | null>(null)

async function getMessages() {
  await fetchMessages({ url: '/messages/globalMessages', query: { conversation_id: props.conversationId } })
  await nextTick()
  const container = document.querySelector('.conversation_container')
  if (container) setTimeout(() => (container.scrollTop = container.scrollHeight), 100)
}

watch(() => props.conversationId, getMessages, { immediate: true })

async function handleSendMessage() {
  if (formValues.message_text.trim() === '' && !file.value) return
  formValues.conversation_id = props.conversationId

  const body = new FormData()
  body.append('formValues', JSON.stringify(formValues))
  if (file.value) body.append('image', file.value)

  const response = await useApiRequest<{ status: string }>().execute({ url: '/messages/send', method: 'POST', formData: true, body })
  if (response.status === 'success') {
    formValues.message_text = ''
    formValues.image = ''
    file.value = null
    getMessages()
  }
}

function viewImage(image: string) {
  selectedImage.value = image
  openImageViewer.value = true
}

function handleDelete(message_id: number) {
  activeMessage.value = message_id
  openAlert.value = true
}

async function deleteMessage() {
  const response = await useApiRequest<{ status: string }>().execute({ url: '/messages/deleteMessage', method: 'POST', body: { message_id: activeMessage.value } })
  if (response.status === 'success') getMessages()
  openAlert.value = false
}
</script>

<template>
  <div class="conversation_container">
    <div
      v-for="message in data?.messages ?? []"
      :key="message.message_id"
      :class="message.is_owner ? 'message_container_owner' : 'message_container_other'"
    >
      <div class="message_bubble">
        <img v-if="message.image" :src="message.image" class="message_image" @click="viewImage(message.image!)" />
        {{ message.message_text }}
        <div class="message_footer">
          <div class="message_date">{{ message.sent_at }}</div>
          <div class="message_author">{{ message.sender_username }} {{ message.sender_lastname }}</div>
        </div>
      </div>
      <div class="message_delete_container">
        <q-btn flat round dense color="negative" icon="delete_outline" @click="handleDelete(message.message_id)" />
      </div>
    </div>
  </div>

  <div v-if="data?.is_admin" class="message_input_container">
    <ImageUploader
      uploader-class="message_image_uploader"
      :image="formValues.image"
      label=""
      @update:image="(img: string) => (formValues.image = img)"
      @update:file="(f: File) => (file = f)"
    />
    <q-input v-model="formValues.message_text" outlined dense placeholder="Escribe un mensaje..." style="margin-left: 10px; flex: 1" @keyup.enter="handleSendMessage" />
    <q-btn unelevated color="primary" label="Enviar" style="margin-left: 10px" @click="handleSendMessage" />
  </div>

  <ImageViewer v-model:open="openImageViewer" :image-src="selectedImage" />
  <AlertDialog v-model:open="openAlert" subtitle="¿Está seguro que desea eliminar este mensaje?" @confirm="deleteMessage" />
</template>
