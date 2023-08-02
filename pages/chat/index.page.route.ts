import type { PageContextServer } from '../../renderer/types'

export default (pageContext: PageContextServer) => {

  if (!pageContext.urlPathname.startsWith('/chat')) return false

  const id = pageContext.urlPathname.split('/')[2]

  return {
    // Make `id` available as pageContext.routeParams.id
    routeParams: { id: id || '' }
  }
}
