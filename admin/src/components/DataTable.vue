<template>
	<div v-if="showTitle" class="flex">
		<div class="flex-1 flex justify-between items-center px-8 py-3 bg-1">
			<h1 class="text-2xl font-semibold">{{ title }}</h1>

			<!-- Search Bar -->
			<form v-if="showFilter" @submit.prevent="fetchData()" class="flex gap-2">
				<slot name="filters"></slot>

				<div v-if="filterSearch" class="relative">
					<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<i class="fa-solid fa-magnifying-glass text-2xl text-blue-600"></i>
					</div>
					<input v-model="filters.search" type="text"
						:placeholder="searchPlaceholder || `Search ${record?.toLowerCase()} here`"
						class="bg-surface text-main border-theme border pl-12 pr-4 py-2 rounded-xl w-80 focus:outline-none focus:ring-2 focus:ring-blue-500">
				</div>
				<!-- Sort / Order -->
				<div v-if="filterOrder" class="flex items-center bg-surface border border-theme rounded-xl text-sm text-sub overflow-hidden">
					<!-- Sort Field -->
					<select v-model="filters.sortBy" @change="fetchData()"
						class="bg-surface px-4 py-2 focus:outline-none">
						<option v-for="option in filterOrderOptions" :key="option.value" :value="option.value">
							{{ option.label }}
						</option>
					</select>

					<!-- ASC / DESC Toggle -->
					<button type="button" @click="toggleSortOrder" class="px-4 py-2 border-l border-theme hover:bg-2 transition"
						:title="filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'">
						<i :class="filters.sortOrder === 'asc'
							? 'fa-solid fa-arrow-up-wide-short'
							: 'fa-solid fa-arrow-down-wide-short'" class="text-blue-600"></i>
					</button>
				</div>
			</form>
		</div>
		<button v-if="showAddBtn" @click="openModal(defFormData)" class="btn-g px-5">
			<i class="fa fa-plus"></i>
			Add {{ record }}
		</button>
	</div>

	<div class="bg-1 min-h-[60vh]">
		<table class="w-full text-center">
			<!-- Table Header -->
			<thead class="bg-2">
				<tr class="text-gray-300 text-sm font-medium">
					<template v-for="(item, index) in headers" :key="index">
						<th :class="index === 0 ? 'my-td-1st' : 'my-td'">
							{{ item }}
						</th>
					</template>
					<th v-if="showAction" class="my-td text-end pe-8">Action</th>
				</tr>
			</thead>

			<!-- Table Body -->
			<tbody class="divide-y divide-gray-600">
				<tr v-for="(item, index) in dataList?.data" :key="index">
					<!-- Scoped slot for extra content -->
					<template v-if="$slots.default">
						<slot :item="item" :index="index"></slot>
					</template>
					<td v-if="showAction" class="my-td">
						<div class="flex items-center justify-end space-x-2">
							<button v-if="actionEdit" @click="openModal({ ...defFormData, ...item })" class="table-action">
								<i class="fa fa-edit text-blue-600"></i>
							</button>
							<button v-if="actionDelete" @click="deleteRecord(item?.id)" class="table-action">
								<i class="fa-solid fa-trash-can text-red-600"></i>
							</button>
							<button v-if="actionInfo"
								@click="typeof onActionInfo === 'function' ? onActionInfo(item) : $router.push(`${$route.path}/${item.id}`)"
								class="table-action">
								<i class="fa-solid fa-circle-info text-sub"></i>
							</button>
						</div>
					</td>
				</tr>
			</tbody>
		</table>
	</div>


	<!-- Pagination -->
	<div v-if="dataList?.pagination?.totalCount" class="flex justify-center mt-5">
		<a-pagination :current="dataList?.pagination?.currentPage || 1" :total="dataList?.pagination?.totalCount || 0"
			:pageSize="dataList?.pagination?.itemsPerPage || 10" show-quick-jumper show-size-changer @change="onChange"
			@showSizeChange="onShowSizeChange" />
	</div>


	<!-- Modal -->
	<div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
		<div class="relative bg-2 rounded-3xl shadow-lg w-full p-6" :class="`max-w-${modalW}`">
			<div class="mb-4">
				<h3 class="font-semibold text-lg text-center">{{ formData.id ? 'Update' : 'Add' }} {{ record }}</h3>
				<button class="text-3xl hover:text-gray-300 absolute top-2 right-4" @click="closeModal()">
					&times;
				</button>
			</div>
			<form @submit.prevent="handleFormSubmit()" class="overflow-y-auto hide-scrollbar max-h-[80vh]">
				<slot name="modal">

				</slot>
				<!-- Submit Button -->
				<action-button class="mt-5">Submit</action-button>
			</form>
		</div>
	</div>
</template>

<script>
export default {
	name: "CoachPage",
	props: {
		showTitle: {
			type: Boolean,
			default: true,
		},
		showAddBtn: {
			type: Boolean,
			default: true,
		},
		showAction: {
			type: Boolean,
			default: true,
		},
		actionEdit: {
			type: Boolean,
			default: true,
		},
		actionDelete: {
			type: Boolean,
			default: true,
		},
		actionInfo: {
			type: Boolean,
			default: true,
		},
		onActionInfo: Function,
		showFilter: {
			type: Boolean,
			default: true,
		},
		filterSearch: {
			type: Boolean,
			default: true,
		},
		filterOrder: {
			type: Boolean,
			default: true,
		},
		filterOrderOptions: {
			type: Array,
			default: () => [
				{ value: 'createdAt', label: 'Date Created' },
				{ value: 'updatedAt', label: 'Date Updated' }
			],
		},
		difSortOrder: {
			type: String,
			default: '',
		},
		searchPlaceholder: String,
		title: {
			type: String,
			default: "List"
		},
		headers: {
			type: Array,
			default: () => []
		},
		fetchDirect: {
			type: Boolean,
			default: true,
		},
		defFormData: {
			type: Object,
			default: () => { },
		},
		modalW: {
			type: String,
			default: "lg"
		},
		// Optional function applied to formData before submit (e.g. converting
		// "HH:MM" time inputs to ISO strings expected by the backend)
		transformSubmit: {
			type: Function,
			default: null,
		},
	},
	data() {
		return {
			//
		};
	},
	mounted() {
		console.log('mounted with query', this.$route.query);
		this.filters.sortBy = this.filterOrderOptions[0]?.value || '';
		this.filters.sortOrder = this.difSortOrder || 'desc';
		this.$store.commit('setFilters', { ...this.filters, ...this.$route.query });
		if (this.fetchDirect) this.fetchData();
	},
	computed: {
		record() {
			return this.$route.meta?.title || "Record";
		}
	},
	methods: {
		handleFormSubmit() {
			// Component-level hook: apply optional payload transform, then delegate
			// to the global mixin's submitForm()
			if (typeof this.transformSubmit === 'function') {
				this.$store.commit('setFormData', this.transformSubmit({ ...this.formData }));
			}
			this.submitForm();
		},
		deleteRecord(id) {
			this.openAlert({
				title: `Delete ${this.record}`,
				text: `Do you want to delete ${this.record?.toLowerCase()}`,
				confirmButtonText: 'Delete',
				cancelButtonText: 'Cancel',
				callback: (isConfirmed) => {
					if (isConfirmed) {
						this.httpReq({
							method: 'delete',
							urlSuffix: id,
							data: {},
							callback: () => { this.fetchData() }
						});
					}
				},
			});
		},

		onChange(page) {
			this.filters.page = page;
			this.fetchData();
		},
		onShowSizeChange(current, size) {
			this.filters.page = current;
			this.filters.limit = size;
			this.fetchData();
		},
		toggleSortOrder() {
			this.filters.sortOrder =
				this.filters.sortOrder === 'asc' ? 'desc' : 'asc';

			this.fetchData();
		},
	}
};
</script>
