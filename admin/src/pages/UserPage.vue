<template>
  <div class="space-y-3">
    <!-- Accounts at a glance: one chip per role + the overall total -->
    <div class="flex flex-wrap items-center gap-3 px-8 pt-2">
      <span class="text-sm text-gray-300">
        {{ totalUsers }} account{{ totalUsers === 1 ? '' : 's' }} in total
      </span>
      <span v-for="stat in roleStats" :key="stat.role"
        class="bg-4 text-accent px-3 py-1 rounded-full text-xs font-semibold">
        {{ printEnum(stat.role) }}: {{ stat.count }}
      </span>
    </div>

    <data-table title="All Users" :headers="headers" :def-form-data="defFormData" :action-info="false"
      :filter-order-options="filterOrderOptions" :dif-sort-order="'desc'" :transform-submit="transformSubmit"
      search-placeholder="Search users by name, email or role">
      <!-- Role filter — admins, staff or any other role created on the Roles page -->
      <template #filters>
        <select v-model="filters.role" @change="fetchData()" class="my-input w-44 py-2">
          <option value="">All roles</option>
          <option v-for="role in roles" :key="role.id" :value="role.title">{{ printEnum(role.title) }}</option>
        </select>
      </template>

      <template #default="{ item }">
        <td class="my-td-1st">
          <span class="font-medium">{{ item.name }}</span>
          <span v-if="isSelf(item)"
            class="ms-2 bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs font-semibold">You</span>
          <span v-if="!item.roleExists" class="block text-xs text-amber-500">
            No such role — this account holds no permissions
          </span>
        </td>
        <td class="my-td text-gray-300">{{ item.email }}</td>
        <td class="my-td">
          <!-- Read-only: roles are changed from the edit form, never straight from the row -->
          <span class="px-3 py-1 rounded-full text-xs font-semibold"
            :class="isAdminRole(item.role) ? 'bg-blue-600 text-white' : 'bg-4 text-accent'">
            {{ printEnum(item.role) }}
          </span>
        </td>
        <td class="my-td text-gray-300">{{ getDate(item.createdAt) }}</td>
      </template>

      <template #modal>
        <div class="p-1 mb-3">
          <label class="my-label">Name</label>
          <input v-model="formData.name" type="text" required maxlength="100" class="my-input" placeholder="Full name">
        </div>
        <div class="p-1 mb-3">
          <label class="my-label">Email</label>
          <input v-model="formData.email" type="email" required maxlength="255" class="my-input" placeholder="user@edu.com">
        </div>
        <div class="p-1 mb-3">
          <label class="my-label">Role</label>
          <select v-model="formData.role" required :disabled="isSelf(formData)" class="my-input py-4">
            <option disabled value="">Select role</option>
            <option v-if="formData.role && !roles.some((role) => role.title === formData.role)" :value="formData.role">
              {{ printEnum(formData.role) }} (unknown role)
            </option>
            <option v-for="role in roles" :key="role.id" :value="role.title">
              {{ printEnum(role.title) }} ({{ role.permissionCount }} permission{{ role.permissionCount === 1 ? '' : 's' }})
            </option>
          </select>
          <p v-if="isSelf(formData)" class="text-xs text-amber-500 mt-2">
            You cannot change your own role.
          </p>
          <p v-else class="text-xs text-gray-300 mt-2">
            The role decides what the account may access. Create roles on the Roles page
            and tick their permissions on the RBAC page.
          </p>
        </div>
        <div class="p-1 mb-3">
          <label class="my-label">{{ formData.id ? 'New Password' : 'Password' }}</label>
          <input v-model="formData.password" type="password" :required="!formData.id" minlength="6" maxlength="100"
            class="my-input"
            :placeholder="formData.id ? 'Leave blank to keep the current password' : 'At least 6 characters'">
        </div>
      </template>
    </data-table>
  </div>
</template>

<script>
import DataTable from '@/components/DataTable.vue';

export default {
  name: "UserPage",
  components: { DataTable },
  data() {
    return {
      headers: ["User", "Email", "Role", "Date Created"],
      filterOrderOptions: [
        { label: "Name", value: "name" },
        { label: "Email", value: "email" },
        { label: "Role", value: "role" },
        { label: "Date Created", value: "createdAt" },
        { label: "Date Updated", value: "updatedAt" },
      ],
      // Role titles that may be assigned (GET /users/roles)
      roles: [],
      defFormData: { name: "", email: "", password: "", role: "" },
    };
  },
  computed: {
    /** Per-role account counts returned by the list endpoint (extra) */
    roleStats() {
      return this.dataList?.extra?.roleCounts || [];
    },
    totalUsers() {
      return this.dataList?.extra?.totalUsers || 0;
    },
  },
  watch: {
    // Counts and role options are read back from the server once a create/edit
    // modal closes, so the summary chips never drift from the data.
    isModalOpen(value) {
      if (!value) this.fetchRoles();
    },
  },
  mounted() {
    this.filters.sortOrder = 'desc';
    // The role filter is intentionally NOT reset: DataTable merges the current
    // route query into the shared filters (so the Roles page can deep-link here
    // with ?role=staff) and the select always mirrors the filter in use.
    this.fetchRoles();
  },
  methods: {
    fetchRoles() {
      this.httpReq({
        customUrl: 'users/roles',
        method: 'get',
        callback: (data) => { this.roles = data || []; },
      });
    },
    /** The signed-in account — its role cannot be changed and it cannot be deleted */
    isSelf(user) {
      return !!this.auth?.id && Number(user.id) === Number(this.auth.id);
    },
    /** Admins get the solid chip so the most privileged accounts stand out */
    isAdminRole(role) {
      return String(role || '').toLowerCase() === 'admin';
    },
    /** Blank password means "keep the current one" — drop the key entirely */
    transformSubmit(payload) {
      const data = { ...payload };
      if (!data.password) delete data.password;
      if (!data.role) delete data.role;
      return data;
    },
  },
};
</script>

