import { Injectable } from '@angular/core';
import { Todo } from '../models/todo.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private storageKey = 'todos';

  constructor() {}

  getTodos(): Todo[] {
    const todoJson = localStorage.getItem(this.storageKey);

    if (todoJson) {
      const todos = JSON.parse(todoJson);
      return todos.map((todo: any) => ({
        ...todo,
        date: new Date(todo.date),
      }));
    }

    return [];
  }

  getTodoById(id: string): Todo | undefined {
    const todos = this.getTodos();
    return todos.find((t) => t.id == id);
  }

  addTodo(todo: Todo): void {
    const todos = this.getTodos();
    todo.id = uuidv4();
    todos.push(todo);
    this.setTodos(todos);
  }

  updateTodo(todo: Todo): void {
    const todos = this.getTodos();
    const index = todos.findIndex((t) => t.id === todo.id);

    if (index > -1) {
      todos[index] = todo;
      this.setTodos(todos);
    }
  }

  deleteTodo(id: string) {
    let todos = this.getTodos();
    todos = todos.filter((t) => t.id !== id);
    this.setTodos(todos);
  }

  clearTodos(): void {
    localStorage.removeItem(this.storageKey);
  }

  private setTodos(todos: Todo[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(todos));
  }
}
