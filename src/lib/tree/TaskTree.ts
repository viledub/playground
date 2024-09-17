export type Task = {
    id: number,
    children: number[],
    dependencies: number[],
    priority: number,
    take?: Take
}
export type TaskStore = {
    topLevel: number[],
    nodes: TaskMap,
}
export interface TaskMap {
[key: number]: Task;
}

export enum Take {
    ONE,ALL,PROGRESS
}


/**
 * OPEN: Worth visiting, has viable children or viable itself
 * FILTERED: Never viable
 * DONE: Children all DONE or FILTERED and has been yielded itself - never viable
 * ITERATION_DONE: Chilren are ITERATION_COMPLETE or EMPTY and it has yielded
 * 
 * Secondary states based on these 4 primary states in collections:
 * EMPTY: No items in collection
 * OPEN: Something in the list is viable
 * COMPLETE: All items DONE and nothing ITERATION_DONE
 * ITERATION_COMPLETE: Nothing OPEN and at least one in ITERATION_DONE 
 */
export enum VisitState {
    OPEN, 
    ITERATION_DONE,
    ITERATION_CHILD_DONE,
}

export enum CollectionState {
    EMPTY,
    ITERATION_COMPLETE,
    ITERATION_CHILD_DONE,
    OPEN,
    FOUND,
}

type CacheEntry = {
    iterator: (treeIterator: TaskTreeIterator, items: number[]) => number,
    visitState: VisitState,
    visits: number,
    filtered: boolean,
}

const simpleOrder = (treeIterator: TaskTreeIterator, items: number[]): number => {
    const availableItems = treeIterator.getAvailable(items);
	const nextItem = availableItems[0];
	return nextItem;
}

function prioritised(treeIterator: TaskTreeIterator, items: number[]) {
    const availableItems = treeIterator.getAvailable(items);
	const totalPriority = availableItems.map(id=>treeIterator.readItem(id)).map(item=>item.priority).reduce((acc,curr)=>acc+curr, 0);
	let totalVisits = availableItems.map(treeIterator.getVisitCount).reduce((acc,curr)=>acc+curr, 0)
	const maxPossibleVisits = (Math.floor(totalVisits/availableItems.length)+1)*availableItems.length
	totalVisits = maxPossibleVisits;
	let bestScore = 0;
	let nextItem;
	for (const id of availableItems) {
		const item = treeIterator.readItem(id);
		const prioQuot = item.priority/totalPriority;
		const visitQuot = totalVisits === 0? 0 : treeIterator.getVisitCount(id)/totalVisits;
		const score = prioQuot - visitQuot;
		
		if ((bestScore === 0) || (score > bestScore)){
			bestScore = score;
			nextItem = item;
		}
	};
	
	if (nextItem) {
        treeIterator.visit(nextItem.id);
		return nextItem;
	}
}


export class TaskTreeIterator {
    visitCache = new Map<number, CacheEntry>();
    constructor(private taskStore: TaskStore) {
        this.setupCache();
    }

    private setupCache() {
        
        const worker = (parent: number, items: number[]) => {
            const algo = simpleOrder;
            const cacheEntry: CacheEntry = {
                iterator: algo,
                visitState: VisitState.OPEN,
                visits: 0,
                filtered: false,
            }
            this.visitCache.set(parent, cacheEntry);
            items.forEach(itemId => {
                worker(itemId, this.taskStore.nodes[itemId].children)
            });
        }
        const topLevel = this.taskStore.topLevel;
        worker(0, topLevel)
    }
    
    /**
     * Return the next child of the requested item
     * @param id Optionally, the id of the child to search, if not provided, top level assumed
     */
    nextChild(id?: number) {
        const searchItem = id ? id : 0;
        const childItems = searchItem === 0 ? this.taskStore.topLevel : this.taskStore.nodes[searchItem].children;
        return this.visitCache.get(searchItem)?.iterator(this, childItems);
    }

    setFiltered(id: number, value = true) {
        const entry = this.visitCache.get(id);
        if(entry) {
            console.log(id, value)
            entry.filtered = value;
        }
    }

    overTakeLimit(id: number) {
        const item = this.readItem(id);
        const children = item.children;
        if (item.take === Take.ONE) {
            const childrenDoneThisIteration = children.map(child => this.visitCache.get(child)).filter(cacheEntry => cacheEntry?.visitState === VisitState.ITERATION_DONE || cacheEntry?.visitState === VisitState.ITERATION_CHILD_DONE);
            // console.log(item.id, 'ONE', children, childrenDoneThisIteration.length)
            return childrenDoneThisIteration.length > 0;
        }
        return this.getAvailable(children).length === 0;
    }

    setIterationDone(id: number) {
        const entry = this.visitCache.get(id);
        if(entry) {
            entry.visitState = VisitState.ITERATION_DONE
        }
    }

    setIterationChildDone(id: number) {
        const entry = this.visitCache.get(id);
        if(entry) {
            entry.visitState = VisitState.ITERATION_CHILD_DONE
        }
    }

    visit(id: number) {
        const entry = this.visitCache.get(id);
        if(entry) {
            entry.visits++;
        }
    }

    getVisitCount(id: number) {
        const entry = this.visitCache.get(id);
        if(entry) {
            return entry.visits;
        }
        return 0;
    }

    /**
     * Empty (EMPTY)
     * Has remaining unvisited items (OPEN)
     * some in ITERATION_COMPLETE (ITERATION_COMPLETE)
     * Has no remaining unvisited items AND no open recurring items (COMPLETE)
     * 
     * some items in open
     * empty - nothing in it - probably include filtered only items in this
     * some items in iteration_child_done
     * some items in iteration_done
     * some items in done
     * @param items 
     * @returns 
     */
    evaluateItemStatus(id: number) {
        const items = this.readChildren(id);
        if(!items.length) {
            return CollectionState.EMPTY;
        }
        if(this.getAvailable(items).length>0){
            return CollectionState.OPEN;
        }
        if(this.someIterationChildDone(items)) {
            return CollectionState.ITERATION_CHILD_DONE;
        }
        return CollectionState.ITERATION_COMPLETE;
    
    }

    /**
     * Get items that are not done, iteration done or filtered.. so open
     * @param ids 
     */
    getAvailable(ids: number[]): number[] {
        // return ids.map(id=>this.visitCache.get(id)).filter(item=>item?.visitState===VisitState.OPEN)
        return ids.filter(id => this.visitCache.get(id)?.visitState === VisitState.OPEN)
    }

    /**
     * Items with visit count 0
     * @param ids 
     */
    getUnvisited(ids: number[]) {
        return ids.map(id=>this.visitCache.get(id)).filter(item=>item?.visits===0)
    }

    /**
     * Return an item for the provided id
     * @param id 
     */
    readItem(id: number) {
        return this.taskStore.nodes[id];
    }
    readItems(ids: number[]){
        return ids.map((id)=> this.taskStore.nodes[id]);
    }
    readChildren(id = 0) {
        if (id === 0) {
            return this.taskStore.topLevel;
        } else {
            return this.taskStore.nodes[id].children;
        }
    }

    /**
     * Some are iteration_done and the rest are either done or filtered
     * @param ids 
     */
    someIterationDone(ids: number[]): boolean {
        const items = ids.map(id=>this.visitCache.get(id));
        return items.some((item)=>(item?.visitState === VisitState.ITERATION_DONE));
    }
    someIterationChildDone(ids: number[]): boolean {
        const items = ids.map(id=>this.visitCache.get(id));
        return items.some((item)=>(item?.visitState === VisitState.ITERATION_CHILD_DONE));
    }

    /** 
     * Set all iteration_done items to open
     */
    nextIteration() {
        this.visitCache.forEach((cacheEntry) => {
            if(cacheEntry.visitState === VisitState.ITERATION_CHILD_DONE) {
                cacheEntry.visitState = VisitState.OPEN;
            }
        })
    }

    resetIterationChildDoneCounts(parentId=0) {
        const ids = this.readChildren(parentId);
        ids.forEach(id => {
            const item = this.visitCache.get(id);
            if(item?.visitState === VisitState.ITERATION_CHILD_DONE) {
                item.visitState = VisitState.OPEN;
            }
        })
    }
    resetIterationDoneCounts(parentId=0) {
        const ids = this.readChildren(parentId);
        ids.forEach(id => {
            const item = this.visitCache.get(id);
            if(item?.visitState === VisitState.ITERATION_DONE) {
                item.visitState = VisitState.OPEN;
            }
        })
    }
}