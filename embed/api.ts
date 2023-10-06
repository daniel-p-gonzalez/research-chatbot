

export type Size = {
    left?: string
    right?: string
    top?: string
    bottom?: string
    width?: string
    height?: string
}

export type Position = {
  position?: 'absolute' | 'relative'
}

// options used to implement a frame
export type FrameOptions = {
    id: string
    embedLocation: string
    srcURL: string
    fitContent?: boolean
    float?: 'right' | false // TODO: implement left
    isResizable?: boolean
    isDraggable?: boolean
    dragGrabArea?: Size
    position?: Position & Size
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

// These methods implemented on the content inside the frame
export type ChildApi = {
    // is called as soon as the iframe is loaded
    setBookContext(context: BookContext): void
}
