"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stack = void 0;
class Stack {
    constructor() {
        this.items = [];
    }
    // Push an element onto the stack
    push(item) {
        this.items.push(item);
    }
    // Pop an element from the stack
    pop() {
        return this.items.pop();
    }
    // Peek at the top element without removing it
    peek() {
        return this.items[this.items.length - 1];
    }
    // Check if the stack is empty
    isEmpty() {
        return this.items.length === 0;
    }
    // Get the size of the stack
    size() {
        return this.items.length;
    }
}
exports.Stack = Stack;
// Usage example
const stack = new Stack();
stack.push(10);
stack.push(20);
console.log(stack.peek()); // 20
console.log(stack.pop()); // 20
console.log(stack.isEmpty()); // false
console.log(stack.size()); // 1
