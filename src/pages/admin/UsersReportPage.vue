<script setup lang="ts">
import { computed, onMounted } from 'vue'
import * as XLSX from 'xlsx'
import { useApiRequest } from '@/composables/useApiRequest'
import AppBox from '@/components/shared/AppBox.vue'
import EmptyElement from '@/components/shared/EmptyElement.vue'

interface UserRow {
  user_id: number
  name: string
  lastname: string
  email: string
  phone: string
  user_type: string
  plan_id: number
  is_register_approved: number
  created_at: string
  last_login: string | null
}

const { data, execute } = useApiRequest<{ list: UserRow[] }>()

onMounted(() => {
  execute({ url: '/users/list', query: { full_list: 1 } })
})

function sortByLoginDesc(a: UserRow, b: UserRow) {
  if (!a.last_login && !b.last_login) return 0
  if (!a.last_login) return 1
  if (!b.last_login) return -1
  return b.last_login.localeCompare(a.last_login)
}

const patients = computed(() => (data.value?.list ?? []).filter((u) => u.user_type === 'Paciente').sort(sortByLoginDesc))
const nurses = computed(() =>
  (data.value?.list ?? []).filter((u) => u.user_type === 'Kinesiólogo' && Number(u.is_register_approved) !== 0).sort(sortByLoginDesc),
)
const pending = computed(() =>
  (data.value?.list ?? []).filter((u) => u.user_type === 'Kinesiólogo' && Number(u.is_register_approved) === 0).sort(sortByLoginDesc),
)

function statusLabel(u: UserRow) {
  const approved = Number(u.is_register_approved)
  if (approved === 0) return 'Por aprobar'
  if (approved === 2) return 'Rechazado'
  return 'Aprobado'
}

function formatDate(value: string | null) {
  if (!value) return 'Sin acceso'
  return value
}

function exportExcel() {
  const sections: { name: string; rows: UserRow[]; withStatus: boolean }[] = [
    { name: 'Pacientes', rows: patients.value, withStatus: false },
    { name: 'Kinesiólogos', rows: nurses.value, withStatus: true },
    { name: 'Por Aprobar', rows: pending.value, withStatus: true },
  ]

  const wb = XLSX.utils.book_new()
  sections.forEach(({ name, rows, withStatus }) => {
    const sheetRows = rows.map((u, i) => ({
      '#': i + 1,
      Nombre: u.name,
      Apellido: u.lastname,
      Email: u.email,
      Teléfono: u.phone || '',
      ...(withStatus ? { Estado: statusLabel(u) } : {}),
      'Fecha de Registro': u.created_at ? u.created_at.slice(0, 10) : '',
      'Último Acceso': u.last_login ?? 'Sin acceso',
    }))
    const ws = XLSX.utils.json_to_sheet(sheetRows)
    ws['!cols'] = [{ wch: 4 }, { wch: 18 }, { wch: 18 }, { wch: 30 }, { wch: 16 }, { wch: 12 }, { wch: 16 }, { wch: 18 }]
    XLSX.utils.book_append_sheet(wb, ws, name)
  })

  XLSX.writeFile(wb, `gestion_usuarios_${new Date().toISOString().slice(0, 10)}.xlsx`)
}
</script>

<template>
  <q-page class="content">
    <div class="blog_title_row">
      <h2 class="titles">Gestión de Usuarios</h2>
      <q-btn unelevated color="primary" icon="download" label="Exportar a Excel" @click="exportExcel" />
    </div>

    <AppBox box-class="box100" style="margin-bottom: 24px">
      <h2>Pacientes ({{ patients.length }})</h2>
      <q-table
        v-if="patients.length"
        :rows="patients"
        :columns="[
          { name: 'name', label: 'Nombre', field: (r: UserRow) => `${r.name} ${r.lastname}`, align: 'left' },
          { name: 'email', label: 'Email', field: 'email', align: 'left' },
          { name: 'phone', label: 'Teléfono', field: 'phone', align: 'left' },
          { name: 'last_login', label: 'Último acceso', field: 'last_login', align: 'left' },
        ]"
        row-key="user_id"
        flat
        hide-bottom
      >
        <template #body-cell-last_login="props">
          <q-td :props="props">
            <span :style="{ color: props.row.last_login ? undefined : '#cbd5e1' }">{{ formatDate(props.row.last_login) }}</span>
          </q-td>
        </template>
      </q-table>
      <EmptyElement v-else title="Sin pacientes" subtitle="No hay pacientes registrados" />
    </AppBox>

    <AppBox box-class="box100" style="margin-bottom: 24px">
      <h2>Kinesiólogos ({{ nurses.length }})</h2>
      <q-table
        v-if="nurses.length"
        :rows="nurses"
        :columns="[
          { name: 'name', label: 'Nombre', field: (r: UserRow) => `${r.name} ${r.lastname}`, align: 'left' },
          { name: 'email', label: 'Email', field: 'email', align: 'left' },
          { name: 'phone', label: 'Teléfono', field: 'phone', align: 'left' },
          { name: 'status', label: 'Estado', field: 'is_register_approved', align: 'left' },
          { name: 'last_login', label: 'Último acceso', field: 'last_login', align: 'left' },
        ]"
        row-key="user_id"
        flat
        hide-bottom
      >
        <template #body-cell-status="props">
          <q-td :props="props">
            <q-chip
              :label="statusLabel(props.row)"
              :color="Number(props.row.is_register_approved) === 2 ? 'negative' : 'positive'"
              text-color="white"
              size="sm"
            />
          </q-td>
        </template>
        <template #body-cell-last_login="props">
          <q-td :props="props">
            <span :style="{ color: props.row.last_login ? undefined : '#cbd5e1' }">{{ formatDate(props.row.last_login) }}</span>
          </q-td>
        </template>
      </q-table>
      <EmptyElement v-else title="Sin kinesiólogos" subtitle="No hay kinesiólogos aprobados" />
    </AppBox>

    <AppBox box-class="box100">
      <h2>Por Aprobar ({{ pending.length }})</h2>
      <q-table
        v-if="pending.length"
        :rows="pending"
        :columns="[
          { name: 'name', label: 'Nombre', field: (r: UserRow) => `${r.name} ${r.lastname}`, align: 'left' },
          { name: 'email', label: 'Email', field: 'email', align: 'left' },
          { name: 'phone', label: 'Teléfono', field: 'phone', align: 'left' },
          { name: 'created_at', label: 'Fecha de Registro', field: 'created_at', align: 'left' },
          { name: 'last_login', label: 'Último acceso', field: 'last_login', align: 'left' },
        ]"
        row-key="user_id"
        flat
        hide-bottom
      >
        <template #body-cell-last_login="props">
          <q-td :props="props">
            <span :style="{ color: props.row.last_login ? undefined : '#cbd5e1' }">{{ formatDate(props.row.last_login) }}</span>
          </q-td>
        </template>
      </q-table>
      <EmptyElement v-else title="Sin usuarios pendientes" subtitle="No hay kinesiólogos por aprobar" />
    </AppBox>
  </q-page>
</template>
