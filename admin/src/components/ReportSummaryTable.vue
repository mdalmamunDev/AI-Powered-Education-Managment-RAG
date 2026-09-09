<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h2 class="text-lg font-semibold text-gray-800 mb-4">{{ title }}</h2>
    <div class="overflow-x-auto">
      <table class="w-full text-xs">
        <thead>
          <tr class="border-b border-gray-800">
            <th class="text-left py-2 text-gray-600 font-medium">Description</th>
            <th class="text-center py-2 text-gray-600 font-medium">Total</th>
            <th class="text-center py-2 text-gray-600 font-medium">%</th>
            <th class="text-center py-2 text-gray-600 font-medium">Failure</th>
            <th class="text-center py-2 text-gray-600 font-medium">Failure(%)</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(data, key) in reportSummary"
            :key="key"
            :class="key === 'Total' ? 'border-2 border-gray-800 bg-gray-50 font-semibold' : 'border-b border-gray-100'"
          >
            <td class="py-2">
              <div class="flex items-center">
                <span :class="key === 'Total' ? 'text-gray-800' : 'text-gray-600'">{{ key }}</span>
              </div>
            </td>
            <td class="text-center py-2">{{ data.count }}</td>
            <td class="text-center py-2">{{ data.percent }}</td>
            <td class="text-center py-2">{{ data.failureCount }}</td>
            <td class="text-center py-2">{{ data.failurePercent }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: "ReportSummaryTable",
  props: {
    reportSummary: {
      type: Object,
      default: () => { return {}}
    },
    title: String,
  },
  data() {
    return {
      //
    };
  },
  methods: {
    //
  },
};
</script>


