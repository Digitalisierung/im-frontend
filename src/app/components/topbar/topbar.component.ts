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
    if (route.includes('products/new')) return 'Neues Produkt';
    if (route.includes('products')) return 'Inventar';
    if (route.includes('catalogs')) return 'Katalogverwaltung';
    return 'Produktkatalog';
  }

  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar?.classList.toggle('show');
  }
}
