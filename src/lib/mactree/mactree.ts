
export enum Take {
    One,
    All,
    Progress
}

export type TaskItem = {
    id: number,
    priority: number,
    name: string,
    children: number[],
    dependencies: number[],
    recurring: boolean,
    recurringLimit: Take
}
export type NodeMap = {
    [key: number]: TaskItem
}
export type TreeStore = {
    topLevel: number[],
    nodes: NodeMap
}
type CacheEntry = {
    visits: number,
    iterator: x,
    filtered: boolean,
    done: boolean,
    iterationComplete: boolean,
}
export class TreeState {
    constructor(private store: TreeStore){
        this.visitCache = new Map<number,CacheEntry>();
        
    }

    nextChild(parentId=null) {
        const lookup = parentId === null ? 0: parentId;

    }
}