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

// tslint:disable:no-magic-numbers

@Component({
  selector: 'enigma-three-dimensions',
  templateUrl: './three-dimensions.component.html',
  styleUrls: ['./three-dimensions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThreeDimensionsComponent implements AfterViewInit, OnDestroy {
  private engine: Engine | undefined;
  private scene: Scene | undefined;
  // private

  public ngAfterViewInit() {
    const canvas = document.getElementById('renderCanvas') as any;

    if (!canvas) {
      throw new Error('Canvas not found');
    }

    this.engine = new Engine(canvas);

    this.scene = new Scene(this.engine);
    this.scene.useRightHandedSystem = true;

    const camera = new ArcRotateCamera('camera', 0, 0, 10, new Vector3(0, 0, 0), this.scene);

    camera.setPosition(new Vector3(6, 0, 0));

    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    const light = new HemisphericLight('light1', new Vector3(0, 1, 0), this.scene);

    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 0.7;

    const rotorsNode: TransformNode = new TransformNode('rotorsNode', this.scene);

    const rotorMaterial: StandardMaterial = new StandardMaterial('rotorMaterial', this.scene);
    rotorMaterial.alpha = 0.5;

    const connectionBetweenRotorsMaterial: StandardMaterial = new StandardMaterial(
      'connectionBetweenRotorsMaterial',
      this.scene,
    );
    connectionBetweenRotorsMaterial.alpha = 0.1;

    const rotors: Mesh[] = Array.from([-0.5, 0, 0.5]).map((position, i) => {
      const cone = MeshBuilder.CreateCylinder(`rotor${i}`, { diameterTop: 1, tessellation: 100 }, this.scene);

      cone.position.y = 0;
      cone.position.z = position;

      cone.scaling.x = 1;
      cone.scaling.y = 0.1;
      cone.scaling.z = 1;
      cone.rotate(new Vector3(1, 0, 0), (90 * Math.PI) / 180);
      cone.parent = rotorsNode;
      cone.material = rotorMaterial;
      return cone;
    });

    camera.lowerRadiusLimit = 2;
    camera.upperRadiusLimit = 15;
    camera.inertia = 0.5;
    camera.angularSensibilityX = 500;
    camera.angularSensibilityY = 500;
    camera.panningInertia = 0.2;
    camera.panningSensibility = 10;
    camera.useAutoRotationBehavior = false;
    camera.wheelPrecision = 30;

    // const ground = Mesh.CreateGround('ground', 3, 3, 2, this.scene);
    // ground.position.y = -1;

    (() => {
      const a = 0.4;
      const nb = 26;
      const alpha = (2 * Math.PI) / nb;
      const radius = 0.4;

      // draw lines between 2 rotors
      for (let i = 0; i < nb; i++) {
        const x: number = radius * Math.cos(alpha * (i + 1));
        const y: number = radius * Math.sin(alpha * (i + 1));

        const line = MeshBuilder.CreateTube(
          `lineA${i}`,
          { path: [new Vector3(x, y, 0 + a), new Vector3(x, y, +0.5 - a)], radius: 0.003 },
          this.scene,
        );

        line.material = connectionBetweenRotorsMaterial;
        line.material.backFaceCulling = false;
      }
    })();

    (() => {
      const a = 0.4;
      const nb = 26;
      const alpha = (2 * Math.PI) / nb;
      const radius = 0.4;

      const connectionsNode: TransformNode = new TransformNode('connectionsNode', this.scene);

      // draw lines between 2 rotors
      for (let i = 0; i < nb; i++) {
        const x: number = radius * Math.cos(alpha * (i + 1));
        const y: number = radius * Math.sin(alpha * (i + 1));

        const line = MeshBuilder.CreateTube(
          `lineB${i}`,
          { path: [new Vector3(x, y, 0 + a), new Vector3(x, y, +0.5 - a)], radius: 0.005 },
          this.scene,
        );

        line.material = connectionBetweenRotorsMaterial;
        line.material.backFaceCulling = false;
        line.parent = connectionsNode;
      }

      connectionsNode.position.z = -0.5;
    })();

    // prettier-ignore
    const enigmaRotor1 = [4, 9, 10, 2, 7, 1, 23, 9, 13, 16, 3, 8, 2, 9, 10, 18, 7, 3, 26, 22, 6, 13, 5, 20, 4, 10];
    // prettier-ignore
    const enigmaRotor2 = [26, 8, 1, 7, 14, 3, 11, 13, 15, 18, 1, 22, 10, 6, 24, 13, 26, 15, 7, 20, 21, 3, 9, 24, 16, 5];
    // prettier-ignore
    const enigmaRotor3 = [5, 20, 13, 6, 4, 21, 8, 17, 22, 20, 7, 14, 11, 9, 18, 13, 3, 19, 2, 23, 24, 6, 17, 15, 9, 12];

    // 1
    (() => {
      const a = 0.2;
      const nb = 26;
      const alpha = (2 * Math.PI) / nb;
      const radius = 0.4;

      const connectionsNode: TransformNode = new TransformNode('connectionsNode', this.scene);

      // draw lines between 2 rotors
      for (let i = 0; i < nb; i++) {
        const xA: number = radius * Math.cos(alpha * (i + 1));
        const yA: number = radius * Math.sin(alpha * (i + 1));

        const xB: number = radius * Math.cos(alpha * (i + 1) + enigmaRotor1[i]);
        const yB: number = radius * Math.sin(alpha * (i + 1) + enigmaRotor1[i]);

        const line = MeshBuilder.CreateTube(
          `rotor1${i}`,
          { path: [new Vector3(xA, yA, 0 + a), new Vector3(xB, yB, +0.5 - a)], radius: 0.005 },
          this.scene,
        );

        const connectionInsideRotorMaterial: StandardMaterial = new StandardMaterial(
          'connectionInsideRotorMaterial',
          this.scene,
        );
        connectionInsideRotorMaterial.alpha = 0.3;
        // const colorConnectionInsideRotorMaterial = new Color3(26 / 255, 235 / 255, 252 / 255);

        line.parent = connectionsNode;
        line.material = connectionInsideRotorMaterial;
        line.material.backFaceCulling = false;

        // line.color = color;
        line.material.alpha = 0.3;
        if (i === 22 && !!line.material) {
          line.material.alpha = 1;
          (line.material as StandardMaterial).diffuseColor = Color3.FromInts(16, 108, 200);
        }
      }

      connectionsNode.position.z = 0.25;
    })();

    // 2
    (() => {
      const a = 0.2;
      const nb = 26;
      const alpha = (2 * Math.PI) / nb;
      const radius = 0.4;

      const connectionsNode: TransformNode = new TransformNode('connectionsNode', this.scene);

      // draw lines between 2 rotors
      for (let i = 0; i < nb; i++) {
        const xA: number = radius * Math.cos(alpha * (i + 1));
        const yA: number = radius * Math.sin(alpha * (i + 1));

        const xB: number = radius * Math.cos(alpha * (i + 1) + enigmaRotor2[i]);
        const yB: number = radius * Math.sin(alpha * (i + 1) + enigmaRotor2[i]);

        const line = MeshBuilder.CreateLines(
          `rotor2${i}`,
          { points: [new Vector3(xA, yA, 0 + a), new Vector3(xB, yB, +0.5 - a)] },
          this.scene,
        );

        line.parent = connectionsNode;
        // line.color = color;
        line.alpha = 0.3;
      }

      connectionsNode.position.z = -0.25;
    })();

    // 3
    (() => {
      const a = 0.2;
      const nb = 26;
      const alpha = (2 * Math.PI) / nb;
      const radius = 0.4;

      const connectionsNode: TransformNode = new TransformNode('connectionsNode', this.scene);

      // draw lines between 2 rotors
      for (let i = 0; i < nb; i++) {
        const xA: number = radius * Math.cos(alpha * (i + 1));
        const yA: number = radius * Math.sin(alpha * (i + 1));

        const xB: number = radius * Math.cos(alpha * (i + 1) + enigmaRotor3[i]);
        const yB: number = radius * Math.sin(alpha * (i + 1) + enigmaRotor3[i]);

        const line = MeshBuilder.CreateLines(
          `rotor3${i}`,
          { points: [new Vector3(xA, yA, 0 + a), new Vector3(xB, yB, +0.5 - a)] },
          this.scene,
        );

        line.parent = connectionsNode;
        // line.color = color;
        line.alpha = 0.3;
      }

      connectionsNode.position.z = -0.75;
    })();

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
