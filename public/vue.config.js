/* live */
const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: [
    'vuetify',

  ],
  productionSourceMap: false,
  lintOnSave:false,
  configureWebpack: {
    resolve: {
      fullySpecified: false, // 🔧 Fix for ESM packages like Amplify 5
    },
  },

})
/* dev */
// const { defineConfig } = require('@vue/cli-service')
// module.exports = defineConfig({
//   transpileDependencies: [
//     'vuetify',

//   ],
//   productionSourceMap: false,
//   publicPath: process.env.NODE_ENV == "production" ? "/STICHHPORTAL/" : "",

// })
