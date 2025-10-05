import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThreeSceneComponent } from './shared/components/three-scene/three-scene.component';
import { TestComponent } from './shared/components/test/test.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ThreeSceneComponent, TestComponent],
  templateUrl: './app.html'
})
export class App {
  protected readonly title = signal('portfolio');
}
