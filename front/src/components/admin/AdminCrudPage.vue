<template>
  <ListPage :eyebrow="schema.eyebrow" :title="schema.title" :lead="schema.lead">
    <template #toolbar>
      <div class="search-fields">
        <template v-for="item in schema.search || []" :key="item.prop || item.startKey">
          <el-date-picker
            v-if="item.type === 'daterange'"
            v-model="searchRange[item.startKey]"
            type="daterange"
            value-format="YYYY-MM-DD"
            range-separator="至"
            :start-placeholder="item.label"
            :end-placeholder="item.label"
          />
          <el-input
            v-else
            v-model="searchForm[item.prop]"
            :placeholder="`搜索${item.label}`"
            clearable
            @keyup.enter="search"
          />
        </template>
      </div>
      <div class="toolbar-actions">
        <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        <el-button type="primary" :icon="Search" @click="search">查询</el-button>
        <el-button v-if="canCreate" :icon="Plus" type="primary" @click="openCreate">
          新增
        </el-button>
        <el-button
          v-if="canDelete"
          :icon="Delete"
          type="danger"
          plain
          :disabled="!selection.length"
          @click="remove(selection.map((item) => item.id))"
        >
          批量删除
        </el-button>
      </div>
    </template>

    <el-table
      v-loading="loading"
      :data="items"
      row-key="id"
      stripe
      @selection-change="selection = $event"
    >
      <el-table-column v-if="canDelete" type="selection" width="46" />
      <el-table-column
        v-for="column in schema.columns"
        :key="column.prop"
        :prop="column.prop"
        :label="column.label"
        :width="column.width"
        :min-width="column.minWidth"
        :show-overflow-tooltip="column.ellipsis"
      >
        <template #default="{ row }">
          <div v-if="column.type === 'image'" class="table-image">
            <el-image
              v-if="firstImage(row[column.prop])"
              :src="firstImage(row[column.prop])"
              :preview-src-list="imageList(row[column.prop]).map(resolveUploadUrl)"
              fit="cover"
              preview-teleported
            />
            <span v-else class="muted">无图片</span>
          </div>
          <span v-else>{{ row[column.prop] || '—' }}</span>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="270">
        <template #default="{ row }">
          <el-button link type="primary" :icon="View" @click="openView(row.id)"> 查看 </el-button>
          <el-button v-if="canEdit" link type="primary" :icon="Edit" @click="openEdit(row.id)">
            编辑
          </el-button>
          <el-button
            v-for="action in schema.rowActions || []"
            :key="action.key"
            link
            :type="action.type || 'primary'"
            @click="runRowAction(action, row)"
          >
            {{ action.label }}
          </el-button>
          <el-button v-if="canDelete" link type="danger" :icon="Delete" @click="remove([row.id])">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <template #footer>
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        background
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        @current-change="getDataList"
        @size-change="handleSizeChange"
      />
    </template>
  </ListPage>

  <EntityFormDialog
    v-model="dialogVisible"
    :schema="schema"
    :entity-id="activeId"
    :mode="dialogMode"
    @saved="handleSaved"
  />
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Delete, Edit, Plus, Refresh, Search, View } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import http from '@/utils/http'
import storage from '@/utils/storage'
import { imageList, resolveUploadUrl } from '@/utils/utils'
import { isAuth } from '@/utils/utils'
import ListPage from '@/components/ui/ListPage.vue'
import EntityFormDialog from '@/components/admin/EntityFormDialog.vue'

const props = defineProps({
  schema: { type: Object, required: true },
})

const route = useRoute()
const router = useRouter()
const items = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const selection = ref([])
const dialogVisible = ref(false)
const dialogMode = ref('create')
const activeId = ref(null)
const searchForm = reactive({})
const searchRange = reactive({})

const role = computed(() => storage.get('role'))
const canCreate = computed(() => props.schema.creatable !== false && can('新增'))
const canEdit = computed(() => can('修改'))
const canDelete = computed(() => can('删除'))

function can(action) {
  if (props.schema.adminOnly) return role.value === '管理员'
  return isAuth(props.schema.endpoint, action)
}

function buildSearchParams() {
  const params = { page: page.value, limit: pageSize.value, sort: 'id' }
  ;(props.schema.search || []).forEach((item) => {
    if (item.type === 'daterange') {
      const range = searchRange[item.startKey] || []
      if (range[0]) params[item.startKey] = range[0]
      if (range[1]) params[item.endKey] = range[1]
      return
    }
    const value = searchForm[item.prop]
    if (value) params[item.prop] = `%${value}%`
  })
  Object.entries(props.schema.keepRouteQuery || {}).forEach(([param, queryKey]) => {
    if (route.query[queryKey]) params[param] = route.query[queryKey]
  })
  return params
}

async function getDataList() {
  loading.value = true
  try {
    const { data } = await http({
      url: `${props.schema.endpoint}/page`,
      method: 'get',
      params: buildSearchParams(),
    })
    if (data?.code === 0) {
      items.value = data.data?.list || []
      total.value = data.data?.total || 0
    } else {
      items.value = []
      total.value = 0
      ElMessage.error(data?.msg || '列表加载失败')
    }
  } catch {
    items.value = []
    total.value = 0
    ElMessage.error('列表加载失败')
  } finally {
    loading.value = false
  }
}

function search() {
  page.value = 1
  return getDataList()
}

function resetSearch() {
  Object.keys(searchForm).forEach((key) => {
    searchForm[key] = ''
  })
  Object.keys(searchRange).forEach((key) => {
    searchRange[key] = null
  })
  return search()
}

function handleSizeChange() {
  page.value = 1
  getDataList()
}

function openCreate() {
  activeId.value = null
  dialogMode.value = 'create'
  dialogVisible.value = true
}

function openEdit(id) {
  activeId.value = id
  dialogMode.value = 'edit'
  dialogVisible.value = true
}

function openView(id) {
  activeId.value = id
  dialogMode.value = 'view'
  dialogVisible.value = true
}

function runRowAction(action, row) {
  if (action.mode) {
    activeId.value = row.id
    dialogMode.value = action.mode
    dialogVisible.value = true
    return
  }
  if (action.to) router.push(action.to(row))
}

async function remove(ids) {
  if (!ids?.length) return
  try {
    await ElMessageBox.confirm(
      ids.length > 1 ? `确定批量删除 ${ids.length} 条记录？` : '确定删除这条记录？',
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' },
    )
    const { data } = await http({
      url: `${props.schema.endpoint}/delete`,
      method: 'post',
      data: ids,
    })
    if (data?.code === 0) {
      ElMessage.success('删除成功')
      if (items.value.length === ids.length && page.value > 1) page.value -= 1
      await getDataList()
    } else {
      ElMessage.error(data?.msg || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') ElMessage.error('删除失败')
  }
}

function firstImage(value) {
  return resolveUploadUrl(imageList(value)[0] || '')
}

function handleSaved() {
  getDataList()
}

onMounted(getDataList)
</script>

<style lang="scss" scoped>
.search-fields,
.toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}
.toolbar-actions {
  margin-left: auto;
}
.table-image {
  width: 72px;
  height: 54px;

  .el-image {
    width: 100%;
    height: 100%;
    border-radius: var(--r-1);
  }
}
.muted {
  color: var(--ink-mute);
  font-size: 12px;
}

@media (max-width: 760px) {
  .toolbar-actions {
    width: 100%;
    margin-left: 0;
  }
}
</style>
