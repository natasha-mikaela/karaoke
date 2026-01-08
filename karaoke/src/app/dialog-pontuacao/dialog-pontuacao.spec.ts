import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogPontuacao } from './dialog-pontuacao';

describe('DialogPontuacao', () => {
  let component: DialogPontuacao;
  let fixture: ComponentFixture<DialogPontuacao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogPontuacao]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogPontuacao);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
