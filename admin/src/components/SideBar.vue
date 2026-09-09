<template>
  <div class="w-[260px] max-h-full overflow-auto hide-scrollbar bg-g rounded-md flex flex-col">
    <!-- Logo -->
    <div class="px-5 py-10 border-b border-theme">
      <img src="images/logo.png" alt="">
    </div>

    <!-- Navigation -->
    <nav class="px-4 py-6 pt-10 space-y-2">
      <template v-for="(item, index) in sidebarItems" :key="index">
        <!-- If item has children -->
        <div v-if="item.children" class="space-y-1">
          <div class="sidebar-item rounded-lg px-4 py-3 flex items-center justify-between cursor-pointer"
            @click="toggleMenu(index)">
            <div class="flex items-center space-x-3">
              <img :src="`/icons/side-bar/${item.icon}.svg`" alt="">
              <span class="">{{ item.label }}</span>
            </div>
            <span class="text-gray-400 text-xs">
              <i :class="openIndex === index ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
            </span>
          </div>

          <div v-show="openIndex === index" class="pl-6 space-y-2 transition-all duration-200">
            <router-link v-for="(child, cIndex) in item.children" :key="cIndex" :to="child.path"
              class="sidebar-item rounded-lg px-3 py-2 flex items-center space-x-3 cursor-pointer text-sm"
              :class="$route.path === child.path ? 'btn-g' : ''">
              <img :src="`/icons/side-bar/${child.icon}.svg`" alt="">
              <span class="">{{ child.label }}</span>
            </router-link>
          </div>
        </div>

        <!-- If item has no children -->
        <router-link v-else :to="item.path"
          class="sidebar-item rounded-lg px-4 py-3 flex items-center space-x-3 cursor-pointer"
          :class="$route.path.includes(item.path) ? 'btn-g' : ''">
          <img :src="`/icons/side-bar/${item.icon}.svg`" alt="">
          <span class="">{{ item.label }}</span>
        </router-link>
      </template>
    </nav>

    <!-- Logout -->
    <div class="p-4 mt-10">
      <div @click="showAlert"
        class="bg-2 rounded-lg px-4 py-3 flex items-center space-x-3 cursor-pointer logout-item transition-colors">
        <img src="/icons/side-bar/log-out.svg" />
        <span class="text-red-500">Log Out</span>
      </div>
    </div>
  </div>
</template>

<script>
import Swal from 'sweetalert2';

export default {
  name: 'SideBar',
  data() {
    return {
      openIndex: null,
      sidebarItems: [
        { label: "Dashboard", path: "/dashboard", icon: "dashboard" },
        {
          label: "Academics", icon: "session-management", children: [
            { label: "Departments", path: "/departments", icon: "coach" },
            { label: "Semesters", path: "/semesters", icon: "statistics" },
          ]
        },
        {
          label: "People", icon: "coach", children: [
            { label: "Teachers", path: "/teachers", icon: "coach" },
            { label: "Students", path: "/students", icon: "athlete" },
            { label: "Guardians", path: "/guardians", icon: "scores" },
            { label: "Student Guardians", path: "/student-guardians", icon: "after-school-program" },
          ]
        },
        {
          label: "Academic", icon: "assignment-list", children: [
            { label: "Courses", path: "/courses", icon: "league" },
            { label: "Enrollments", path: "/enrollments", icon: "manage-teams" },
            { label: "Attendance", path: "/attendances", icon: "scores" },
            { label: "Grades", path: "/grades", icon: "scores" },
            { label: "Assignments", path: "/assignments", icon: "assignment-list" },
            { label: "Submissions", path: "/submissions", icon: "assignment-list" },
            { label: "Exams", path: "/exams", icon: "statistics" },
          ]
        },
        {
          label: "Administration", icon: "settings", children: [
            { label: "Classrooms", path: "/classrooms", icon: "announcements" },
            { label: "Schedules", path: "/schedules", icon: "schedules" },
            { label: "Payments", path: "/payments", icon: "reports" },
            { label: "Office Hours", path: "/office-hours", icon: "session-management" },
            { label: "Advisement", path: "/advisements", icon: "permissions" },
          ]
        },
        {
          label: "Library", icon: "reports", children: [
            { label: "Library Books", path: "/library-books", icon: "reports" },
            { label: "Book Loans", path: "/book-loans", icon: "manage-teams" },
          ]
        },
        {
          label: "Settings", icon: "settings", children: [
            { label: "Profile", path: "/profile", icon: "coach" },
            { label: "Change Password", path: "/change-password", icon: "session-management" },
          ]
        },
      ],
    };
  },
  methods: {
    toggleMenu(index) {
      this.openIndex = this.openIndex === index ? null : index;
    },
    showAlert() {
      Swal.fire({
        title: 'Do you want to Logout?',
        text: 'You won’t be able to revert this!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Cancel',
        cancelButtonText: 'Logout',
      }).then((result) => {
        if (!result.isConfirmed) {
          localStorage.removeItem('token');
          this.$store.commit('setAuth', null);
          this.$router.push('/auth/login');
        }
      });
    }
  },
}
</script>

<style scoped>
.sidebar-item:hover {
  background-color: rgba(59, 130, 246, 0.08);
  border-left: 3px solid var(--accent);
}

.logout-item:hover {
  background-color: var(--hover) !important;
}
</style>