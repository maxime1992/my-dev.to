import { NgModule } from '@angular/core';
import { CommonModule as AngularCommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';

const MATERIAL_MODULES = [
  AngularCommonModule,
  MatToolbarModule,
  MatButtonModule,
  MatIconModule,
  MatCardModule,
  MatInputModule,
  MatFormFieldModule
];

const SHARED_IMPORTS_EXPORTS = [...MATERIAL_MODULES, ReactiveFormsModule];

@NgModule({
  imports: [...SHARED_IMPORTS_EXPORTS],
  exports: [...SHARED_IMPORTS_EXPORTS]
})
export class CommonModule {}
