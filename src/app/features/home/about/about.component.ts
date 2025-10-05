import { Component, OnInit } from '@angular/core';
import { ThreeSceneComponent } from '../../../shared/components/three-scene/three-scene.component';
import { MainLayoutComponent } from '../../../shared/layouts/main-layout/main-layout.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [MainLayoutComponent, ThreeSceneComponent],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
