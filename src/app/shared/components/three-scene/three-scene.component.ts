import { AfterViewInit, Component, Inject, NgZone, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

@Component({
  selector: 'app-three-scene',
  standalone: true,
  template: `<canvas id="bg"></canvas>`,
  styles: [`
    :host { display:block; height:100vh; }
    canvas#bg { width:100%; height:100%; display:block; }
  `]
})
export class ThreeSceneComponent implements AfterViewInit {
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone
  ) { }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // 👉 chạy ngoài Angular zone
    this.ngZone.runOutsideAngular(() => this.initThree());
  }

  private initThree() {
    let isDarkMode = true;
    const canvas = document.querySelector('#bg') as HTMLCanvasElement;

    // Scene + Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    // Light
    const movingLight = new THREE.PointLight(0xffffff, 400, 100);
    movingLight.position.set(0, 5, 10);
    scene.add(movingLight);
    scene.add(new THREE.PointLightHelper(movingLight, 0.5));

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // 👉 pixelRatio giới hạn (nhẹ hơn nhiều)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = false;
    controls.enableRotate = false;
    controls.enablePan = false;

    camera.position.set(-2.52, -5.23, 10.58);
    controls.target.set(-2.52, -5.23, 0);
    controls.update();

    // Plane
    const geometry = new THREE.PlaneGeometry(50, 50, 40, 50);
    const positions = geometry.attributes['position'] as THREE.BufferAttribute;
    for (let i = 0; i < positions.count; i++) {
      positions.setZ(i, (Math.random() - 0.5) * 1);
    }
    positions.needsUpdate = true;

    function hexToRGB(hex: string) {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      return { r, g, b };
    }

    const darkBase = hexToRGB("#000915ff");
    const lightBase = hexToRGB("#788083ff");
    const baseColor = isDarkMode ? darkBase : lightBase;

    // Colors
    const colors: number[] = [];
    for (let i = 0; i < positions.count; i++) {
      colors.push(baseColor.r, baseColor.g, baseColor.b);
    }
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    // Material + Mesh
    const material = new THREE.MeshPhongMaterial({
      vertexColors: true,
      flatShading: true,
      side: THREE.DoubleSide,
      shininess: 100,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -0.2;
    scene.add(mesh);

    // Ambient + Directional light
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const dirLight = new THREE.DirectionalLight(0xffffff, isDarkMode ? 1 : 2);
    dirLight.position.set(10, 10, 5);
    scene.add(dirLight);

    // Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let dirty = true; // 👉 chỉ update màu khi cần

    window.addEventListener("mousemove", (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      dirty = true;
    }, { passive: true });

    // Composer + Bloom (nhẹ hơn)
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.25, // strength nhẹ hơn
      0.15, // radius nhỏ hơn
      0.1   // threshold cao hơn
    );
    composer.addPass(bloomPass);

    // Animate loop
    const animate = () => {
      requestAnimationFrame(animate);

      raycaster.setFromCamera(mouse, camera);
      raycaster.intersectObject(mesh);

      if (dirty) {
        const colorAttr = geometry.attributes['color'] as THREE.BufferAttribute;
        for (let i = 0; i < colorAttr.count; i++) {
          (colorAttr as any).setXYZ(i, baseColor.r, baseColor.g, baseColor.b);
        }
        (colorAttr as any).needsUpdate = true;
        dirty = false;
      }

      const t = Date.now() * 0.001;
      movingLight.position.x = Math.sin(t) * 35;
      movingLight.position.z = Math.cos(t) * 35;
      movingLight.position.y = 5 + Math.sin(t * 0.5) * 3;

      mesh.rotation.z += 0.001 / 2;

      controls.update();
      composer.render();
    };
    animate();

    // Resize
    window.addEventListener("resize", () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    });
  }
}
