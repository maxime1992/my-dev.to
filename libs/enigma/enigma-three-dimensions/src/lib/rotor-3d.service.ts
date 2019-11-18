import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { mapTo, switchMap, tap, shareReplay } from 'rxjs/operators';
import { Scene3dService } from './scene-3d.service';
import { RotorConf } from './scene-state.interface';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Scene } from '@babylonjs/core/scene';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { Vector3 } from '@babylonjs/core/Maths/math';

@Injectable({
  providedIn: 'root',
})
export class Rotor3dService {
  constructor(private scene3dService: Scene3dService) {}

  private createMeshWithDefaultValues(meshId: string, scene: Scene): Mesh {
    const rotorMaterial: StandardMaterial = new StandardMaterial(`rotor-material-${meshId}`, scene);
    rotorMaterial.alpha = 0.5;

    const cylinder = MeshBuilder.CreateCylinder(
      `rotor-${meshId}`,
      {
        diameterTop: 1,
        tessellation: 100,
      },
      scene,
    );

    cylinder.position.y = 0;

    cylinder.scaling.x = 1;
    cylinder.scaling.y = 0.1;
    cylinder.scaling.z = 1;
    cylinder.rotate(new Vector3(1, 0, 0), (90 * Math.PI) / 180);
    cylinder.material = rotorMaterial;

    return cylinder;
  }

  private updateMesh(mesh: Mesh, rotor: RotorConf): void {
    mesh.position.z = rotor.position.z;
  }

  public createRotor(rotor: RotorConf, rotorUpdate$: Observable<RotorConf>): Observable<void> {
    return this.scene3dService.scene$.pipe(
      tap(x => console.log('creating rotor', { id: rotor.id, z: rotor.position.z })),
      switchMap(scene =>
        new Observable<Mesh>(observer => {
          const mesh: Mesh = this.createMeshWithDefaultValues(rotor.id, scene);
          this.updateMesh(mesh, rotor);

          observer.next(mesh);

          return () => {
            scene.removeMesh(mesh);
          };
        }).pipe(
          switchMap(mesh =>
            rotorUpdate$.pipe(
              tap(x => console.log('updating rotor', { id: rotor.id, z: rotor.position.z })),
              tap(rotorUpdate => this.updateMesh(mesh, rotorUpdate)),
            ),
          ),
        ),
      ),
      mapTo(undefined),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }
}
