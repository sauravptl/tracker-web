import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Service {
  icon: string;
  title: string;
  description: string;
  tag: string;
}

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class ServicesComponent {
  services: Service[] = [
    {
      icon: 'brain',
      title: 'AI Lead Intelligence',
      description: 'Predictive scoring identifies your hottest prospects before they raise their hand. Our models analyze 200+ behavioral signals to surface leads most likely to transact within 90 days.',
      tag: 'Conversion'
    },
    {
      icon: 'zap',
      title: 'Automated Nurture Sequences',
      description: 'From first inquiry to signed contract — our AI writes, sends, and optimizes every touchpoint. Hyper-personalized emails and texts that feel human, scale like software.',
      tag: 'Outreach'
    },
    {
      icon: 'home',
      title: 'Smart Property Matching',
      description: 'Proprietary algorithms match buyers to listings with 94% accuracy, cutting average search time in half. Buyers find their home faster; your agents spend less time guessing.',
      tag: 'Matching'
    },
    {
      icon: 'eye',
      title: 'Virtual Tour AI',
      description: 'AI-powered virtual staging and immersive 3D walkthroughs that sell properties sight unseen. Our rendering engine works overnight — listings go live looking extraordinary.',
      tag: 'Showcase'
    },
    {
      icon: 'chart',
      title: 'Market Intelligence',
      description: 'Real-time market analysis, price forecasting, and trend alerts delivered to your inbox every morning. Stop guessing — start knowing what\'s coming before your competitors do.',
      tag: 'Analytics'
    },
    {
      icon: 'link',
      title: 'CRM Automation',
      description: 'Zero-friction integration with Salesforce, HubSpot, Follow Up Boss, and 40+ platforms. Set up in minutes, not months. Your existing workflow gets smarter overnight.',
      tag: 'Integration'
    }
  ];
}
