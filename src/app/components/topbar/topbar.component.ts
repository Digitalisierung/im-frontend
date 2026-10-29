import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent {
  apiStatus = 'Verbunden';
  
  constructor(public router: Router) {}

  getPageTitle(): string {
    const route = this.router.url;
    if (route.includes('dashboard')) return 'Dashboard';
    if (route.includes('inventar/new')) return 'Neuer Artikel';
    if (route.includes('inventar')) return 'Inventar';
    if (route.includes('catalogs')) return 'Katalogverwaltung';
    return 'Artikelkatalog';
  }

  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar?.classList.toggle('show');
  }
}
