import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CategoryItem } from '../models/history-shared.models';
import { roundToCents } from '../utils/normalization.utils';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly incomeCategoriesSubject = new BehaviorSubject<CategoryItem[]>([]);
  private readonly expenseCategoriesSubject = new BehaviorSubject<CategoryItem[]>([]);

  incomeCategories$ = this.incomeCategoriesSubject.asObservable();
  expenseCategories$ = this.expenseCategoriesSubject.asObservable();

  setCategories(type: 'plus' | 'minus', categories: CategoryItem[]): void {
    const normalized = this.normalizeCategories(categories);
    if (type === 'plus') {
      this.incomeCategoriesSubject.next(normalized);
      return;
    }
    this.expenseCategoriesSubject.next(normalized);
  }

  getCategories(type: 'plus' | 'minus'): CategoryItem[] {
    return type === 'plus' ? this.incomeCategoriesSubject.value : this.expenseCategoriesSubject.value;
  }

  addCategory(type: 'plus' | 'minus', categoryName: string, icon = '📁'): boolean {
    const normalized = categoryName.trim();
    if (!normalized) {
      return false;
    }

    const list = this.getCategories(type);
    if (list.some((item) => item.name.toLowerCase() === normalized.toLowerCase())) {
      return false;
    }

    this.setCategories(type, [...list, { name: normalized, amount: 0, icon }]);
    return true;
  }

  renameCategory(type: 'plus' | 'minus', oldName: string, newName: string): boolean {
    const normalized = newName.trim();
    if (!normalized || oldName === normalized) {
      return false;
    }

    const list = this.getCategories(type);
    const oldLower = oldName.toLowerCase();
    if (!list.some((item) => item.name.toLowerCase() === oldLower)) {
      return false;
    }
    if (list.some((item) => item.name.toLowerCase() === normalized.toLowerCase())) {
      return false;
    }

    const nextList = list.map((item) => (item.name.toLowerCase() === oldLower ? { ...item, name: normalized } : item));
    this.setCategories(type, nextList);
    return true;
  }

  deleteCategory(type: 'plus' | 'minus', categoryName: string): boolean {
    const targetLower = categoryName.toLowerCase();
    const list = this.getCategories(type);
    const nextList = list.filter((item) => item.name.toLowerCase() !== targetLower);
    if (nextList.length === list.length) {
      return false;
    }

    this.setCategories(type, nextList);
    return true;
  }

  swapCategories(type: 'plus' | 'minus', firstIndex: number, secondIndex: number): boolean {
    if (firstIndex === secondIndex) {
      return false;
    }

    const list = this.getCategories(type);
    if (firstIndex < 0 || secondIndex < 0 || firstIndex >= list.length || secondIndex >= list.length) {
      return false;
    }

    const nextList = [...list];
    [nextList[firstIndex], nextList[secondIndex]] = [nextList[secondIndex], nextList[firstIndex]];
    this.setCategories(type, nextList);
    return true;
  }

  adjustCategoryAmount(type: 'plus' | 'minus', categoryName: string, delta: number): void {
    const targetLower = categoryName.toLowerCase();
    const list = this.getCategories(type);
    const nextList = list.map((item) => {
      if (item.name.toLowerCase() !== targetLower) {
        return item;
      }

      const nextAmount = Math.max(0, item.amount + delta);
      return { ...item, amount: roundToCents(nextAmount) };
    });

    this.setCategories(type, nextList);
  }

  private normalizeCategories(categories: CategoryItem[]): CategoryItem[] {
    return categories.map((item) => ({
      name: item.name,
      amount: Number.isFinite(item.amount) ? roundToCents(item.amount) : 0,
      icon: item.icon || '📁'
    }));
  }
}
