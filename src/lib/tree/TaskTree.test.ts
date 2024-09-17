import { expect, test } from "vitest"

import { CollectionState, Take, TaskTreeIterator } from "./TaskTree"
import type { Task, TaskMap, TaskStore } from "./TaskTree"

/**
 * 1
 *   2
 *     3
 *     11
 *   4
 *     8
 *       9
 *   10
 * 5
 *   6
 *     7
 */

  const taskMap: TaskMap = {
    1: {id: 1, children: [2, 4, 10], dependencies: [], priority: 100 },
    2: {id: 2, children: [3,11], dependencies: [], priority: 5, take: Take.ONE},
    3: {id: 3, children: [], dependencies: [10], priority: 1},
    4: {id: 4, children: [8], dependencies: [], priority: 1},
    5: {id: 5, children: [6], dependencies: [], priority: 1},
    6: {id: 6, children: [7], dependencies: [], priority: 1},
    7: {id: 7, children: [], dependencies: [], priority: 1},
    8: {id: 8, children: [9], dependencies: [], priority: 1},
    9: {id: 9, children: [], dependencies: [], priority: 1},
    10: {id: 10, children: [], dependencies: [], priority: 8},
    11: {id: 11, children: [], dependencies: [], priority: 1}
}
const taskStore = {
	topLevel: [1,5], 
	nodes: taskMap
}

function prSt(state: CollectionState){
    switch (state) {
        case CollectionState.EMPTY:
            return "Empty";
            break;
        case CollectionState.COMPLETE:
            return "Complete";
            break;
        case CollectionState.ITERATION_COMPLETE:
            return "ITERATION_COMPLETE" 
            break;
        case CollectionState.OPEN:
            return "OPEN" 
            break;
        case CollectionState.FOUND:
            return "FOUND" 
            break;
        case CollectionState.ITERATION_CHILD_DONE:
            return "ITERATION_CHILD_DONE" 
            break;
        default:
            throw new Error(`Unhandled state: ${state}`);
    }
}

const dig = (taskTreeIterator: TaskTreeIterator, auto = true) => {
    const t = taskTreeIterator;
    const foundItems: number[] = [];

    const checkFilters = (providedFilter: (queryItem: Task)=>boolean, parentId = 0) => {
		// const items = parentId === 0 ? topLevelIds : itemMap[parentId].children;
        const items = t.readChildren(parentId)
		let somethingPassed = false;
		items.map(id => t.readItem(id)).forEach((item) => {
			const aDescendentPassed = checkFilters(providedFilter, item.id)
			const currentItemPassed = providedFilter(item);
			t.setFiltered(item.id, !currentItemPassed) ;
			if(currentItemPassed || aDescendentPassed) {
				somethingPassed = true;
			}
		})
		return somethingPassed; // false when no unfiltered descendent exists
	}


    const worker = (parentId = 0) => {
        let item = t.nextChild(parentId)
        // console.log('next child', parentId, item)
        if(!item){
            const eval_status = t.evaluateItemStatus(parentId);
            if(!auto && parentId === 0) {
                return eval_status;
            }
            if (eval_status === CollectionState.ITERATION_CHILD_DONE) {
                t.resetIterationChildDoneCounts(parentId);
                t.resetIterationDoneCounts(parentId);
                item = t.nextChild(parentId);
            } else if (eval_status === CollectionState.ITERATION_COMPLETE) {
                t.resetIterationDoneCounts(parentId);
                item = t.nextChild(parentId);
            } else {
                return eval_status;
            }
        }
		const status = worker(item);
        
        
        console.log(item, prSt(status))

		if(status === CollectionState.EMPTY) {
            t.setIterationDone(item);
            foundItems.push(item)
            return CollectionState.FOUND;
		}
		if(status === CollectionState.FOUND) {
            console.log(item, 'over take?', t.overTakeLimit(item))
            if(t.overTakeLimit(item)) {
                t.setIterationChildDone(item);
                return CollectionState.ITERATION_CHILD_DONE
            } else {
                return CollectionState.OPEN
            }
		}
		if(status === CollectionState.ITERATION_CHILD_DONE) {
            if(t.overTakeLimit(item)) {
                t.setIterationChildDone(item);
                return CollectionState.ITERATION_CHILD_DONE
            } else {
                return CollectionState.OPEN
            }
		}
        return CollectionState.OPEN;
	}
    // checkFilters((queryItem: Task) => queryItem.id!==100)
    worker()
    worker()
    worker()
    worker()
    worker()
    worker()
    worker()
    worker()
    worker()
    worker()
    worker()
    
   
    
    return foundItems;
}


test('test', ()=>{
    const taskTreeIterator = new TaskTreeIterator(taskStore);
    expect(taskTreeIterator.nextChild()).toBe(1);
    taskTreeIterator.visit(1);
    expect(taskTreeIterator.nextChild(1)).toBe(2);
    expect(taskTreeIterator.nextChild(2)).toBe(3);
})

test('test', ()=>{
    const t = new TaskTreeIterator(taskStore);
    const d = dig(t)
    expect(d).toEqual([3, 9, 10, 7, 11, 9, 10, 7, 3, 9, 10]);
})
test('test non auto', ()=>{
    const t = new TaskTreeIterator(taskStore);
    let d = dig(t, false)
    expect(d).toEqual([3, 9, 10, 7]);
    t.resetIterationChildDoneCounts();
    t.resetIterationDoneCounts();
    d = dig(t, false)
    expect(d).toEqual([11, 9, 10, 7]);
    t.resetIterationChildDoneCounts();
    t.resetIterationDoneCounts();
    d = dig(t, false)
    expect(d).toEqual([3, 9, 10, 7]);
})