<template>
  <div class="bg-1 pb-10">
    <div class="p-14 w-full max-w-5xl">
      <!-- Header with profile info -->
      <div class="flex items-center space-x-4 mb-6">
        <!-- Profile Picture -->
        <img class="w-14 h-14 object-cover rounded-full" :src="showImg(details?.profileImage)" alt="">

        <!-- Name and Address -->
        <div>
          <h2 class="text-lg font-medium mb-2">{{ details?.name || 'Unknown' }}</h2>
          <p class="text-gray-400 text-sm">{{ details?.address || 'N/A' }}</p>
        </div>
      </div>

      <!-- Info Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Email Address -->
        <div>
          <h3 class="text-sm font-medium mb-2">Email Address</h3>
          <div class="flex items-center space-x-2 text-light">
            <i class="fa-regular fa-envelope"></i>
            <span class="text-sm">{{ details?.email || 'N/A' }}</span>
          </div>
        </div>
        <!-- Mobile -->
        <div>
          <h3 class="text-sm font-medium mb-2">Mobile Number</h3>
          <div class="flex items-center space-x-2 text-light">
            <img src="/icons/mobile.svg" alt="">
            <span class="text-sm">{{ details?.phone || 'N/A' }}</span>
          </div>
        </div>
        <!-- Completed Sessions -->
        <div>
          <h3 class="text-sm font-medium mb-2">Gender</h3>
          <div class="flex items-center space-x-2 text-light">
            <i class="fa-solid fa-venus-mars"></i>
            <span class="text-sm">{{ printEnum(details?.gender) }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="mb-3 mx-1 flex justify-between items-center">
      <h2 class="text-2xl">Recent Assignments</h2>
      <router-link :to="`/assignment?coachId=${id}`" class="btn-g py-1 px-2 rounded">Show More</router-link>
    </div>
    <div class="bg-1 min-h-[30vh]">
      <table class="w-full text-center">
        <!-- Table Header -->
        <thead class="bg-2">
          <tr class="text-gray-300 text-sm font-medium">
            <template v-for="(item, index) in headers" :key="index">
              <th class="my-td" :class="index === 0 ? 'text-start ps-8' : ''">
                {{ item }}
              </th>
            </template>
          </tr>
        </thead>

        <!-- Table Body -->
        <tbody class="divide-y divide-gray-600">
          <tr v-for="(item, index) in details?.assignments" :key="index">
            <td class="my-td-1st ps-8">{{ item.task }}</td>
            <td class="my-td">{{ getDate(item.createdAt) }}</td>
            <td class="my-td"> {{ getTime(item.createdAt) }}</td>
            <td class="my-td">
              <user-with-email :user="item.coach" />
            </td>
            <td class="my-td" v-html="printStatus(item.status)"></td>
          </tr>
        </tbody>
      </table>
    </div>

    
    <div class="mb-3 mx-1 flex justify-between items-center mt-14">
      <h2 class="text-2xl">Recent Private Lesson</h2>
      <router-link to="/lesson" class="btn-g py-1 px-2 rounded">Show More</router-link>
    </div>
    <div class="bg-1 min-h-[30vh]">
      <table class="w-full text-center">
        <!-- Table Header -->
        <thead class="bg-2">
          <tr class="text-gray-300 text-sm font-medium">
            <template v-for="(item, index) in headers" :key="index">
              <th class="my-td" :class="index === 0 ? 'text-start ps-8' : ''">
                {{ item }}
              </th>
            </template>
          </tr>
        </thead>

        <!-- Table Body -->
        <tbody class="divide-y divide-gray-600">
          <tr v-for="(item, index) in details?.lessons" :key="index">
            <td class="my-td-1st ps-8">{{ item.title }}</td>
            <td class="my-td">{{ getDate(item.createdAt) }}</td>
            <td class="my-td"> {{ getTime(item.createdAt) }}</td>
            <td class="my-td">
              <user-with-email :user="item.coach" />
            </td>
            <td class="my-td" v-html="printStatus(item.status)"></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import UserWithEmail from '@/components/UserWithEmail.vue';
export default {
  name: "CoachDetailsPage",
  components: { UserWithEmail },
  data() {
    return {
      headers: ["Task", "Date", "Time", "Athlete", 'type', "Status"],
      id: null,
      details: {},
    };
  },
  mounted() {
    this.id = this.$route.params.id;

    this.fetchData({
      customUrl: 'user/u', urlSuffix: this.id,
      callback: (data) => {
        this.details = data;
      }
    })


    this.$store.commit('setFilters', {
      coachId: this.id,
    });
  }
};
</script>