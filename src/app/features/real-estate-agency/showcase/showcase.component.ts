import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ShowcaseItem {
  label: string;
  location: string;
  type: string;
  span: 'tall' | 'wide' | 'square';
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
    { label: 'The Meridian Penthouse',   location: 'Manhattan, NY',     type: 'Residential Luxury', span: 'tall' },
    { label: 'Pacific Crest Estate',     location: 'Malibu, CA',        type: 'Waterfront Villa',   span: 'square' },
    { label: 'Urban Core Lofts',         location: 'Chicago, IL',       type: 'Commercial Conversion', span: 'wide' },
    { label: 'Desert Sky Retreat',       location: 'Scottsdale, AZ',    type: 'Private Compound',   span: 'square' },
    { label: 'Harborview Residences',    location: 'Miami Beach, FL',   type: 'Luxury Condo Tower', span: 'tall' },
    { label: 'The Grand Oak Estate',     location: 'Greenwich, CT',     type: 'Historic Manor',     span: 'wide' }
  ];
}
