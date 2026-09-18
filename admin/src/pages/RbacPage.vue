<template>
  <div class="max-w-6xl mx-auto space-y-6">
    <!-- Heading + selected role -->
    <div class="flex flex-wrap items-end justify-between gap-4 px-2">
      <div>
        <h1 class="text-2xl font-semibold text-main">Role Based Access Control</h1>
        <p class="text-gray-300 text-sm mt-1">
          Choose a role, then tick the actions each module is allowed to perform.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <label class="my-label mb-0 whitespace-nowrap">Selected Role</label>
        <select v-model="selectedRoleId" :disabled="!roles.length" @change="applyRole" class="my-input w-56">
          <option v-for="role in roles" :key="role.id" :value="role.id">{{ printEnum(role.title) }}</option>
        </select>
      </div>
    </div>

    <!-- Permission matrix -->
    <div class="bg-1 rounded-lg overflow-hidden">
      <!-- Card header -->
      <div class="flex flex-wrap items-center justify-between gap-3 px-8 py-3 bg-1 border-b border-theme">
        <h2 class="text-2xl font-semibold text-main">RBAC</h2>

        <div class="flex flex-wrap items-center gap-2">
          <span class="bg-4 text-accent px-3 py-1 rounded-full text-xs font-semibold">
            {{ grantedCount }} / {{ permissionKeys.length }} granted
          </span>
          <button type="button" @click="grantAll" :disabled="!permissionKeys.length"
            class="btn-g px-4 py-2 rounded-xl text-xs disabled:opacity-50 disabled:cursor-not-allowed">
            Select all
          </button>
          <button type="button" @click="clearAll" :disabled="!permissionKeys.length"
            class="border border-theme text-main bg-hover px-4 py-2 rounded-xl text-xs disabled:opacity-50 disabled:cursor-not-allowed">
            Clear all
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="py-16 text-center text-gray-300">
        <i class="fa-solid fa-spinner fa-spin text-2xl"></i>
        <p class="mt-3 text-sm">Loading roles and permissions...</p>
      </div>

      <!-- Empty -->
      <div v-else-if="!rows.length" class="py-16 text-center text-gray-300">
        <i class="fa-regular fa-folder-open text-2xl"></i>
        <p class="mt-3 text-sm">The API returned no modules to configure.</p>
      </div>

      <!-- Matrix -->
      <table v-else class="w-full text-center">
        <thead class="bg-2">
          <tr class="text-gray-300 text-sm font-medium">
            <th class="my-td-1st">Module / Permission</th>
            <th v-for="action in actions" :key="action.key" class="my-td">{{ action.label }}</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-600">
          <tr v-for="row in rows" :key="row.module.id" :class="row.isGroup ? 'bg-2' : ''">
            <!-- Module title: group rows are bold, children are indented -->
            <td class="my-td-1st" :class="row.depth ? 'ps-12' : ''">
              <span :class="row.isGroup ? 'font-semibold text-main' : ''">{{ row.module.title }}</span>
              <span v-if="row.isGroup" class="text-xs text-gray-300 ms-2">
                ({{ row.module.children.length }} modules)
              </span>
            </td>

            <!-- Action cells -->
            <td v-for="action in actions" :key="action.key" class="my-td">
              <input v-if="isAvailable(row.module, action.key)" type="checkbox" class="my-check cursor-pointer"
                :checked="isChecked(row.module, action.key)"
                :indeterminate.prop="isIndeterminate(row.module, action.key)"
                @change="toggle(row.module, action.key, $event.target.checked)">
              <span v-else class="text-gray-300">&mdash;</span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Card footer -->
      <div v-if="!loading && rows.length"
        class="flex flex-wrap items-center justify-between gap-3 px-8 py-4 bg-1 border-t border-theme">
        <p class="text-xs text-gray-300">{{ footerNote }}</p>
        <div class="flex gap-3">
          <button type="button" @click="resetMatrix" :disabled="!isDirty || saving"
            class="border border-theme text-main bg-hover px-6 py-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed">
            Reset
          </button>
          <button type="button" @click="saveMatrix" :disabled="!isDirty || saving"
            class="btn-g px-6 py-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed">
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "RbacPage",
  data() {
    return {
      loading: false,
      saving: false,

      // Roles as returned by GET /rbac: { id, title, moduleKeys, permissionKeys }
      roles: [],
      // Flat module list as returned by GET /rbac: { id, title, key, parentModuleId }
      modules: [],
      // Every grantable permission key, e.g. "dashboard.read"
      permissionKeys: [],

      selectedRoleId: null,
      // Currently ticked permission keys on the selected role
      selected: {},

      actions: [
        { key: "create", label: "Create" },
        { key: "read", label: "Read" },
        { key: "update", label: "Update" },
        { key: "delete", label: "Delete" },
      ],
    };
  },
  mounted() {
    this.fetchRbac();
  },
  computed: {
    /**
     * Nested tree built from the flat `modules` list (linked by parentModuleId),
     * so the page renders whatever GET /rbac returns without hardcoded modules.
     */
    moduleTree() {
      const byId = new Map();
      this.modules.forEach((module) => byId.set(module.id, { ...module, children: [] }));

      const roots = [];
      byId.forEach((node) => {
        const parent = node.parentModuleId === null || node.parentModuleId === undefined
          ? null
          : byId.get(node.parentModuleId);
        if (parent) parent.children.push(node);
        else roots.push(node);
      });

      const sortById = (nodes) => {
        nodes.sort((a, b) => a.id - b.id);
        nodes.forEach((node) => sortById(node.children));
        return nodes;
      };
      return sortById(roots);
    },

    /** Flat render list: each module followed by its children (depth = indent) */
    rows() {
      const rows = [];
      const push = (module, depth) => {
        rows.push({ module, depth, isGroup: (module.children || []).length > 0 });
        (module.children || []).forEach((child) => push(child, depth + 1));
      };
      this.moduleTree.forEach((module) => push(module, 0));
      return rows;
    },

    /** O(1) lookups while rendering the matrix */
    permissionKeySet() {
      return new Set(this.permissionKeys);
    },

    currentRole() {
      return this.roles.find((role) => role.id === this.selectedRoleId) || null;
    },

    grantedCount() {
      return this.permissionKeys.filter((key) => this.selected[key]).length;
    },

    /** Ticked keys, sorted so they can be compared with the saved role */
    grantedKeys() {
      return this.permissionKeys.filter((key) => this.selected[key]).sort();
    },

    isDirty() {
      const saved = (this.currentRole?.permissionKeys || []).slice().sort();
      return saved.join("|") !== this.grantedKeys.join("|");
    },

    footerNote() {
      if (!this.currentRole) return "No role selected.";
      const label = this.printEnum(this.currentRole.title);
      if (this.isDirty) return `Unsaved changes for ${label}.`;
      if (!(this.currentRole.permissionKeys || []).length) {
        return `${label} has no saved permissions yet - tick the actions to grant access.`;
      }
      return `${label} permissions loaded from the server.`;
    },
  },
  methods: {
    /** GET /rbac - the route's meta.dataUrl is "rbac" */
    fetchRbac() {
      this.loading = true;
      this.fetchData({
        callback: (payload) => this.hydrate(payload),
        errorCallback: () => { this.loading = false; },
      });
    },

    /**
     * Maps the GET /rbac payload onto the matrix:
     * { roles, modules, permissions: [{ key }], permissionKeys: ["module.action"] }
     */
    hydrate(payload = {}) {
      this.roles = payload.roles || [];
      this.modules = payload.modules || [];
      this.permissionKeys = this.collectPermissionKeys(payload);
      this.loading = false;
      this.selectDefaultRole();
      this.applyRole();
    },

    /** Prefers the `permissionKeys` string list, falling back to `permissions` */
    collectPermissionKeys(payload) {
      const list = Array.isArray(payload.permissionKeys) && payload.permissionKeys.length
        ? payload.permissionKeys
        : (payload.permissions || []).map((permission) => permission.key);
      return [...new Set(list.filter(Boolean))];
    },

    /** Defaults to the admin role when present, otherwise the first role */
    selectDefaultRole() {
      const admin = this.roles.find((role) => String(role.title).toLowerCase() === "admin");
      const role = admin || this.roles[0];
      this.selectedRoleId = role ? role.id : null;
    },

    /** Loads the selected role's saved permissions into the checkboxes */
    applyRole() {
      const granted = new Set(this.currentRole?.permissionKeys || []);
      const selected = {};
      this.permissionKeys.forEach((key) => { selected[key] = granted.has(key); });
      this.selected = selected;
    },

    /**
     * Actions a module can actually be granted, derived from the server's
     * permission keys (e.g. "dashboard" only exposes read). Group rows
     * aggregate the actions available to their children.
     */
    availableActions(module) {
      const children = module.children || [];
      if (children.length) {
        const keys = new Set();
        children.forEach((child) => {
          this.availableActions(child).forEach((key) => keys.add(key));
        });
        return [...keys];
      }
      return this.actions
        .map((action) => action.key)
        .filter((action) => this.permissionKeySet.has(this.permissionKey(module.key, action)));
    },

    isAvailable(module, action) {
      return this.availableActions(module).includes(action);
    },

    /** Permission key of a module, e.g. "student.create" */
    permissionKey(moduleKey, action) {
      return `${moduleKey}.${action}`;
    },

    /**
     * Keys an action toggles for a row: a leaf cell controls its own key,
     * a group cell (e.g. the "People" row) controls every child key.
     */
    permissionKeysFor(module, action) {
      if (!this.isAvailable(module, action)) return [];

      const children = module.children || [];
      if (children.length) {
        return children.flatMap((child) => this.permissionKeysFor(child, action));
      }
      return [this.permissionKey(module.key, action)];
    },

    isChecked(module, action) {
      const keys = this.permissionKeysFor(module, action);
      return keys.length > 0 && keys.every((key) => this.selected[key]);
    },

    isIndeterminate(module, action) {
      const keys = this.permissionKeysFor(module, action);
      const granted = keys.filter((key) => this.selected[key]).length;
      return granted > 0 && granted < keys.length;
    },

    toggle(module, action, value) {
      this.permissionKeysFor(module, action).forEach((key) => {
        this.selected[key] = value;
      });
    },

    grantAll() {
      this.permissionKeys.forEach((key) => { this.selected[key] = true; });
    },

    clearAll() {
      this.permissionKeys.forEach((key) => { this.selected[key] = false; });
    },

    resetMatrix() {
      this.applyRole();
      this.showToast("Reverted to the saved permissions", "info");
    },

    /** "student.read" -> "student" (module keys may contain dashes) */
    moduleKeysFrom(keys) {
      return [...new Set(keys.map((key) => key.slice(0, key.lastIndexOf("."))))];
    },

    /** PUT /roles/:id - persists the ticked permissions for the selected role */
    saveMatrix() {
      if (!this.currentRole) return;

      this.saving = true;
      const granted = this.grantedKeys;

      this.httpReq({
        customUrl: "roles",
        urlSuffix: this.currentRole.id,
        method: "put",
        data: {
          // moduleKeys is derived: a module counts as enabled once at least one
          // of its actions is granted.
          moduleKeys: this.moduleKeysFrom(granted),
          permissionKeys: granted,
        },
        callback: () => {
          this.saving = false;
          // this.fetchRbac();
        },
        errorCallback: () => { this.saving = false; },
      });
    },
  },
};</script>