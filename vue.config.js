module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/' : '/',
  devServer: {
    host: 'localhost.socyno.org',
    port: 2020,
    proxy: {
      '/webfwk/': {
        target: 'http://localhost.socyno.org:8080',
        ws: true
      }
    }
  },
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'scss',
      patterns: ['./src/styles/common.scss']
    }
  },
  chainWebpack: config => {
    config.plugin('define').tap(definitions => {
      Object.assign(definitions[0]['process.env'], {
        BASE_APIURL: '"/webfwk/api/"'
      })
      return definitions
    })
  }
}
