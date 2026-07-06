<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useApiRequest } from '@/composables/useApiRequest'

interface Option {
  value: number | string
  label: string
  [key: string]: unknown
}

const props = withDefaults(
  defineProps<{
    endpoint?: string
    endpointParams?: Record<string, unknown>
    preloadedList?: Option[]
    label: string
    modelValue: (number | string)[] | number | string | null
    multiple?: boolean
    renderValues?: string[]
  }>(),
  {
    endpoint: '',
    endpointParams: () => ({}),
    preloadedList: undefined,
    multiple: false,
    renderValues: () => ['label'],
  },
)

// Replaces the React app's AutocompleteField (src/elements/AutocompleteField.tsx):
// multiple mode emits an array of option ids, single mode emits the raw id, and
// `option-select` additionally exposes the full selected option (label included).
const emit = defineEmits<{
  'update:modelValue': [value: (number | string)[] | number | string | null]
  'option-select': [option: Option | null]
}>()

const { data: fetchedList, loading, execute } = useApiRequest<{ list: Option[] }>()

if (!props.preloadedList) {
  watchEffect(() => {
    execute({ url: props.endpoint, query: { full_list: true, ...props.endpointParams } })
  })
}

const allOptions = computed(() => props.preloadedList ?? fetchedList.value?.list ?? [])
const optionLabel = (opt: Option) => (opt ? String(opt[props.renderValues[0]]) : '')

const searchText = ref('')
const filteredOptions = computed(() => {
  if (!searchText.value) return allOptions.value
  const needle = searchText.value.toLowerCase()
  return allOptions.value.filter((opt) => optionLabel(opt).toLowerCase().includes(needle))
})

function onFilter(val: string, update: (fn: () => void) => void) {
  update(() => {
    searchText.value = val
  })
}

const selected = computed<Option | Option[] | null>({
  get() {
    if (props.multiple) {
      const ids = Array.isArray(props.modelValue) ? props.modelValue : []
      return allOptions.value.filter((opt) => ids.includes(opt.value))
    }
    return allOptions.value.find((opt) => opt.value === props.modelValue) ?? null
  },
  set(value) {
    if (props.multiple) {
      const list = (value as Option[] | null) ?? []
      emit('update:modelValue', list.map((opt) => opt.value))
      emit('option-select', null)
    } else {
      const opt = value as Option | null
      emit('update:modelValue', opt?.value ?? null)
      emit('option-select', opt)
    }
  },
})
</script>

<template>
  <q-select
    v-model="selected"
    class="col"
    :options="filteredOptions"
    :label="label"
    :multiple="multiple"
    :option-label="optionLabel"
    :loading="loading"
    use-input
    use-chips
    outlined
    dense
    bg-color="white"
    input-debounce="0"
    @filter="onFilter"
  />
</template>
