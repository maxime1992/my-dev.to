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
  SceneLoader,
  DynamicTexture,
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { from, of, interval, timer, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AdvancedDynamicTexture, Button } from '@babylonjs/gui';

@Component({
  selector: 'microwave-three-dimensions',
  templateUrl: './microwave-three-dimensions.component.html',
  styleUrls: ['./microwave-three-dimensions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MicrowaveThreeDimensionsComponent implements AfterViewInit, OnDestroy {
  private engine: Engine | undefined;
  private scene: Scene | undefined;

  constructor() {}

  public ngAfterViewInit(): void {
    const canvas = document.getElementById('renderCanvas') as any;

    if (!canvas) {
      throw new Error('Canvas not found');
    }

    this.engine = new Engine(canvas);

    this.scene = new Scene(this.engine);
    this.scene.useRightHandedSystem = true;

    const camera = new ArcRotateCamera('camera', 0, 0, 200, new Vector3(0, 0, 0), this.scene);

    camera.setPosition(new Vector3(300, 200, 400));

    camera.attachControl(canvas, true);

    const light = new HemisphericLight('light1', new Vector3(0, 1, 0), this.scene);

    light.intensity = 0.7;

    // camera.lowerRadiusLimit = 2;
    // camera.upperRadiusLimit = 150;
    camera.inertia = 0.5;
    camera.angularSensibilityX = 500;
    camera.angularSensibilityY = 500;
    camera.panningInertia = 0.2;
    camera.panningSensibility = 10;
    camera.useAutoRotationBehavior = false;
    camera.wheelPrecision = 1;

    SceneLoader.ImportMesh('', '/assets/', 'scene.gltf', this.scene, () => {
      if (this.scene) {
        this.scene.stopAllAnimations();
      }

      // --------------------------------------------
      const plane = Mesh.CreatePlane('plane', 20, this.scene!);
      plane.position.x = 82 + 80;
      plane.position.y = 102 + 80;
      plane.position.z = 98 + 80;
      plane.

      const advancedTexture = AdvancedDynamicTexture.CreateForMesh(plane);

      const button1 = Button.CreateSimpleButton('but1', 'Click Me');
      button1.width = 500;
      button1.height = 50;
      button1.color = 'white';
      button1.fontSize = 50;
      button1.background = 'green';
      button1.onPointerUpObservable.add(function() {
        alert('you did it!');
      });
      advancedTexture.addControl(button1);

      // --------------------------------------------

      const box = MeshBuilder.CreateBox('box', { height: 17, width: 48, depth: 20 }, this.scene);
      box.position.x = 82;
      box.position.y = 102;
      box.position.z = 98;

      timer(0, 1000)
        .pipe(
          switchMap(
            x =>
              new Observable(() => {
                const letterTexture = new DynamicTexture('dynamic texture', 512, this.scene, false);
                letterTexture.drawText(x.toString(), 185, 280, '15px monospace', '#ffffff', 'transparent');
                const letterMaterial = new StandardMaterial('mat', this.scene!);
                letterMaterial.diffuseTexture = letterTexture;
                letterMaterial.opacityTexture = letterTexture;
                letterMaterial.backFaceCulling = false;

                const letterPlane = MeshBuilder.CreatePlane(
                  'text',
                  {
                    size: 600,
                  },
                  this.scene,
                );
                letterPlane.material = letterMaterial;
                letterPlane.position = new Vector3(160, 123, 110);

                return () => {
                  letterTexture.dispose();
                  letterMaterial.dispose();
                  letterPlane.dispose();
                };
              }),
          ),
        )
        .subscribe();
    });

    this.engine.runRenderLoop(() => {
      // tslint:disable-next-line: no-non-null-assertion
      this.scene!.render();
    });
  }

  public ngOnDestroy(): void {
    if (this.engine) {
      this.engine.dispose();

      if (this.scene) {
        this.scene.dispose();
      }
    }
  }
}
