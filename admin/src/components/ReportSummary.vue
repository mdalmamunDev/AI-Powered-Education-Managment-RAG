<template>
  <div class="">
    <!-- Total Annualized Summaries -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-2">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">
        Total Annualized Summaries
      </h2>
      <div class="text-sm grid grid-cols-2 gap-2 gap-x-4">
        <div class="flex justify-between items-center">
          <span class="text-gray-600">Fuel Used (MMBTU/yr)</span>
          <span class="font-medium text-gray-800">6,643</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-600">Steam Loss (lb)</span>
          <span class="font-medium text-gray-800">4,749,498</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-600">CO2 Emissions (lb)</span>
          <span class="font-medium text-gray-800">777,277</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-600">Repair Cost (USD)</span>
          <span class="font-medium text-gray-800">0</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-600">Payback Period (months)</span>
          <span class="font-medium text-gray-800">0</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-600">Average Time To Resolve (Days)</span>
          <span class="font-medium text-gray-800">N/A</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-600">Plugged Trap Count</span>
          <span class="font-medium text-gray-800">2</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-600">Monetary Summary</span>
          <span class="font-medium text-gray-800"></span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-600">Plugged Cost (USD)</span>
          <span class="font-medium text-gray-800">6,000</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-600">CO2 Cost (USD)</span>
          <span class="font-medium text-gray-800">0.00</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-600">Steam Loss Cost (USD)</span>
          <span class="font-medium text-gray-800">20,090</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-600">Total Savings (USD)</span>
          <span class="font-medium text-gray-800">26,090</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 2xl:grid-cols-2 print-cols-2 gap-1">
      <!-- Trap Type Summary -->
      <ReportSummaryTable title="Trap Type Summary" :report-summary="report?.trapTypeSummary"/>

      <!-- Application Summary -->
      <ReportSummaryTable title="Application Summary" :report-summary="report?.applicationSummary"/>
    </div>

    <div class="grid grid-cols-1 2xl:grid-cols-2 print-cols-2 gap-1 mb-6">
      <!-- Manufacturer Summary -->
      <ReportSummaryTable title="Manufacturer Summary" :report-summary="report?.manufacturerSummary"/>

      <!-- Condition Summary -->
      <ReportSummaryTable title="Condition Summary" :report-summary="report?.conditionSummary"/>
    </div>
  </div>
</template>

<script>
import ReportSummaryTable from './ReportSummaryTable.vue';

export default {
  name: "ReportSummary",
  components: {ReportSummaryTable},
  props: {
    report: {
      type: Object,
      default: () => { return {}}
    }
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


