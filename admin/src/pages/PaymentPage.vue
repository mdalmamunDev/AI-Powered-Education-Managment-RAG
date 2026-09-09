<template>
  <data-table title="All Payments" :headers="headers" :def-form-data="defFormData" :transform-submit="transformSubmit" :filter-order-options="filterOrderOptions" :dif-sort-order="'asc'">
    <template #default="{ item }">
      <td class="my-td-1st font-medium">{{ item.student?.firstName }} {{ item.student?.lastName }}</td>
      <td class="my-td text-gray-300">{{ item.amount }}</td>
      <td class="my-td text-gray-300">{{ getDate(item.paymentDate) }}</td>
      <td class="my-td text-gray-300">{{ humanize(item.paymentMethod) }}</td>
      <td class="my-td text-gray-300">{{ item.semester }}</td>
      <td class="my-td text-gray-300"><span v-html="printStatus((item.status || '').toLowerCase(), statusColors)"></span></td>
    </template>

    <template #modal>
      <div class="grid grid-cols-2 gap-3">
        <div class="p-1 mb-3">
          <label class="my-label">Student</label>
          <select v-model="formData.studentId" required class="my-input py-4">
            <option disabled value="">Select student</option>
            <option v-for="s in students" :key="s.id" :value="s.id">{{ s.firstName }} {{ s.lastName }}</option>
          </select>
        </div>
        <div class="p-1 mb-3">
          <label class="my-label">Amount</label>
          <input v-model="formData.amount" type="number" step="0.01" min="0" required class="my-input" placeholder="e.g. 1500.00">
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="p-1 mb-3">
          <label class="my-label">Payment Date</label>
          <input type="date" :value="toInputDate(formData.paymentDate)" @input="formData.paymentDate = $event.target.value"
            class="my-input">
        </div>
        <div class="p-1 mb-3">
          <label class="my-label">Payment Method</label>
          <select v-model="formData.paymentMethod" required class="my-input py-4">
            <option value="CASH">Cash</option>
            <option value="CARD">Card</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="MOBILE_BANKING">Mobile Banking</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="p-1 mb-3">
          <label class="my-label">Semester</label>
          <input v-model="formData.semester" type="text" required class="my-input" placeholder="e.g. Fall 2025">
        </div>
        <div class="p-1 mb-3">
          <label class="my-label">Status</label>
          <select v-model="formData.status" required class="my-input py-4">
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
      </div>
    </template>
  </data-table>
</template>

<script>
import DataTable from '@/components/DataTable.vue';

export default {
  name: "PaymentPage",
  components: { DataTable },
  data() {
    return {
      headers: ["Student", "Amount", "Payment Date", "Method", "Semester", "Status"],
      filterOrderOptions: [
        { label: "Student", value: "studentId" },
        { label: "Amount", value: "amount" },
        { label: "Payment Date", value: "paymentDate" },
        { label: "Method", value: "paymentMethod" },
        { label: "Semester", value: "semester" },
        { label: "Status", value: "status" },
        { value: 'createdAt', label: 'Date Created' },
      ],
      students: [],
      statusColors: { pending: "yellow", paid: "green", failed: "red", refunded: "blue" },
      defFormData: { studentId: "", amount: null, paymentDate: "", paymentMethod: "CASH", semester: "", status: "PENDING" },
    };
  },
  mounted() {
    this.filters.sortOrder = 'asc';
    this.httpReq({ customUrl: 'students?limit=200', method: 'get', callback: (data) => { this.students = data || []; } });
  },
  methods: {
    toInputDate(value) {
      if (!value) return "";
      return String(value).slice(0, 10);
    },
    transformSubmit(data) {
      if (data.paymentDate) data.paymentDate = this.toInputDate(data.paymentDate);
      else delete data.paymentDate; // let backend default (now) apply
      return data;
    },
  },
};
</script>