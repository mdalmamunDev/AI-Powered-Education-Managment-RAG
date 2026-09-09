<template>
	<div class="flex justify-center items-center gap-2">
		<img class="w-8 h-8 object-cover rounded-full" :src="showImg(user?.profileImage)" alt="Profile">
		<div class="text-start">
			<h4 class="text-sm">{{ user?.name || 'N/A' }}</h4>
			<p class="text-[#FEFEFE] text-xs">{{ user?.email || 'N/A' }}</p>
		</div>
	</div>
</template>

<script>

export default {
	name: "UserWithEmail",
	props: {
		user: Object
	}
}
</script>