import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ShowcaseItem {
  label: string;
  location: string;
  type: string;
  span: 'tall' | 'wide' | 'square';
  gridColumn: string;
  gridRow: string;
}

@Component({
  selector: 'app-showcase',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './showcase.component.html',
  styleUrl: './showcase.component.css'
})
export class ShowcaseComponent {
  items: ShowcaseItem[] = [
    { label: 'The Meridian Penthouse',   location: 'Manhattan, NY',   type: 'Residential Luxury',    span: 'tall',   gridColumn: '1 / 5',  gridRow: '1 / 3' },
    { label: 'Pacific Crest Estate',     location: 'Malibu, CA',      type: 'Waterfront Villa',      span: 'square', gridColumn: '5 / 9',  gridRow: '1 / 2' },
    { label: 'Urban Core Lofts',         location: 'Chicago, IL',     type: 'Commercial Conversion', span: 'square', gridColumn: '9 / 13', gridRow: '1 / 2' },
    { label: 'Desert Sky Retreat',       location: 'Scottsdale, AZ',  type: 'Private Compound',      span: 'square', gridColumn: '5 / 9',  gridRow: '2 / 3' },
    { label: 'Harborview Residences',    location: 'Miami Beach, FL', type: 'Luxury Condo Tower',    span: 'tall',   gridColumn: '9 / 13', gridRow: '2 / 4' },
    { label: 'The Grand Oak Estate',     location: 'Greenwich, CT',   type: 'Historic Manor',        span: 'wide',   gridColumn: '1 / 9',  gridRow: '3 / 4' }
  ];
}
