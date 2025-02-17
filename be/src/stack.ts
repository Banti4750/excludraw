export class Stack<T> {
    private items: T[] = [];

    // Push an element onto the stack
    push(item: T): void {
        this.items.push(item);
    }

    // Pop an element from the stack
    pop(): T | undefined {
        return this.items.pop();
    }

    // Peek at the top element without removing it
    peek(): T | undefined {
        return this.items[this.items.length - 1];
    }

    // Check if the stack is empty
    isEmpty(): boolean {
        return this.items.length === 0;
    }

    // Get the size of the stack
    size(): number {
        return this.items.length;
    }
}

// Usage example
const stack = new Stack<number>();

stack.push(10);
stack.push(20);
console.log(stack.peek()); // 20
console.log(stack.pop()); // 20
console.log(stack.isEmpty()); // false
console.log(stack.size()); // 1
