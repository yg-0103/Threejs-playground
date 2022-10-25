import * as THREE from "three";

export default function practice() {
  const canvas = document.getElementById("three-canvas");

  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();

  const camara = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    10
  );

  console.log(scene);

  scene.background = "red";

  function draw() {
    renderer.render(scene, camara);

    renderer.setAnimationLoop(draw);
  }
}
