import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { shareReplay, map } from 'rxjs/operators';
import { Scene } from '@babylonjs/core/scene';
import { Engine } from '@babylonjs/core/Engines/engine';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { Vector3 } from '@babylonjs/core/Maths/math';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';

@Injectable({
  providedIn: 'root',
})
export class Scene3dService {
  public scene$: Observable<Scene> = new Observable<Scene>(observer => {
    const canvas: HTMLCanvasElement | null = document.getElementById('renderCanvas') as HTMLCanvasElement;

    if (!canvas) {
      throw new Error('Canvas not found');
    }

    const engine: Engine = new Engine(canvas);
    const scene = new Scene(engine);
    scene.useRightHandedSystem = true;

    const camera = new ArcRotateCamera('camera', 0, 0, 10, new Vector3(0, 0, 0), scene);
    camera.setPosition(new Vector3(6, 0, 0));
    camera.attachControl(canvas, true);

    camera.lowerRadiusLimit = 1.5;
    camera.upperRadiusLimit = 15;
    camera.inertia = 0.5;
    camera.angularSensibilityX = 500;
    camera.angularSensibilityY = 500;
    camera.panningInertia = 0.2;
    camera.panningSensibility = 10;
    camera.useAutoRotationBehavior = false;
    camera.wheelPrecision = 30;

    const light = new HemisphericLight('light1', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    observer.next(scene);

    engine.runRenderLoop(() => {
      // tslint:disable-next-line: no-non-null-assertion
      scene!.render();
    });

    return () => {
      if (engine) {
        engine.dispose();

        if (scene) {
          scene.dispose();
        }
      }
    };
  }).pipe(shareReplay({ bufferSize: 1, refCount: true }));
}
