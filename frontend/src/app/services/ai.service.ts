import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AiService {
  private readonly API = `${environment.apiUrl}/ai`;
  private readonly PDF = `${environment.apiUrl}/pdf`;

  constructor(private http: HttpClient) {}

  analyzeNutrition(): Observable<{ success: boolean; analysis: string }> {
    return this.http.get<{ success: boolean; analysis: string }>(`${this.API}/analyze`);
  }

  getMealSuggestions(mealType: string, remainingCalories: number, preferences = ''): Observable<{ success: boolean; suggestions: string }> {
    return this.http.post<{ success: boolean; suggestions: string }>(`${this.API}/meal-suggestions`, {
      mealType, remainingCalories, preferences
    });
  }

  downloadReport(startDate?: string, endDate?: string): Observable<Blob> {
    let url = `${this.PDF}/report`;
    const params: string[] = [];
    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate)   params.push(`endDate=${endDate}`);
    if (params.length) url += '?' + params.join('&');
    return this.http.get(url, { responseType: 'blob' });
  }
}
