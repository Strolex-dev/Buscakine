<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useApiRequest } from '@/composables/useApiRequest'
import EmptyElement from '@/components/shared/EmptyElement.vue'
import AdminConversation from '@/components/admin/AdminConversation.vue'
import NewMessageDialog from '@/components/admin/NewMessageDialog.vue'

interface ConversationSummary {
  conversation_id: string
  user_name_1: string
  user_lastname_1: string
  user_name_2: string
  user_lastname_2: string
}

const route = useRoute()
const { data, execute } = useApiRequest<{ conversations: ConversationSummary[] }>()
const selectedConversationId = ref<string | null>((route.params.conversation_id as string) ?? null)
const drawerOpen = ref(true)
const openNewMessage = ref(false)

function loadList() {
  execute({ url: '/messages/globalConversations', query: {} })
}
onMounted(loadList)

watch(
  () => route.params.conversation_id,
  (id) => {
    if (id) selectedConversationId.value = id as string
  },
)

function openConversation(id: string) {
  selectedConversationId.value = id
}
</script>

<template>
  <q-page>
    <div id="messages_content" class="content" style="height: calc(100vh - 220px)">
      <div id="messages_container" style="height: 100%">
        <q-layout view="lHh lpr lFf" container style="height: 100%">
          <q-drawer v-model="drawerOpen" :breakpoint="600" bordered show-if-above>
            <div class="row items-center q-pa-md">
              <h3 class="col">Conversaciones</h3>
            </div>
            <div class="massive_actions q-px-md q-pb-md">
              <q-btn unelevated color="primary" label="Nuevo Mensaje" @click="openNewMessage = true" />
            </div>
            <q-list v-if="data?.conversations?.length">
              <q-item v-for="conversation in data.conversations" :key="conversation.conversation_id" clickable @click="openConversation(conversation.conversation_id)">
                <q-item-section avatar>
                  <q-icon name="chat_bubble_outline" size="28px" color="grey-5" />
                </q-item-section>
                <q-item-section>
                  <div class="admin_conversation_item">
                    <div>{{ conversation.user_name_1 }} {{ conversation.user_lastname_1 }}</div>
                    <div>{{ conversation.user_name_2 }} {{ conversation.user_lastname_2 }}</div>
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
            <EmptyElement v-else title="No hay conversaciones" />
          </q-drawer>

          <q-page-container>
            <q-page class="conversation">
              <AdminConversation v-if="selectedConversationId" :conversation-id="selectedConversationId" />
              <div v-else style="padding: 20px">
                <h3>Seleccione una conversación para ver los mensajes</h3>
              </div>
            </q-page>
          </q-page-container>
        </q-layout>
      </div>
    </div>

    <NewMessageDialog v-model:open="openNewMessage" @sent="loadList" />
  </q-page>
</template>
