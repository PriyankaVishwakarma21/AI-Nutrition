import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { FoodEntry, FoodItem, NutritionLog, WeeklySummary } from '../models/nutrition.model';

@Injectable({ providedIn: 'root' })
export class NutritionService {
  private readonly API = `${environment.apiUrl}/nutrition`;

  constructor(private http: HttpClient) {}

  getTodayLog(): Observable<{ success: boolean; log: NutritionLog }> {
    return this.http.get<{ success: boolean; log: NutritionLog }>(`${this.API}/today`);
  }

  getLogsByDateRange(start: string, end: string): Observable<{ success: boolean; logs: NutritionLog[] }> {
    const params = new HttpParams().set('startDate', start).set('endDate', end);
    return this.http.get<{ success: boolean; logs: NutritionLog[] }>(`${this.API}/logs`, { params });
  }

  getWeeklySummary(): Observable<{ success: boolean; summary: WeeklySummary }> {
    return this.http.get<{ success: boolean; summary: WeeklySummary }>(`${this.API}/weekly-summary`);
  }

  addFoodEntry(entry: Partial<FoodEntry>): Observable<{ success: boolean; log: NutritionLog }> {
    return this.http.post<{ success: boolean; log: NutritionLog }>(`${this.API}/log/entry`, entry);
  }

  removeFoodEntry(logId: string, entryId: string): Observable<{ success: boolean; log: NutritionLog }> {
    return this.http.delete<{ success: boolean; log: NutritionLog }>(`${this.API}/log/${logId}/entry/${entryId}`);
  }

  updateWaterIntake(amount: number): Observable<{ success: boolean; log: NutritionLog }> {
    return this.http.patch<{ success: boolean; log: NutritionLog }>(`${this.API}/log/water`, { amount });
  }

  searchFoodItems(q: string): Observable<{ success: boolean; items: FoodItem[] }> {
    const params = new HttpParams().set('q', q);
    return this.http.get<{ success: boolean; items: FoodItem[] }>(`${this.API}/foods/search`, { params });
  }
}
