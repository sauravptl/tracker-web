import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroComponent } from './hero/hero.component';
import { ServicesComponent } from './services/services.component';
import { ShowcaseComponent } from './showcase/showcase.component';
import { FooterComponent } from './footer/footer.component';

@Component({
  selector: 'app-real-estate-agency',
  standalone: true,
  imports: [
    CommonModule,
    HeroComponent,
    ServicesComponent,
    ShowcaseComponent,
    FooterComponent
  ],
  templateUrl: './real-estate-agency.component.html',
  styleUrl: './real-estate-agency.component.css'
})
export class RealEstateAgencyComponent {}
