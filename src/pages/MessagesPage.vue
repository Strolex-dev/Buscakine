<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useApiRequest } from '@/composables/useApiRequest'
import EmptyElement from '@/components/shared/EmptyElement.vue'
import Banner from '@/components/shared/Banner.vue'
import Conversation from '@/components/messages/Conversation.vue'

interface ConversationSummary {
  conversation_id: string
  name: string
  lastname: string
  unreadCount: number
}

const route = useRoute()
const { data, execute } = useApiRequest<{ conversations: ConversationSummary[] }>()
const selectedConversationId = ref<string | null>((route.params.conversation_id as string) ?? null)
const drawerOpen = ref(true)

onMounted(() => execute({ url: '/messages/conversations' }))

watch(
  () => route.params.conversation_id,
  (id) => {
    if (id) selectedConversationId.value = id as string
  },
)

function openConversation(id: string) {
  selectedConversationId.value = id
  drawerOpen.value = false
}
</script>

<template>
  <q-page>
    <div id="messages_content" class="content" style="height: calc(100vh - 220px)">
      <div id="messages_container" style="height: 100%">
        <q-layout view="lHh lpr lFf" container style="height: 100%">
          <q-header elevated class="bg-white text-dark lt-sm">
            <q-toolbar>
              <q-btn flat dense round icon="menu" @click="drawerOpen = !drawerOpen" />
              <q-toolbar-title>Mensajes</q-toolbar-title>
            </q-toolbar>
          </q-header>

          <q-drawer v-model="drawerOpen" :breakpoint="600" bordered>
            <q-list v-if="data?.conversations?.length">
              <h3 style="padding: 20px">Conversaciones</h3>
              <q-item
                v-for="conversation in data.conversations"
                :key="conversation.conversation_id"
                clickable
                @click="openConversation(conversation.conversation_id)"
              >
                <q-item-section avatar>
                  <q-icon name="chat_bubble_outline" size="28px" color="grey-5" />
                </q-item-section>
                <q-item-section>{{ conversation.name }} {{ conversation.lastname }}</q-item-section>
                <q-item-section v-if="conversation.unreadCount" side>
                  <q-badge color="primary">{{ conversation.unreadCount }}</q-badge>
                </q-item-section>
              </q-item>
            </q-list>
            <EmptyElement v-else title="No hay conversaciones" />
          </q-drawer>

          <q-page-container>
            <q-page class="conversation">
              <Conversation v-if="selectedConversationId" :conversation-id="selectedConversationId" />
              <div v-else style="padding: 20px">
                <h3>Seleccione una conversación para ver los mensajes</h3>
              </div>
            </q-page>
          </q-page-container>
        </q-layout>
      </div>
    </div>
    <Banner section="chat" />
  </q-page>
</template>
