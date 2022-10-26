import { Body, Box, Vec3 } from "cannon-es";

export class Domino {
  constructor(info) {
    this.x = info.x || 0;
    this.y = info.y || 3;
    this.z = info.z || 0;
    this.scene = info.scene;

    this.width = info.width || 4;
    this.height = info.height || 6;
    this.depth = info.depth || 1;

    this.cannonWorld = info.cannonWorld;
    this.cannonBody;

    this.rotationY = info.rotationY || 0;

    info.glfLoader.load("/models/domino1.glb", (glb) => {
      this.dominoMesh = glb.scene.children[0];
      this.dominoMesh.castShadow = true;
      this.dominoMesh.name = "DOMINO";
      this.dominoMesh.position.set(this.x, this.y, this.z);
      this.scene.add(this.dominoMesh);

      this.setCannon();
    });
  }

  setCannon() {
    const shape = new Box(
      new Vec3(this.width / 2, this.height / 2, this.depth / 2)
    );
    this.cannonBody = new Body({
      mass: 1,
      position: new Vec3(this.x, this.y, this.z),
      shape,
    });

    this.cannonBody.quaternion.setFromAxisAngle(
      new Vec3(0, 1, 0), // y축
      this.rotationY
    );

    this.dominoMesh.cannonBody = this.cannonBody;

    this.cannonWorld.addBody(this.cannonBody);
  }
}
