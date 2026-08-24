const base = {
  get() {
    return {
      url: 'http://localhost:8080/api/',
      name: 'api',
      indexUrl: 'http://localhost:8081/#/index'
    }
  },
  getProjectName() {
    return {
      projectName: '校园周边美食分享平台'
    }
  }
}

export default base
