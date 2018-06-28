import { Stream } from 'xstream'

const getHeadNodes = (): string[] => {
  let nodeList = [];
  const headChildren = document.head.children
  for(let i = 0; i < headChildren.length; i++) {
    nodeList.push(headChildren[i].outerHTML)
  }

  return nodeList || []
}

const setHeadNodes = (nodes: string[]): void => {
  const stringNodes = nodes.join('')
  document.head.innerHTML = stringNodes
}

const removeListFromList = (source: string[], rem: string[]) => {
  return source.filter( (curr) => !rem.includes(curr))
}

let addedHead: string[] = []

const seoDriver = (seo$: Stream<string[]>): void => {
  seo$.addListener({
    next: add => {
      const currentHead = getHeadNodes()
      const cleanHead = removeListFromList(
        currentHead,
        addedHead,
      )
      addedHead = add
      const nextHead = cleanHead.concat(add)
      setHeadNodes(nextHead)
    }
  })
}

export default seoDriver
