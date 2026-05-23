<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  PERMISSION_PRESETS,
  createAdminRole,
  deleteAdminRole,
  fetchAdminRoles,
  updateAdminRole,
  type AdminRole,
  type AdminRolePayload
} from "@/api/admin/rbac";
import { hasPerms } from "@/utils/auth";

defineOptions({ name: "SystemRoles" });

const loading = ref(false);
const saving = ref(false);
const rows = ref<AdminRole[]>([]);
const dialogVisible = ref(false);
const editingId = ref<string | null>(null);

const form = reactive<AdminRolePayload>({
  code: "",
  name: "",
  permissions: [],
  description: ""
});

const canWrite = hasPerms("admin:role:write");

function resetForm() {
  form.code = "";
  form.name = "";
  form.permissions = [];
  form.description = "";
  editingId.value = null;
}

async function loadList() {
  loading.value = true;
  try {
    const { data } = await fetchAdminRoles();
    rows.value = data ?? [];
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  resetForm();
  dialogVisible.value = true;
}

function openEdit(row: AdminRole) {
  editingId.value = row.id;
  form.code = row.code;
  form.name = row.name;
  form.permissions = [...row.permissions];
  form.description = row.description ?? "";
  dialogVisible.value = true;
}

async function saveRole() {
  if (!form.code.trim() || !form.name.trim()) {
    ElMessage.warning("请填写角色编码与名称");
    return;
  }
  saving.value = true;
  try {
    const payload: AdminRolePayload = {
      code: form.code.trim(),
      name: form.name.trim(),
      permissions: [...form.permissions],
      description: form.description?.trim() || null
    };
    if (editingId.value) {
      await updateAdminRole(editingId.value, payload);
      ElMessage.success("角色已更新");
    } else {
      await createAdminRole(payload);
      ElMessage.success("角色已创建");
    }
    dialogVisible.value = false;
    await loadList();
  } finally {
    saving.value = false;
  }
}

async function removeRole(row: AdminRole) {
  if (row.isSystem) {
    ElMessage.warning("系统内置角色不可删除");
    return;
  }
  await ElMessageBox.confirm(`确定删除角色「${row.name}」？`, "确认", {
    type: "warning"
  });
  await deleteAdminRole(row.id);
  ElMessage.success("已删除");
  await loadList();
}

onMounted(loadList);
</script>

<template>
  <div class="system-roles">
    <el-card shadow="never">
      <template #header>
        <div class="system-roles__header">
          <span class="system-roles__title">角色与权限</span>
          <el-button v-if="canWrite" type="primary" @click="openCreate">
            新建角色
          </el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="rows" border stripe>
        <el-table-column prop="code" label="编码" width="120" />
        <el-table-column prop="name" label="名称" width="140" />
        <el-table-column label="权限" min-width="280">
          <template #default="{ row }">
            <el-space wrap>
              <el-tag
                v-for="perm in row.permissions"
                :key="perm"
                size="small"
                type="info"
              >
                {{ perm }}
              </el-tag>
            </el-space>
          </template>
        </el-table-column>
        <el-table-column
          prop="description"
          label="说明"
          min-width="160"
          show-overflow-tooltip
        />
        <el-table-column label="内置" width="72" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isSystem ? 'warning' : 'info'" size="small">
              {{ row.isSystem ? "是" : "否" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="canWrite" label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row)"
              >编辑</el-button
            >
            <el-button
              link
              type="danger"
              :disabled="row.isSystem"
              @click="removeRole(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑角色' : '新建角色'"
      width="560px"
      destroy-on-close
    >
      <el-form label-width="88px">
        <el-form-item label="编码" required>
          <el-input
            v-model="form.code"
            :disabled="Boolean(editingId)"
            placeholder="如 editor、banner_ops"
          />
        </el-form-item>
        <el-form-item label="名称" required>
          <el-input v-model="form.name" placeholder="展示名称" />
        </el-form-item>
        <el-form-item label="权限码">
          <el-select
            v-model="form.permissions"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="选择或输入权限码"
            class="system-roles__perm-select"
          >
            <el-option
              v-for="item in PERMISSION_PRESETS"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="form.description" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveRole"
          >保存</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.system-roles {
  padding: 16px;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__title {
    font-weight: 600;
  }

  &__perm-select {
    width: 100%;
  }
}
</style>
