// src/app/pages/landing-page/landing-page.ts
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.html',
  styleUrls: ['./landing-page.scss'],
  standalone: true, // keep this if using bootstrapApplication
  imports: [RouterModule], // so routerLink works
})
export class LandingPage {}
