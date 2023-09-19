

export type Size = {
    left?: string
    right?: string
    top?: string
    bottom?: string
    width?: string
    height?: string
}


export type FrameOptions = {
    embedLocation: string
    name: string
    srcURL: string
    fitContent?: boolean
    float?: 'left' | 'right' | false
    isResizable?: boolean
    isDraggable?: boolean
    dragGrabArea?: Size
    position?: Size
}


// child content calls these methods on the parent
export type ParentApi = {
    openNewFrame(opts: FrameOptions): void
    onClose(): void
}

export type BookContext = {
    orn: string  // book:page uuid
    title: string
    subject: string
}


export type ChildApi = {
    // is called as soon as the iframe is loaded
    setBookContext(context: BookContext): void
}
