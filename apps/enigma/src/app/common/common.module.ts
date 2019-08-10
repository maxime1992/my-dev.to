import { CommonModule as AngularCommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';

const MATERIAL_MODULES = [
  AngularCommonModule,
  MatToolbarModule,
  MatButtonModule,
  MatIconModule,
  MatCardModule,
  MatInputModule,
  MatFormFieldModule,
  MatProgressBarModule
];

const SHARED_IMPORTS_EXPORTS = [...MATERIAL_MODULES, ReactiveFormsModule];

@NgModule({
  imports: [...SHARED_IMPORTS_EXPORTS],
  exports: [...SHARED_IMPORTS_EXPORTS]
})
export class CommonModule {}
