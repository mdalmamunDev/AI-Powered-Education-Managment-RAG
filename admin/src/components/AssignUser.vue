<template>
  <div class="relative flex gap-3 items-center justify-center">
    <!-- Button -->
    <div @click="toggleMenu" class="cursor-pointer">
      <user-with-email v-if="user?._id" :user="user" />
      <div v-else class="flex justify-center items-center gap-2">
        <div class="h-8 w-8 btn-g rounded-full text-xl flex items-center justify-center">
          <i class="fa fa-plus"></i>
        </div>
        <span class="text-sm">{{ label }}</span>
      </div>
    </div>


    <!-- Dropdown -->
    <div v-if="showMenu"
      class="absolute top-10 left-0 w-56 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50" :class="dropDownBg">
      <form @submit.prevent="getUsers">
        <input v-model="keyword" type="search" placeholder="Search here" class="rounded p-2 border" :class="dropDownBg">
      </form>
      <div class="min-h-48 max-h-96 overflow-y-auto hide-scrollbar">
        <div v-if="showDelete" @click="selectUser({id: null})"
          class="px-4 py-2 text-sm  hover:bg-gray-700 cursor-pointer text-start text-red-600">
          Remove
        </div>
        <user-with-email v-for="(user, index) in userList" :key="index" @click="selectUser(user)"
          class="px-4 py-2 text-sm  hover:bg-gray-700 cursor-pointer" style="justify-content: start;" :user="user" />
      </div>
    </div>
  </div>
</template>

<script>
import UserWithEmail from './UserWithEmail.vue';

export default {
  name: "AssignUser",
  components: { UserWithEmail },
  props: {
    user: Object,
    label: {
      type: String,
      default: "Add"
    },
    dropDownBg: {
      type: String,
      default: "bg-2"
    },
    submitUrl: {
      type: String,
      default: ''
    },
    fetchUrl: {
      type: String,
      default: ''
    },
    field: {
      type: String,
    },
    showDelete: {
      type: Boolean,
      default: true
    },
  },
  data() {
    return {
      showMenu: false,
      userList: [],
      keyword: '',
    };
  },
  methods: {
    toggleMenu() {
      this.showMenu = !this.showMenu;
      if (this.showMenu) this.getUsers();
    },
    selectUser(user) {
      console.log(user);
      
      this.showMenu = false;
      
      if(!this.submitUrl) {
        this.$emit('change', user);
        return;
      }

      if (!this.field) {
        this.showToast('Please provide filed', 'error')
        return;
      }
      this.httpReq({
        customUrl: this.submitUrl,
        method: 'put',
        data: {
          [this.field]: user._id || null
        },
        callback: () => {
          this.fetchData();
          this.showMenu = false;
        }
      })
    },
    getUsers() {
      this.httpReq({
        customUrl: `${this.fetchUrl}&keyword=${this.keyword}`,
        method: 'get',
        callback: (data) => {
          this.userList = data;
        }
      })

    }
  }
};
</script>
