import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Domino } from "./domino";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as CANNON from "cannon-es";

export default function practice() {
  const canvas = document.getElementById("three-canvas");

  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Scene
  const scene = new THREE.Scene();

  // Camera
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.y = 15;
  camera.position.z = 60;

  // Light
  const ambientLight = new THREE.AmbientLight("#fff", 0.5);
  const directionalLight = new THREE.DirectionalLight("#fff", 1);

  directionalLight.castShadow = true;
  directionalLight.position.y = 1.5;
  directionalLight.position.z = 4;

  scene.add(ambientLight, directionalLight);

  // Controls
  new OrbitControls(camera, canvas);

  // Geometry
  const floorGeometry = new THREE.PlaneGeometry(100, 100);

  // Material
  const floorMaterial = new THREE.MeshStandardMaterial({ color: "white" });

  // Mesh
  const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);

  floorMesh.receiveShadow = true;
  floorMesh.rotation.x = -Math.PI / 2;

  scene.add(floorMesh);

  // Loaders
  const glfLoader = new GLTFLoader();

  // Cannon
  const cannonWorld = new CANNON.World();
  cannonWorld.gravity.set(0, -10, 0);
  cannonWorld.broadphase = new CANNON.SAPBroadphase(cannonWorld);

  // Contact Material
  const defaultMaterial = new CANNON.Material("default");
  const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultMaterial,
    defaultMaterial,
    {
      friction: 0.01,
      restitution: 0.4,
    }
  );

  cannonWorld.defaultContactMaterial = defaultContactMaterial;

  const floorShape = new CANNON.Plane();
  const floorBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, 0, 0),
    shape: floorShape,
    material: defaultMaterial,
  });

  floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI / 2);

  cannonWorld.addBody(floorBody);

  // Domino
  const dominos = [];

  for (let i = -12; i < 10; i++) {
    const domino = new Domino({
      glfLoader,
      scene,
      cannonWorld,
      y: 10,
      z: -i * 3,
    });

    dominos.push(domino);
  }

  const clock = new THREE.Clock();

  console.log(dominos);
  function draw() {
    const delta = clock.getDelta();

    cannonWorld.step(1 / 60, delta, 3);

    dominos.forEach((domino) => {
      if (!domino.cannonBody) return;
      domino.dominoMesh.position.copy(domino.cannonBody.position);
      domino.dominoMesh.quaternion.copy(domino.cannonBody.quaternion);
    });

    renderer.render(scene, camera);
    renderer.setAnimationLoop(draw);
  }
  // Raycaster
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  canvas.addEventListener("click", (e) => {
    mouse.x = (e.clientX / canvas.clientWidth) * 2 - 1;
    mouse.y = -((e.clientY / canvas.clientHeight) * 2 - 1);

    raycaster.setFromCamera(mouse, camera);

    const intersectObjects = raycaster.intersectObjects(scene.children);

    if (!intersectObjects[0]?.object.cannonBody) return;

    intersectObjects[0].object.cannonBody.applyForce(
      new CANNON.Vec3(
        -intersectObjects[0].face.normal.x * 500,
        -intersectObjects[0].face.normal.y * 500,
        -intersectObjects[0].face.normal.z * 500
      ),
      new CANNON.Vec3(0, 0, 0)
    );
    console.log();
  });

  draw();
}
