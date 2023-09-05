import { compactDecrypt, compactVerify, importSPKI } from 'jose'
import type { User } from '#lib/types'

import { ssoCookieConfig } from './config'


export async function getUserFromCookie(cookies: Record<string, string>) {
    const cookie = await ssoCookieConfig()

    const value = cookies[cookie.name]
    if (!value) throw new Error(`No cookie value found for ${cookie.name}`)

    const { plaintext } = await compactDecrypt(value,
        Buffer.from(cookie.private_key),
        { contentEncryptionAlgorithms: ['A256GCM'], keyManagementAlgorithms: ['dir'] },
    )
    const { payload } = await compactVerify(
        plaintext,
        await importSPKI(cookie.public_key, 'RS256'),
        { algorithms: ['RS256'] },
    )
    return JSON.parse(payload.toString()) as User
}
