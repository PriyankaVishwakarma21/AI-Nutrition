import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService } from '../../services/ai.service';
import { AuthService } from '../../services/auth.service';
import { NutritionService } from '../../services/nutrition.service';

@Component({
  selector: 'app-ai-analysis',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-analysis.component.html'
})
export class AiAnalysisComponent implements OnInit {
  private aiSvc   = inject(AiService);
  private authSvc = inject(AuthService);
  private nutriSvc= inject(NutritionService);

  analysis      = signal('');
  suggestions   = signal('');
  loading       = signal(false);
  sugLoading    = signal(false);
  error         = signal('');

  // Meal suggestion form
  mealType          = 'lunch';
  remainingCalories = 500;
  preferences       = '';

  remainingToday = signal(0);

  mealTypes = ['breakfast','lunch','dinner','snack'];

  ngOnInit(): void {
    this.nutriSvc.getTodayLog().subscribe(r => {
      const goal = this.authSvc.currentUser()?.dailyCalorieGoal || 2000;
      this.remainingToday.set(Math.max(0, goal - r.log.totalCalories));
      this.remainingCalories = this.remainingToday();
    });
  }

  analyze(): void {
    this.loading.set(true);
    this.error.set('');
    this.analysis.set('');
    this.aiSvc.analyzeNutrition().subscribe({
      next: r => { this.analysis.set(r.analysis); this.loading.set(false); },
      error: err => {
        this.error.set(err.error?.message || 'AI analysis failed. Check your OpenAI API key.');
        this.loading.set(false);
      }
    });
  }

  getSuggestions(): void {
    this.sugLoading.set(true);
    this.suggestions.set('');
    this.aiSvc.getMealSuggestions(this.mealType, this.remainingCalories, this.preferences).subscribe({
      next: r => { this.suggestions.set(r.suggestions); this.sugLoading.set(false); },
      error: () => this.sugLoading.set(false)
    });
  }

  downloadReport(): void {
    this.aiSvc.downloadReport().subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement('a'), {
        href: url, download: `nutrition-report-${new Date().toISOString().split('T')[0]}.pdf`
      });
      a.click(); URL.revokeObjectURL(url);
    });
  }

  formatAnalysis(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }
}
