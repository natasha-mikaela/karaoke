import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Karaoke } from './karaoke';

describe('Karaoke', () => {
  let component: Karaoke;
  let fixture: ComponentFixture<Karaoke>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Karaoke]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Karaoke);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
