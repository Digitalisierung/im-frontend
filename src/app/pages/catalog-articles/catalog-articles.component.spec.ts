import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogArticlesComponent } from './catalog-articles.component';

describe('CatalogArticlesComponent', () => {
  let component: CatalogArticlesComponent;
  let fixture: ComponentFixture<CatalogArticlesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogArticlesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CatalogArticlesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
