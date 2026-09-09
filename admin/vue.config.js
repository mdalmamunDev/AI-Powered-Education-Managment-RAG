const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    allowedHosts: "all", // or add your specific domain
    // allowedHosts: ['athlete-admin-mamun.sarv.live'],
  }
})
