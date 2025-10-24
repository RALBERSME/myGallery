import "./style.css";
import * as THREE from "three";
import { Reflector } from "three/examples/jsm/Addons.js";
import { Easing, Tween, update as updateTween } from "tween";
const images = [
  "watercolor.jpg",
  "wiese.jpg",
  "forest.jpg",
  "colors.png",
  "harbour.png",
  "flower.jpg",
];
const artists = [
  "Hermann Hesse",
  "August Macke",
  "Emmerich Kálmán",
  "Rainer Maria Rilke",
  "Franz Marc",
  "Karl Friedrich Schinkel",
];
const profession = [
  "Schriftsteller und Dichter",
  "Maler",
  "Komponist",
  "Lyriker",
  "Maler und Grafiker",
  "Architekt und Städteplaner",
];

const webLinks = [
  "https://ralbersme.github.io/myCulture/",
  "https://ralbersme.github.io/myCulture/macke.html",
  "https://ralbersme.github.io/myCulture/kalman.html",
  "https://ralbersme.github.io/myCulture/rilke.html",
  "https://ralbersme.github.io/myCulture/marc.html",
  "https://ralbersme.github.io/myCulture/schinkel.html",
];
const textureLoader = new THREE.TextureLoader();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, -0.3, 1);
const rootNode = new THREE.Object3D();
scene.add(rootNode);

const leftArrowTexture = textureLoader.load("left.png");
const rightArrowTexture = textureLoader.load("right.png");
let count = 6;

for (let i = 0; i < count; i++) {
  const texture = textureLoader.load(images[i]);
  texture.colorSpace = THREE.SRGBColorSpace;
  const baseNode = new THREE.Object3D();
  baseNode.rotation.y = i * ((2 * Math.PI) / count);
  rootNode.add(baseNode);
  const border = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 2.2, 0.09),
    new THREE.MeshStandardMaterial({ color: 0x202020 })
  );
  border.name = `Border_${i}`;
  border.position.z = -4;
  baseNode.add(border);
  const artwork = new THREE.Mesh(
    new THREE.BoxGeometry(3, 2, 0.1),
    new THREE.MeshStandardMaterial({ map: texture })
  );
  artwork.name = `Art_${i}`;
  artwork.position.z = -4;

  baseNode.add(artwork);

  const leftArrow = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.3, 0.01),
    new THREE.MeshStandardMaterial({ map: leftArrowTexture, transparent: true })
  );
  leftArrow.name = `leftArrow`;
  leftArrow.userData = i === count - 1 ? 0 : i + 1;
  leftArrow.position.set(-1.8, 0, -4);
  baseNode.add(leftArrow);

  const rightArrow = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.3, 0.01),
    new THREE.MeshStandardMaterial({
      map: rightArrowTexture,
      transparent: true,
    })
  );
  rightArrow.name = `rightArrow`;
  rightArrow.userData = i === 0 ? count - 1 : i - 1;
  rightArrow.position.set(1.8, 0, -4);
  baseNode.add(rightArrow);
}
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

const spotlight = new THREE.SpotLight(0xffffff, 100.0, 10.0, 0.65, 1);
spotlight.position.set(0, 5, 0);
spotlight.target.position.set(0, 0.5, -5);
scene.add(spotlight);
scene.add(spotlight.target);

const mirror = new Reflector(new THREE.CircleGeometry(10, 10), {
  color: 0x303030,
  textureWidth: window.innerWidth,
  textureHeight: window.innerHeight / 2,
});

mirror.position.y = -1.1;
mirror.rotateX(-Math.PI / 2);
scene.add(mirror);

function rotateGallery(direction, newIndex) {
  const deltaY = direction * ((2 * Math.PI) / count);

  new Tween(rootNode.rotation)
    .to({ y: rootNode.rotation.y + deltaY })
    .easing(Easing.Quadratic.InOut)
    .start()
    .onStart(() => {
      document.getElementById("artists").style.opacity = 0;
      document.getElementById("nextPage").style.opacity = 0;
      document.getElementById("profession").style.opacity = 0;
    })
    .onComplete(() => {
      document.getElementById("artists").innerText = artists[newIndex];
      document.getElementById("profession").innerText = profession[newIndex];
      document
        .getElementById("nextPage")
        .setAttribute("href", webLinks[newIndex]);
      document.getElementById("artists").style.opacity = 1;
      document.getElementById("profession").style.opacity = 1;
      document.getElementById("nextPage").style.opacity = 1;
    });
}
function animate() {
  updateTween();
  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  mirror.getRenderTarget().setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener("click", (ev) => {
  const raycaster = new THREE.Raycaster();
  const mouseNDC = new THREE.Vector2(
    (ev.clientX / window.innerWidth) * 2 - 1,
    -(ev.clientY / window.innerHeight) * 2 + 1
  );
  raycaster.setFromCamera(mouseNDC, camera);

  const intersections = raycaster.intersectObject(rootNode, true);

  if (intersections.length > 0) {
    const obj = intersections[0].object;
    const newIndex = obj.userData;
    if (obj.name === "leftArrow") {
      rotateGallery(-1, newIndex);
    }
    if (obj.name === "rightArrow") {
      rotateGallery(1, newIndex);
    }
  }
});
document.getElementById("artists").innerText = artists[0];
document.getElementById("profession").innerText = profession[0];
