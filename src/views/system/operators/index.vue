<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import {
  fetchAdminRoles,
  fetchOperatorsPage,
  setOperatorRoles,
  type AdminOperator,
  type AdminRole
} from "@/api/admin/rbac";
import { hasPerms } from "@/utils/auth";

defineOptions({ name: "SystemOperators" });

const loading = ref(false);
const saving = ref(false);
const rows = ref<AdminOperator[]>([]);
const allRoles = ref<AdminRole[]>([]);
const dialogVisible = ref(false);
const editing = ref<AdminOperator | null>(null);
const selectedRoleIds = ref<string[]>([]);

const pager = reactive({
  page: 1,
  pageSize: 20,
  total: 0,
  keyword: ""
});

const canAssign = hasPerms("admin:user:role:write");

async function loadRoles() {
  const { data } = await fetchAdminRoles();
  allRoles.value = data ?? [];
}

async function loadList() {
  loading.value = true;
  try {
    const { data } = await fetchOperatorsPage({
      currentPage: pager.page,
      pageSize: pager.pageSize,
      keyword: pager.keyword.trim() || undefined
    });
    rows.value = data?.list ?? [];
    pager.total = data?.total ?? 0;
  } finally {
    loading.value = false;
  }
}

function onSearch() {
  pager.page = 1;
  loadList();
}

function openAssign(row: AdminOperator) {
  editing.value = row;
  selectedRoleIds.value = [...row.roleIds];
  dialogVisible.value = true;
}

async function saveRoles() {
  if (!editing.value) return;
  saving.value = true;
  try {
    await setOperatorRoles(editing.value.id, selectedRoleIds.value);
    ElMessage.success("角色已更新，用户重新登录后生效");
    dialogVisible.value = false;
    await loadList();
  } finally {
    saving.value = false;
  }
}

function roleLabel(row: AdminOperator): string {
  if (row.roles?.length) {
    return row.roles.map(r => r.name).join("、");
  }
  if (row.isSuperuser) return "超级管理员（legacy）";
  return "—";
}

onMounted(async () => {
  await loadRoles();
  await loadList();
});
</script>

<template>
  <div class="system-operators">
    <el-card shadow="never">
      <template #header>
        <div class="system-operators__header">
          <span class="system-operators__title">运营账号</span>
          <el-input
            v-model="pager.keyword"
            clearable
            placeholder="搜索邮箱…"
            class="system-operators__search"
            @keyup.enter="onSearch"
            @clear="onSearch"
          />
          <el-button type="primary" :loading="loading" @click="onSearch"
            >查询</el-button
          >
        </div>
      </template>

      <p class="system-operators__hint">
        列表仅包含可登录管理台的账号（已分配角色、legacy
        超管或邮箱白名单）。新账号请先在 C 端注册或通过 dev-login
        创建，再在此分配角色。
      </p>

      <el-table v-loading="loading" :data="rows" border stripe>
        <el-table-column
          prop="email"
          label="邮箱"
          min-width="220"
          show-overflow-tooltip
        />
        <el-table-column label="角色" min-width="180">
          <template #default="{ row }">{{ roleLabel(row) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="88" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'danger'" size="small">
              {{ row.isActive ? "启用" : "禁用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Legacy 超管" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isSuperuser ? 'warning' : 'info'" size="small">
              {{ row.isSuperuser ? "是" : "否" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          v-if="canAssign"
          label="操作"
          width="120"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button link type="primary" @click="openAssign(row)"
              >分配角色</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <div class="system-operators__pager">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next"
          :total="pager.total"
          :page-size="pager.pageSize"
          :current-page="pager.page"
          :page-sizes="[10, 20, 50]"
          @current-change="
            p => {
              pager.page = p;
              loadList();
            }
          "
          @size-change="
            s => {
              pager.pageSize = s;
              pager.page = 1;
              loadList();
            }
          "
        />
      </div>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      title="分配角色"
      width="480px"
      destroy-on-close
    >
      <p v-if="editing" class="system-operators__dialog-email">
        {{ editing.email }}
      </p>
      <el-select
        v-model="selectedRoleIds"
        multiple
        placeholder="选择角色"
        class="system-operators__role-select"
      >
        <el-option
          v-for="role in allRoles"
          :key="role.id"
          :label="`${role.name} (${role.code})`"
          :value="role.id"
        />
      </el-select>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveRoles"
          >保存</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.system-operators {
  padding: 16px;

  &__header {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
  }

  &__title {
    margin-right: 8px;
    font-weight: 600;
  }

  &__search {
    width: 260px;
  }

  &__hint {
    margin: 0 0 12px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  &__pager {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }

  &__dialog-email {
    margin: 0 0 12px;
    font-weight: 500;
  }

  &__role-select {
    width: 100%;
  }
}
</style>
