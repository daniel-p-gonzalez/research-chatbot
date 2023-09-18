import { iframeResizer } from 'iframe-resizer'
import { connectToChild, AsyncMethodReturns } from 'penpal';

import { ParentApi, ChildApi, FrameOptions, Size } from './api'

// TODO: figure out how to provide these vars to the script,
// maybe data attributes on the tag?
const Config: FrameOptions = {
    embedLocation: 'content-end',
    name: 'icon-embed',
    float: 'right',
    srcURL: 'http://localhost:3000/chat/embed/icon',
}


function openNewFrame(opts: FrameOptions) {
    const root = (opts.embedLocation == 'body') ? document.body  : document.querySelector<HTMLElement>(`[data-embed-location="${Config.embedLocation}"]`)
    if (!root) return

    new Embed(root, opts)
}


const apiMethods = (embed: Embed) => ({

    openNewFrame,

    onClose() {
        embed.destroy()
    },

} satisfies ParentApi)


type DragOffset = { x: number, y: number }

function applyPositioning(el: HTMLElement, size: Size, defaults: Size = {}) {
    for (const prop of ['left', 'right', 'top', 'bottom', 'width', 'height']) {
        const value = size[prop] || defaults[prop]
        if (value) {
            el.style[prop] = value
        }
    }
}

const DEFAULT_GRAB_WIDTH = `80px`

class DraggableResizer {
    container: HTMLDivElement
    iframe: HTMLIFrameElement
    grabDots: HTMLDivElement
    pointerOffset: DragOffset | false = false

    constructor(frame: HTMLIFrameElement, config: FrameOptions) {
        frame.style.width = frame.style.height = '100%'
        this.iframe = frame

        const wrapper = document.createElement('div')
        this.container = wrapper


        const grabber = document.createElement('div')
        grabber.style.cursor = 'grab'
        grabber.style.display = 'flex'
        grabber.style.justifyContent = 'flex-end'
        grabber.style.alignItems = 'center'
        grabber.style.position = 'absolute'
        grabber.style.background = 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjODg4Ij48L3JlY3Q+Cjwvc3ZnPg==")'
        grabber.style.borderBottomRightRadius = grabber.style.borderBottomLeftRadius = '23px'
        applyPositioning(grabber, config.dragGrabArea || {}, {
            height: '40px',
            width: DEFAULT_GRAB_WIDTH,
            left: `calc(50% - ${DEFAULT_GRAB_WIDTH}/2)`,
            right: `calc(50% + ${DEFAULT_GRAB_WIDTH}/2)`,
        })
        grabber.addEventListener('mousedown', (ev) => {
            if (ev.target === ev.currentTarget) {
                this.startDragging(ev)
            }
        })
        wrapper.appendChild(grabber)
        this.grabDots = grabber

        const blResizer = document.createElement('div')
        blResizer.style.background = 'transparent'
        blResizer.style.cursor = 'ne-resize'
        blResizer.style.height = blResizer.style.width = '5px'
        blResizer.style.bottom = blResizer.style.left = '0px';
        blResizer.style.position = 'absolute'
        blResizer.addEventListener('mousedown', (ev) => {
            if (ev.target === ev.currentTarget) {
                this.startResizing(ev)
            }
        })

        wrapper.appendChild(blResizer)

        wrapper.appendChild(this.iframe)
        wrapper.style.display = 'flex'
        wrapper.style.position = 'relative'
        wrapper.style.flexDirection = 'column'
        wrapper.style.position = 'absolute'

        wrapper.style.filter = 'drop-shadow(1px 1px 4px #000)'
    }

    onDragMove = (ev: MouseEvent) => {
        if (!this.pointerOffset) return
        const offsetX = this.pointerOffset.x - ev.clientX
        const offsetY = this.pointerOffset.y - ev.clientY

        this.container.style.top = (this.container.offsetTop - offsetY) + 'px'
        this.container.style.right = (
            (document.body.offsetWidth - (this.container.offsetLeft + this.container.offsetWidth)) + offsetX
        ) + 'px'

        this.recordPointerOffset(ev)
    }

    onResizeMove = (ev: MouseEvent) => {
        if (!this.pointerOffset) return
        const offsetX = this.pointerOffset.x - ev.clientX
        const offsetY = this.pointerOffset.y - ev.clientY

        this.container.style.height = (this.container.offsetHeight - offsetY) + 'px'
        this.container.style.width = (this.container.offsetWidth + offsetX) + 'px'

        this.recordPointerOffset(ev)
    }

    stopResizing = () => {
        document.body.removeEventListener('mousemove', this.onResizeMove)
        document.body.removeEventListener('mouseup', this.stopResizing)
        this.iframe.style.pointerEvents = 'auto'
    }

    startResizing(ev: MouseEvent) {
        this.recordPointerOffset(ev)
        document.body.addEventListener('mousemove', this.onResizeMove)
        document.body.addEventListener('mouseup', this.stopResizing)
        this.iframe.style.pointerEvents = 'none'

    }

    recordPointerOffset(ev: MouseEvent) {
        this.pointerOffset = {
            x: ev.clientX, y: ev.clientY,
        }
    }

    startDragging = (ev: MouseEvent) => {
        this.recordPointerOffset(ev)
        this.grabDots.style.cursor = 'grabbing'
        document.body.addEventListener('mousemove', this.onDragMove)
        document.body.addEventListener('mouseup', this.stopDragging)
    }

    stopDragging = () => {
        this.grabDots.style.cursor = 'grab'
        document.body.removeEventListener('mousemove', this.onDragMove)
        document.body.removeEventListener('mouseup', this.stopDragging)
    }

}



class Embed {
    container: HTMLIFrameElement | HTMLDivElement
    iframe: HTMLIFrameElement
    config: FrameOptions
    api?: AsyncMethodReturns<ChildApi>
    resizer?: DraggableResizer

    constructor(root: HTMLElement, config: FrameOptions) {
        let wrapper: HTMLIFrameElement | HTMLDivElement = document.createElement('iframe')
        this.config = config
        this.iframe = wrapper as HTMLIFrameElement

        wrapper.setAttribute('name', config.name)
        wrapper.setAttribute('src', config.srcURL)
        wrapper.style.border = '0px'

        if (config.float) {
            wrapper.style.float = config.float
        }
        if (config.fitContent !== false) {
            iframeResizer({ checkOrigin: false, sizeWidth: true, log: false }, wrapper)
            // set initial size small so the resizer will expand
            wrapper.style.height = wrapper.style.width = '10px'
        }

        connectToChild<ChildApi>({
            iframe: wrapper as HTMLIFrameElement,
            methods: apiMethods(this),
        }).promise.then((api) => {
            this.api = api
            api.setBookContext({
                orn: '123:123',
                title: 'Micro and Macro economics',
                subject: 'economics',
            })
        })


        if (config.isResizable || config.isDraggable) {
            this.resizer = new DraggableResizer(this.iframe, config)
            // switch wrapper to be the resizer container
            wrapper = this.resizer.container
        }

        if (config.position) {
            for (const [key, value] of Object.entries(config.position)) {
                wrapper.style[key as any] = value
            }
        }

        this.container = wrapper
        root.appendChild(wrapper)
    }


    destroy = () => {
        this.container.remove()
    }

}

// TODO: also handle history pop/push events
function whenDomReady(fn: () => void): void {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(fn, 1)
    } else {
        document.addEventListener('DOMContentLoaded', fn)
    }
}

whenDomReady(() => setTimeout(() => {
    openNewFrame(Config)
}, 200))
