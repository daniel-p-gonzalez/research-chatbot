export interface OptionsI {
    json?: any
    body?: string
    method: string
    credentials?: 'include'
}

export type RequestStandardReply<T = Record<string, any>> = {
    success: false
    message: string
    error?: string
    errors?: { [key: string]: string }
    data?: T
} | {
    success: true
    message: string
    error?: string
    errors?: { [key: string]: string }
    data: T
}

export async function Request<ReplyT = RequestStandardReply>(
    url: string, options: OptionsI = { method: 'GET' },
): Promise<ReplyT> {

    try {
        if (options.json) {
            options.body = JSON.stringify(options.json)
            delete options.json
        }
        const response = await fetch(url, {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
            },
            ...options,
        })
        let json: any
        try {
            json = await response.clone().json()
        }
        catch {
            return {
                success: false,
                error: `${response.status} ${response.statusText}`,
                message: response.statusText,
            } as any as ReplyT
        }
        return json as ReplyT
    } catch (error: any) {
        return {
            success: false,
            error,
            message: error.toString(),
        } as any as ReplyT
    }
}
