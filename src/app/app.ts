import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThreeSceneComponent } from './shared/components/three-scene/three-scene.component';
import { TestComponent } from './shared/components/test/test.component';
import { ThemeService } from './core/themeService';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ThreeSceneComponent, TestComponent],
  templateUrl: './app.html'
})
export class App implements OnInit {
  protected readonly title = signal('portfolio');

  private readonly themeService = inject(ThemeService);

  ngOnInit(): void {
    this.themeService.setDefaultTheme();
  }
}
