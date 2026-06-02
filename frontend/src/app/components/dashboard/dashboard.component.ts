import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, signal, computed, inject } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { NutritionService } from '../../services/nutrition.service';
import { AiService } from '../../services/ai.service';
import { AuthService } from '../../services/auth.service';
import { NutritionLog, WeeklySummary } from '../../models/nutrition.model';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, DecimalPipe, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('macroChart')  macroRef!:  ElementRef<HTMLCanvasElement>;
  @ViewChild('weeklyChart') weeklyRef!: ElementRef<HTMLCanvasElement>;

  private nutrition = inject(NutritionService);
  private ai        = inject(AiService);
  auth              = inject(AuthService);

  todayLog     = signal<NutritionLog | null>(null);
  weeklySummary= signal<WeeklySummary | null>(null);
  loading      = signal(true);
  dlLoading    = signal(false);  now           = new Date();
  user = this.auth.currentUser;

  caloriesPct = computed(() => {
    const goal = this.user()?.dailyCalorieGoal || 2000;
    const cal  = this.todayLog()?.totalCalories || 0;
    return Math.min(100, Math.round((cal / goal) * 100));
  });

  proteinPct = computed(() => {
    const goal = this.user()?.dailyProteinGoal || 150;
    return Math.min(100, Math.round(((this.todayLog()?.totalProtein || 0) / goal) * 100));
  });

  carbsPct = computed(() => {
    const goal = this.user()?.dailyCarbsGoal || 250;
    return Math.min(100, Math.round(((this.todayLog()?.totalCarbs || 0) / goal) * 100));
  });

  fatPct = computed(() => {
    const goal = this.user()?.dailyFatGoal || 65;
    return Math.min(100, Math.round(((this.todayLog()?.totalFat || 0) / goal) * 100));
  });

  private macroChart?:  Chart;
  private weeklyChart?: Chart;

  ngOnInit(): void {
    Promise.all([
      this.nutrition.getTodayLog().toPromise(),
      this.nutrition.getWeeklySummary().toPromise()
    ]).then(([todayRes, weeklyRes]) => {
      this.todayLog.set(todayRes!.log);
      this.weeklySummary.set(weeklyRes!.summary);
      this.loading.set(false);
      setTimeout(() => this.buildCharts(), 100);
    }).catch(() => this.loading.set(false));
  }

  ngAfterViewInit(): void {}

  private buildCharts(): void {
    this.buildMacroChart();
    this.buildWeeklyChart();
  }

  private buildMacroChart(): void {
    if (!this.macroRef) return;
    const log = this.todayLog();
    const ctx = this.macroRef.nativeElement.getContext('2d')!;
    this.macroChart?.destroy();
    this.macroChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Protein', 'Carbs', 'Fat'],
        datasets: [{
          data: [log?.totalProtein || 0.1, log?.totalCarbs || 0.1, log?.totalFat || 0.1],
          backgroundColor: ['#2196F3', '#FF9800', '#F44336'],
          borderWidth: 0,
          hoverOffset: 8
        }]
      },
      options: {
        cutout: '70%',
        plugins: { legend: { position: 'bottom' } },
        responsive: true
      }
    });
  }

  private buildWeeklyChart(): void {
    if (!this.weeklyRef) return;
    const logs = this.weeklySummary()?.logs || [];
    const ctx  = this.weeklyRef.nativeElement.getContext('2d')!;
    this.weeklyChart?.destroy();
    this.weeklyChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: logs.map(l => new Date(l.date).toLocaleDateString('en-US', { month:'short', day:'numeric' })),
        datasets: [{
          label: 'Calories',
          data: logs.map(l => l.totalCalories),
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76,175,80,.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#4CAF50',
          pointRadius: 5
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: false, grid: { color: '#f0f0f0' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  downloadReport(): void {
    this.dlLoading.set(true);
    this.ai.downloadReport().subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `nutrition-report-${new Date().toISOString().split('T')[0]}.pdf`;
        a.click(); URL.revokeObjectURL(url);
        this.dlLoading.set(false);
      },
      error: () => this.dlLoading.set(false)
    });
  }

  get mealTypes(): string[] { return ['breakfast','lunch','dinner','snack']; }

  entriesForMeal(meal: string) {
    return this.todayLog()?.foodEntries.filter(e => e.mealType === meal) || [];
  }

  mealCalories(meal: string): number {
    return this.entriesForMeal(meal).reduce((s,e) => s + e.foodItem.calories * e.quantity, 0);
  }
}
