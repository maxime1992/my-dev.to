import { Injectable } from '@angular/core';
import { Scene3dService } from './scene-3d.service';
import { ConnectionsBetweenRotors } from './scene-state.interface';
import { Observable } from 'rxjs';
import { switchMap, tap, mapTo, shareReplay } from 'rxjs/operators';
import { Mesh, Scene, StandardMaterial, TransformNode, MeshBuilder, Vector3 } from '@babylonjs/core';

@Injectable({
  providedIn: 'root',
})
export class ConnectionsBetweenRotorsService {
  constructor(private scene3dService: Scene3dService) {}

  private createMeshWithDefaultValues(meshId: string, scene: Scene): TransformNode {
    const connectionBetweenRotorsMaterial: StandardMaterial = new StandardMaterial(
      `connections-between-rotors-material-${meshId}`,
      scene,
    );
    connectionBetweenRotorsMaterial.alpha = 0.1;

    const a = 0.4;
    const nb = 26;
    const alpha = (2 * Math.PI) / nb;
    const radius = 0.4;

    const connectionsNode: TransformNode = new TransformNode(`connections-node-${meshId}`, scene);

    // draw lines between 2 rotors
    for (let i = 0; i < nb; i++) {
      const x: number = radius * Math.cos(alpha * (i + 1));
      const y: number = radius * Math.sin(alpha * (i + 1));

      const line = MeshBuilder.CreateTube(
        `line-${meshId}-${i}`,
        { path: [new Vector3(x, y, 0 + a), new Vector3(x, y, +0.5 - a)], radius: 0.005 },
        scene,
      );

      line.material = connectionBetweenRotorsMaterial;
      line.material.backFaceCulling = false;
      line.parent = connectionsNode;
    }

    // @todo the value should be dynamic here
    connectionsNode.position.z = -0.5;

    return connectionsNode;
  }

  private updateTransformNode(
    transformNode: TransformNode,
    connectionsBetweenRotorsUpdate: ConnectionsBetweenRotors,
  ): void {
    transformNode.position.z = connectionsBetweenRotorsUpdate.position.z;
  }

  public createConnectionsBetweenRotors(
    connectionsBetweenRotors: ConnectionsBetweenRotors,
    connectionsBetweenRotorsUpdate$: Observable<ConnectionsBetweenRotors>,
  ): Observable<void> {
    return this.scene3dService.scene$.pipe(
      switchMap(scene =>
        new Observable<TransformNode>(observer => {
          const transformNode: TransformNode = this.createMeshWithDefaultValues(connectionsBetweenRotors.id, scene);
          this.updateTransformNode(transformNode, connectionsBetweenRotors);

          observer.next(transformNode);

          return () => {
            scene.removeTransformNode(transformNode);
          };
        }).pipe(
          switchMap(transformNode =>
            connectionsBetweenRotorsUpdate$.pipe(
              tap(connectionsBetweenRotorsUpdate =>
                this.updateTransformNode(transformNode, connectionsBetweenRotorsUpdate),
              ),
            ),
          ),
        ),
      ),
      mapTo(undefined),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }
}
