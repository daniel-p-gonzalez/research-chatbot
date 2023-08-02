import { Link } from '../../renderer/Link'
import { Chat } from '../chat/index.page'

export { Page }

function Page() {
  return (
    <>
      <h1>Welcome</h1>

      You're probably looking for the <Link href="/chat">chat</Link>.

    </>
  )
}
