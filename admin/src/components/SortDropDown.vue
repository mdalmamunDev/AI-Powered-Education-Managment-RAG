<template>
  <a-dropdown trigger="click">
    <a class="ant-dropdown-link cursor-pointer ms-2" @click.prevent>
      <i class="fa-solid fa-caret-down"></i>
    </a>
    <template #overlay>
      <a-menu class="w-64">
        <!-- Sort Options -->
        <template v-if="sortable">
          <a-menu-item @click="sortBy('asc')">
            <i class="fa-solid fa-arrow-up me-2"></i> Sort Ascending
          </a-menu-item>
          <a-menu-item @click="sortBy('desc')">
            <i class="fa-solid fa-arrow-down me-2"></i> Sort Descending
          </a-menu-item>
          <!-- Divider -->
          <a-menu-divider />
        </template>

        <!-- Autosize Options -->
        <a-menu-item @click="autosizeThisColumn">
          Autosize This Column
        </a-menu-item>
        <a-menu-item @click="autosizeAllColumns">
          Autosize All Columns
        </a-menu-item>

        <!-- Divider -->
        <a-menu-divider />

        <a-menu-item @click="resetThisColumn">
          Reset This Column
        </a-menu-item>
        <a-menu-item @click="resetAllColumns">
          Reset All Columns
        </a-menu-item>

        <!-- Divider -->
        <a-menu-divider />

        <!-- Clear Filters -->
        <a-menu-item @click="clearCurrentColumnFilter">
          <i class="fa-solid fa-filter-circle-xmark me-2"></i> Clear Current Column Filter
        </a-menu-item>
        <a-menu-item @click="clearAllColumnFilters">
          <i class="fa-solid fa-filter-circle-xmark me-2"></i> Clear All Column Filters
        </a-menu-item>

        <!-- Divider -->
         <template v-if="hidden">
          <a-menu-divider />
          
          <a-menu-item @click="hideThisColumn">
            <i class="fa-solid fa-eye-slash me-2"></i> Hide This Column
          </a-menu-item>
      </template>
      </a-menu>
    </template>
  </a-dropdown>
</template>

<script>
export default {
  name: 'SortDropDown',

  props: {
    field: String,
    filterFields: Array,
    sortable: {
      type: Boolean,
      default: true,
    },
    hidden: {
      type: Boolean,
      default: true,
    },
  },
  methods: {
    sortBy(order) {
      this.filters.sortBy = this.field;
      this.filters.sortOrder = order;
      this.fetchData();
    },
    autosizeThisColumn() {
      const th = document.getElementById(`th-${this.field}`);
      if (th) {
        th.style.width = 'auto';
      }
    },
    autosizeAllColumns() {
      const ths = document.querySelectorAll('th');
      ths.forEach(th => {
        th.style.width = 'auto';
      });
    },
    resetThisColumn() {
      this.autosizeThisColumn();
      this.clearCurrentColumnFilter();
    },
    resetAllColumns() {
      this.autosizeAllColumns();
      this.clearAllColumnFilters();
    },
    clearCurrentColumnFilter() {
      if (!this.filters) return;
      
      // If you have direct access to filters object:
      if (this.filterFields) {
        this.filterFields.forEach(f => {
          if (this.filters[f] !== undefined) {
            this.filters[f] = undefined;
          }
        });
      }else {
        this.filters[this.field] = undefined;
      }

      this.fetchData();
    },
    clearAllColumnFilters() {
      // Example: emit event or clear all filters
      if (this.filters) {
        Object.keys(this.filters).forEach(key => {
          this.filters[key] = undefined;
        });
        this.fetchData();
      }
    },
    hideThisColumn() {
      if (!this.field) return;

      const className = `col-${this.field}`;
      const elements = document.querySelectorAll(`.${className}`);
      elements.forEach(el => {
        el.style.display = 'none';
      });
    },
  },
};
</script>

<style scoped>
.ant-dropdown-menu-item {
  padding: 10px 16px;
  font-size: 14px;
}
</style>
