<template>
  <div class="">
    <div class="bg-sky-50 rounded-lg p-6 mb-2">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">
        Total Annualized Summaries
      </h2>
      <div class="text-sm grid grid-cols-2 gap-2 gap-x-4">
        <div class="flex justify-between items-center">
          <span class="text-gray-600">Defective Trap Count</span>
          <span class="font-medium text-gray-800">{{ report.defectiveTrapCount }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-600">Steam Loss (lb)</span>
          <span class="font-medium text-gray-800">{{ report.totalSteamLoss?.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-600">Annual Loss</span>
          <span class="font-medium text-gray-800">{{ report.totalAnnualLoss?.toFixed(2) }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-gray-600">Fue Used</span>
          <span class="font-medium text-gray-800">{{ report.totalFuelUsed?.toFixed(2) }}</span>
        </div>
        <div></div>
        <div class="flex justify-between items-center">
          <span class="text-gray-600">CO<sub>2</sub> Emissions</span>
          <span class="font-medium text-gray-800">{{ report.totalCO2Emissions?.toFixed(2) }}</span>
        </div>
      </div>
    </div>
    <div v-for="(data, i) in report.defectiveTraps" :key="i" class="border">
      <div
        :class="[
          'p-6 text-xs',
          i % 2 !== 0 ? 'bg-sky-50' : 'bg-gray-50',
          `border-s-[5px] border-[${conditionColorMap[data.condition] || 'gray-300'}]`,
        ]"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-5 print-cols-5 gap-4 mb-4">
          <div>
            <div class="text-gray-500 mb-1">Tag No</div>
            <div class="text-sm text-blue-600 font-semibold">{{ data.tagNo }}</div>
            <div class="text-gray-600">Condition</div>
            <div class="text-sm">{{ data.condition }}</div>
          </div>
          <div>
            <div class="text-gray-500 mb-1">Manufacturer</div>
            <div class="text-sm font-semibold">{{ data.manufacturer }}</div>
            <div class="text-gray-600">Model</div>
            <div class="text-sm">{{ data.model }}</div>
          </div>
          <div>
            <div class="text-gray-500 mb-1">Connection Size</div>
            <div class="text-sm font-semibold">{{ data.connectionSize }}<sup>"</sup></div>
            <div class="text-gray-600">Application</div>
            <div class="text-sm">{{ data.application }}</div>
          </div>
          <div>
            <div class="text-gray-500 mb-1">Steam Pressure In</div>
            <div class="text-sm font-semibold">{{ data.pressureIn }} psig</div>
            <div class="text-gray-500 mb-1">Steam Pressure Out</div>
            <div class="text-sm font-semibold">{{ data.pressureOut }} psig</div>
          </div>
          <div>
            <div class="text-gray-600">Installed Date</div>
            <div class="text-sm">{{ data.installationDate }}</div>
            <div class="text-gray-500 mb-1">Total Annual Cost</div>
            <div class="font-semibold">{{ data.annualLoss?.toFixed(2) || 'N/A' }} USD</div>
          </div>
        </div>

        <div class="mb-4 grid grid-cols-2 gap-4 w-full">
          <div>
            <div class="text-gray-500 mb-1">Physical Location</div>
            <div class="text-sm">{{ data.physicalLocation }}</div>
          </div>
          <div>
            <div class="text-gray-500 mb-1">Comments</div>
            <div class="text-sm">{{ data.comment || 'N/A' }}</div>
          </div>
        </div>
        
        <div>
          <div class="text-sm text-gray-500 mb-2">Recommendation</div>
          <div class="text-sm text-gray-700">{{ data.recommendation || 'N/A' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: "ReportDefective",
  components: {},
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
