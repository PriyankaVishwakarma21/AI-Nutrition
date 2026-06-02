import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, switchMap, of } from 'rxjs';
import { NutritionService } from '../../services/nutrition.service';
import { FoodEntry, FoodItem, MealType, NutritionLog, Unit } from '../../models/nutrition.model';

@Component({
  selector: 'app-food-log',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './food-log.component.html'
})
export class FoodLogComponent implements OnInit {
  private svc = inject(NutritionService);

  todayLog    = signal<NutritionLog | null>(null);
  searchResults = signal<FoodItem[]>([]);
  loading     = signal(true);
  adding      = signal(false);
  waterLoading= signal(false);

  searchQuery  = '';
  waterAmount  = 0;
  selectedFood : FoodItem | null = null;
  quantity     = 1;
  unit: Unit   = 'serving';
  mealType: MealType = 'breakfast';

  private search$ = new Subject<string>();

  mealTypes: MealType[] = ['breakfast','lunch','dinner','snack'];
  units: Unit[]         = ['serving','g','ml','oz','cup','tbsp','tsp','piece'];

  ngOnInit(): void {
    this.svc.getTodayLog().subscribe({
      next: r => { this.todayLog.set(r.log); this.loading.set(false); },
      error: () => this.loading.set(false)
    });

    this.search$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => q.length >= 2 ? this.svc.searchFoodItems(q) : of({ success:true, items:[] }))
    ).subscribe(r => this.searchResults.set(r.items));
  }

  onSearch(): void { this.search$.next(this.searchQuery); }

  selectFood(item: FoodItem): void {
    this.selectedFood = item;
    this.searchQuery  = item.name;
    this.searchResults.set([]);
  }

  addEntry(): void {
    if (!this.selectedFood) return;
    this.adding.set(true);
    this.svc.addFoodEntry({
      foodItem: this.selectedFood,
      quantity: this.quantity,
      unit: this.unit,
      mealType: this.mealType
    }).subscribe({
      next: r => {
        this.todayLog.set(r.log);
        this.resetForm();
        this.adding.set(false);
      },
      error: () => this.adding.set(false)
    });
  }

  removeEntry(entryId: string): void {
    const logId = this.todayLog()?._id;
    if (!logId) return;
    this.svc.removeFoodEntry(logId, entryId).subscribe(r => this.todayLog.set(r.log));
  }

  saveWater(): void {
    this.waterLoading.set(true);
    this.svc.updateWaterIntake(this.waterAmount).subscribe({
      next: r => { this.todayLog.set(r.log); this.waterLoading.set(false); },
      error: () => this.waterLoading.set(false)
    });
  }

  private resetForm(): void {
    this.searchQuery  = '';
    this.selectedFood = null;
    this.quantity     = 1;
    this.unit         = 'serving';
    this.searchResults.set([]);
  }

  entriesForMeal(meal: string) {
    return this.todayLog()?.foodEntries.filter(e => e.mealType === meal) || [];
  }
  mealCalories(meal: string): number {
    return this.entriesForMeal(meal).reduce((s,e) => s + e.foodItem.calories * e.quantity, 0);
  }
  mealIcon(meal: string): string {
    return { breakfast:'🍳', lunch:'🥗', dinner:'🍽️', snack:'🍎' }[meal] || '🍴';
  }
}
