<template>
   <div class="flex flex-col space-y-4 text-xs">
    <!-- Top Section: Image + Details -->
    <div v-for="(data, i) in report?.result" :key="i" class="flex flex-col md:flex-row gap-6 my-2 border-y-2 print:break-after-page">
      <!-- Left: Image -->
      <div class="w-full lg:w-1/2 ">
        <img :src="asset(data.images[0])" @error="onImageError" alt="Trap Image" class="w-full h-auto object-cover" />
         <!-- Comments Section -->
        <div class="mt-4">
          <div class="bg-gray-200 p-2 font-bold border-b">Comments</div>
          <div class="p-2 text-xs leading-relaxed space-y-1">
            {{ data.comment }}
          </div>
        </div>
      </div>

      <!-- Right: Steam Trap Details -->
      <div class="w-full lg:w-1/2 space-y-4">
        <!-- Basic Info -->
        <div class="">
          <div class="bg-gray-200 p-2 font-bold border-b">Basic Information</div>
          <div class="p-2 space-y-1">
            <div><span class="font-semibold">Tag Number:</span> {{ data.tagNo }}</div>
            <div><span class="font-semibold">Ph. Location:</span> {{ data.physicalLocation }}</div>
            <div><span class="font-semibold">Elevation:</span> {{ data.elevation }}</div>
            <div><span class="font-semibold">Application:</span> {{ data.application }}</div>
            <div><span class="font-semibold">Installed Date:</span> {{ data.installationDate }}</div>
            <div><span class="font-semibold">Condition:</span> <span :class="`font-bold text-[${conditionColorMap[data.condition]}]`"> {{ data.condition }}</span></div>
          </div>
        </div>

        <!-- Steam Trap Characteristics -->
        <div class="">
          <div class="bg-gray-200 p-2 font-bold border-b">Steam Trap</div>
          <div class="p-2 space-y-1">
            <div><span class="font-semibold">Type:</span> {{ data.type }}</div>
            <div><span class="font-semibold">Manufacturer:</span> {{ data.manufacturer }}</div>
            <div><span class="font-semibold">Model:</span>{{ data.model }}</div>
            <div><span class="font-semibold">Connection:</span> {{ data.connectionType }}</div>
            <div><span class="font-semibold">PMO:</span> {{ data.pmo }} psig</div>
            <div><span class="font-semibold">Pipe Orientation:</span> {{ data.pipeOrientation }}</div>
          </div>
        </div>

        <!-- Operating Params -->
        <div class="">
          <div class="bg-gray-200 p-2 font-bold border-b">Operating Parameters</div>
          <div class="p-2 space-y-1">
            <div><span class="font-semibold">Steam Pressure In:</span> {{ data.pressureIn }} psig</div>
            <div><span class="font-semibold">Steam Pressure Out:</span> {{ data.pressureOut }} psig</div>
            <div><span class="font-semibold">Superheat:</span> {{ data.superheat ? 'Yes' : 'No' }}</div>
            <div><span class="font-semibold">Condensate:</span> {{ data.condensate }}</div>
            <div><span class="font-semibold">Shutdown Required:</span> {{ data.shutdownReq ? 'Yes' : 'No' }}</div>
            <div><span class="font-semibold">Time in Service:</span> {{ data.timeInService }} months/year</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: "ReportWorkOrderDetail",
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


