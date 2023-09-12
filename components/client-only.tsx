import React, { useEffect, useState } from 'react'

export function ClientOnly({ children }: { children: React.ReactNode }) {
    const [render, setRender] = useState(false)
    useEffect(() => {
        setRender(true)
    }, [])

    return render ? children : <></>

}
