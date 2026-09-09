<template>
  <data-table title="All Book Loans" :headers="headers" :def-form-data="defFormData" :transform-submit="transformSubmit" :filter-order-options="filterOrderOptions" :dif-sort-order="'asc'">
    <template #default="{ item }">
      <td class="my-td-1st font-medium">{{ item.book?.title }}</td>
      <td class="my-td text-gray-300">{{ item.student?.firstName }} {{ item.student?.lastName }}</td>
      <td class="my-td text-gray-300">{{ getDate(item.checkoutDate) }}</td>
      <td class="my-td text-gray-300">{{ getDate(item.dueDate) }}</td>
      <td class="my-td text-gray-300">{{ item.returnDate ? getDate(item.returnDate) : '—' }}</td>
      <td class="my-td text-gray-300"><span v-html="printStatus((item.status || '').toLowerCase(), statusColors)"></span></td>
    </template>

    <template #modal>
      <div class="grid grid-cols-2 gap-3">
        <div class="p-1 mb-3">
          <label class="my-label">Book</label>
          <select v-model="formData.bookId" required class="my-input py-4">
            <option disabled value="">Select book</option>
            <option v-for="b in books" :key="b.id" :value="b.id">{{ b.title }} ({{ b.copiesAvailable }} available)</option>
          </select>
        </div>
        <div class="p-1 mb-3">
          <label class="my-label">Student</label>
          <select v-model="formData.studentId" required class="my-input py-4">
            <option disabled value="">Select student</option>
            <option v-for="s in students" :key="s.id" :value="s.id">{{ s.firstName }} {{ s.lastName }}</option>
          </select>
        </div>
      </div>
      <div class="grid grid-cols-3 gap-3">
        <div class="p-1 mb-3">
          <label class="my-label">Checkout Date</label>
          <input type="date" :value="toInputDate(formData.checkoutDate)" @input="formData.checkoutDate = $event.target.value"
            class="my-input">
        </div>
        <div class="p-1 mb-3">
          <label class="my-label">Due Date</label>
          <input type="date" :value="toInputDate(formData.dueDate)" @input="formData.dueDate = $event.target.value"
            required class="my-input">
        </div>
        <div class="p-1 mb-3">
          <label class="my-label">Return Date</label>
          <input type="date" :value="toInputDate(formData.returnDate)" @input="formData.returnDate = $event.target.value"
            class="my-input">
        </div>
      </div>
      <div class="p-1 mb-3">
        <label class="my-label">Status</label>
        <select v-model="formData.status" required class="my-input py-4">
          <option value="BORROWED">Borrowed</option>
          <option value="RETURNED">Returned</option>
          <option value="OVERDUE">Overdue</option>
          <option value="LOST">Lost</option>
        </select>
      </div>
    </template>
  </data-table>
</template>

<script>
import DataTable from '@/components/DataTable.vue';

export default {
  name: "BookLoanPage",
  components: { DataTable },
  data() {
    return {
      headers: ["Book", "Student", "Checkout Date", "Due Date", "Return Date", "Status"],
      filterOrderOptions: [
        { label: "Book", value: "bookId" },
        { label: "Student", value: "studentId" },
        { label: "Checkout Date", value: "checkoutDate" },
        { label: "Due Date", value: "dueDate" },
        { label: "Return Date", value: "returnDate" },
        { label: "Status", value: "status" },
        { value: 'createdAt', label: 'Date Created' },
      ],
      books: [],
      students: [],
      statusColors: { borrowed: "blue", returned: "green", overdue: "yellow", lost: "red" },
      defFormData: { bookId: "", studentId: "", checkoutDate: "", dueDate: "", returnDate: "", status: "BORROWED" },
    };
  },
  mounted() {
    this.filters.sortOrder = 'asc';
    this.httpReq({ customUrl: 'library-books?limit=200', method: 'get', callback: (data) => { this.books = data || []; } });
    this.httpReq({ customUrl: 'students?limit=200', method: 'get', callback: (data) => { this.students = data || []; } });
  },
  methods: {
    toInputDate(value) {
      if (!value) return "";
      return String(value).slice(0, 10);
    },
    transformSubmit(data) {
      if (data.checkoutDate) data.checkoutDate = this.toInputDate(data.checkoutDate);
      else delete data.checkoutDate; // let backend default (now) apply
      if (data.dueDate) data.dueDate = this.toInputDate(data.dueDate);
      // returnDate is optional: empty means null so Prisma accepts it
      data.returnDate = data.returnDate ? this.toInputDate(data.returnDate) : null;
      return data;
    },
  },
};
</script>