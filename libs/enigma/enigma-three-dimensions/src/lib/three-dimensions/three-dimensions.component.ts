import { ChangeDetectionStrategy, Component, AfterViewInit, OnDestroy } from '@angular/core';
// Required side effects to populate the Create methods on the mesh class. Without this, the bundle would be smaller but the createXXX methods from mesh would not be accessible.
import '@babylonjs/core/Meshes/meshBuilder';
import {
  Scene,
  Engine,
  FreeCamera,
  Vector3,
  Mesh,
  HemisphericLight,
  MeshBuilder,
  ArcRotateCamera,
  TransformNode,
  StandardMaterial,
  Color3,
} from '@babylonjs/core';
import { SceneStateService } from '../scene-state.service';

// tslint:disable:no-magic-numbers

@Component({
  selector: 'enigma-three-dimensions',
  templateUrl: './three-dimensions.component.html',
  styleUrls: ['./three-dimensions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThreeDimensionsComponent implements AfterViewInit, OnDestroy {
  constructor(private sceneStateService: SceneStateService) {}

  public ngAfterViewInit() {
    // prettier-ignore
    const enigmaRotor1 = [4, 9, 10, 2, 7, 1, 23, 9, 13, 16, 3, 8, 2, 9, 10, 18, 7, 3, 26, 22, 6, 13, 5, 20, 4, 10];
    // prettier-ignore
    const enigmaRotor2 = [26, 8, 1, 7, 14, 3, 11, 13, 15, 18, 1, 22, 10, 6, 24, 13, 26, 15, 7, 20, 21, 3, 9, 24, 16, 5];
    // prettier-ignore
    const enigmaRotor3 = [5, 20, 13, 6, 4, 21, 8, 17, 22, 20, 7, 14, 11, 9, 18, 13, 3, 19, 2, 23, 24, 6, 17, 15, 9, 12];

    // line.color = color;
    // line.material.alpha = 0.3;
    // if (i === 22 && !!line.material) {
    //   line.material.alpha = 1;
    //   (line.material as StandardMaterial).diffuseColor = Color3.FromInts(16, 108, 200);
    // }

    this.sceneStateService.handleRotor$.subscribe();
    this.sceneStateService.addRotor(enigmaRotor1);
    this.sceneStateService.addRotor(enigmaRotor2);
    this.sceneStateService.addRotor(enigmaRotor3);

  }

  public ngOnDestroy(): void {}
}
