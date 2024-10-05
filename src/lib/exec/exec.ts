import type { TaskItem, TreeStore } from "$lib/mactree/mactree";


class ExecRecord {
    // execution state?
    constructor(public item: TaskItem) {

    }
    
}

type GraphType = {
    [key: number]: ExecRecord,
}
export class ExecGraph {
    graph: GraphType;
    constructor(treeStore: TreeStore){
        this.graph = {};
        treeStore.topLevel.forEach(item => {
            this.graph[item] = new ExecRecord(treeStore.nodes[item])
        })
    }
}