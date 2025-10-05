import { Component, OnInit } from '@angular/core';
import { MainLayoutComponent } from '../../shared/layouts/main-layout/main-layout.component';
import { HeroComponent } from '../../shared/components/hero/hero.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent { }
