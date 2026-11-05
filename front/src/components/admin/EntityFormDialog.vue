<template>
  <el-dialog
    :model-value="modelValue"
    :title="dialogTitle"
    width="min(760px, calc(100vw - 32px))"
    destroy-on-close
    @update:model-value="$emit('update:modelValue', $event)"
    @closed="reset"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      v-loading="loading"
      @submit.prevent
    >
      <el-row :gutter="18">
        <el-col v-for="field in schema.fields" :key="field.prop" :span="field.span || 12">
          <el-form-item :label="field.label" :prop="field.prop">
            <el-date-picker
              v-if="field.type === 'date'"
              v-model="form[field.prop]"
              type="date"
              value-format="YYYY-MM-DD"
              :placeholder="`请选择${field.label}`"
              :disabled="isReadonly"
            />
            <el-select
              v-else-if="field.type === 'select'"
              v-model="form[field.prop]"
              :placeholder="`请选择${field.label}`"
              :disabled="isReadonly"
              class="full-width"
            >
              <el-option
                v-for="option in field.options || []"
                :key="option"
                :label="option"
                :value="option"
              />
            </el-select>
            <el-input
              v-else-if="field.type === 'textarea'"
              v-model="form[field.prop]"
              type="textarea"
              :rows="field.rows || 4"
              :placeholder="`请输入${field.label}`"
              :readonly="isReadonly || field.readonly"
            />
            <file-upload
              v-else-if="field.type === 'upload' && !isReadonly"
              :tip="`点击上传${field.label}`"
              action="file/upload"
              :limit="field.limit || 1"
              :multiple="Boolean(field.multiple)"
              :file-urls="form[field.prop] || ''"
              @change="form[field.prop] = $event"
            />
            <div v-else-if="field.type === 'upload'" class="upload-preview">
              <el-image
                v-for="url in imageList(form[field.prop])"
                :key="url"
                :src="resolveUploadUrl(url)"
                :preview-src-list="imageList(form[field.prop]).map(resolveUploadUrl)"
                fit="cover"
                preview-teleported
              />
            </div>
            <el-input
              v-else
              v-model="form[field.prop]"
              :type="field.type === 'password' ? 'password' : 'text'"
              :show-password="field.type === 'password'"
              :placeholder="
                field.type === 'password' && entityId ? '留空则不修改密码' : `请输入${field.label}`
              "
              :readonly="isReadonly"
              :disabled="field.readonly"
              clearable
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <button class="dialog-btn dialog-btn--plain" type="button" @click="close">
        {{ isView ? '关闭' : '取消' }}
      </button>
      <button
        v-if="!isView"
        class="dialog-btn dialog-btn--primary"
        type="button"
        :disabled="saving"
        @click="submit"
      >
        {{ saving ? '保存中…' : '保存' }}
      </button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import http from '@/utils/http'
import { imageList, resolveUploadUrl } from '@/utils/utils'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  schema: { type: Object, required: true },
  entityId: { type: [String, Number], default: null },
  mode: { type: String, default: 'create' },
})

const emit = defineEmits(['update:modelValue', 'saved'])

const formRef = ref(null)
const loading = ref(false)
const saving = ref(false)
const form = reactive({})

const isView = computed(() => props.mode === 'view')
const isReadonly = computed(() => isView.value)
const dialogTitle = computed(() => {
  if (isView.value) return `查看${props.schema.title}`
  return props.entityId ? `编辑${props.schema.title}` : `新增${props.schema.title}`
})

const rules = computed(() => {
  const result = {}
  props.schema.fields.forEach((field) => {
    const required = field.required || (field.requiredOnCreate && !props.entityId)
    if (required && !isView.value) {
      result[field.prop] = [{ required: true, message: `${field.label}不能为空`, trigger: 'blur' }]
    }
  })
  return result
})

function clearForm() {
  Object.keys(form).forEach((key) => delete form[key])
}

function defaults() {
  const result = {}
  props.schema.fields.forEach((field) => {
    result[field.prop] =
      typeof field.defaultValue === 'function' ? field.defaultValue() : (field.defaultValue ?? '')
  })
  if (typeof props.schema.defaults === 'function') {
    Object.assign(result, props.schema.defaults())
  }
  return result
}

function reset() {
  clearForm()
  Object.assign(form, defaults())
  formRef.value?.clearValidate()
}

async function load() {
  reset()
  if (!props.entityId || props.mode === 'create') return
  loading.value = true
  try {
    const { data } = await http({
      url: `${props.schema.endpoint}/info/${props.entityId}`,
      method: 'get',
    })
    if (data?.code === 0 && data.data) {
      Object.assign(form, data.data)
      props.schema.fields
        .filter((field) => field.type === 'password')
        .forEach((field) => {
          form[field.prop] = ''
        })
    } else {
      ElMessage.error(data?.msg || '数据加载失败')
      close()
    }
  } catch {
    ElMessage.error('数据加载失败')
    close()
  } finally {
    loading.value = false
  }
}

function close() {
  if (saving.value) return
  emit('update:modelValue', false)
}

function submit() {
  if (isView.value) return close()
  formRef.value?.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      const action = props.entityId ? 'update' : 'save'
      const { data } = await http({
        url: `${props.schema.endpoint}/${action}`,
        method: 'post',
        data: { ...form },
      })
      if (data?.code === 0) {
        ElMessage.success('保存成功')
        emit('saved')
        emit('update:modelValue', false)
      } else {
        ElMessage.error(data?.msg || '保存失败')
      }
    } catch {
      ElMessage.error('保存失败')
    } finally {
      saving.value = false
    }
  })
}

watch(
  () => [props.modelValue, props.entityId, props.mode],
  ([visible]) => {
    if (visible) load()
  },
  { immediate: true },
)
</script>

<style lang="scss" scoped>
.full-width {
  width: 100%;
}
.upload-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  .el-image {
    width: 104px;
    height: 104px;
    border: 1px solid var(--rule);
    border-radius: var(--r-1);
  }
}
.dialog-btn {
  min-width: 88px;
  padding: 10px 20px;
  border-radius: var(--r-1);
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.12em;
  cursor: pointer;
}
.dialog-btn--plain {
  color: var(--ink-soft);
  background: transparent;
  border: 1px solid var(--rule);
}
.dialog-btn--primary {
  margin-left: 10px;
  color: #fff;
  background: var(--accent);
  border: 1px solid var(--accent);
}
.dialog-btn:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
</style>
