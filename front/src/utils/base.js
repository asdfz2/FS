import { apiBase } from './api-base';

const base = {
  get() {
    return {
      url: `${apiBase}/api/`,
      name: 'api',
      indexUrl: `${window.location.origin}${window.location.pathname}#/index`
    }
  },
  getProjectName() {
    return {
      projectName: '校园周边美食分享平台'
    }
  }
}

export default base
