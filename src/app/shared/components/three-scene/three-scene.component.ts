import { AfterViewInit, Component, Inject, NgZone, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-three-scene',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './three-scene.component.html',
  styleUrls: ['./three-scene.component.scss'],
})
export class ThreeSceneComponent implements AfterViewInit {
  isDarkMode: boolean = true;

  private dirLight!: THREE.DirectionalLight;
  private geometry!: THREE.PlaneGeometry;

  // màu gốc
  private darkBase = this.hexToRGB('#000915ff');
  private lightBase = this.hexToRGB('#788083ff');

  // màu hiện tại & target để lerp
  private currentBase = { r: 0, g: 0, b: 0 };
  private targetBase = { r: 0, g: 0, b: 0 };

  // intensity hiện tại & target để lerp
  private currentIntensity = 1;
  private targetIntensity = 1;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  }

  onDarkModeChange(newValue: boolean) {
    console.log('Dark mode changed:', newValue);

    // set target màu + intensity (animate loop sẽ lerp dần)
    this.targetBase = newValue ? this.darkBase : this.lightBase;
    this.targetIntensity = newValue ? 1 : 2;
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.ngZone.runOutsideAngular(() => this.initThree());
  }

  private initThree() {
    const canvas = document.querySelector('#three-screen') as HTMLCanvasElement;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    // Moving Light
    const movingLight = new THREE.PointLight(0xffffff, 400, 1000);
    movingLight.position.set(0, 5, 10);
    scene.add(movingLight);
    scene.add(new THREE.PointLightHelper(movingLight, 0.5));

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
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
    this.geometry = new THREE.PlaneGeometry(50, 50, 40, 50);
    const positions = this.geometry.attributes['position'] as THREE.BufferAttribute;
    for (let i = 0; i < positions.count; i++) {
      positions.setZ(i, (Math.random() - 0.5) * 1);
    }
    positions.needsUpdate = true;

    // khởi tạo màu ban đầu
    this.currentBase = this.isDarkMode ? { ...this.darkBase } : { ...this.lightBase };
    this.targetBase = this.currentBase;

    const colors: number[] = [];
    for (let i = 0; i < positions.count; i++) {
      colors.push(this.currentBase.r, this.currentBase.g, this.currentBase.b);
    }
    this.geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const material = new THREE.MeshPhongMaterial({
      vertexColors: true,
      flatShading: true,
      side: THREE.DoubleSide,
      shininess: 100,
    });
    const mesh = new THREE.Mesh(this.geometry, material);
    mesh.rotation.x = -0.2;
    scene.add(mesh);

    // Ambient + Directional light
    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    this.currentIntensity = this.isDarkMode ? 1 : 2;
    this.targetIntensity = this.currentIntensity;
    this.dirLight = new THREE.DirectionalLight(0xffffff, this.currentIntensity);
    this.dirLight.position.set(10, 10, 5);
    scene.add(this.dirLight);

    // Composer
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.25,
      0.15,
      0.1
    );
    composer.addPass(bloomPass);

    // Animate loop
    const animate = () => {
      requestAnimationFrame(animate);

      // smooth lerp màu
      const lerpSpeed = 0.05;
      this.currentBase.r += (this.targetBase.r - this.currentBase.r) * lerpSpeed;
      this.currentBase.g += (this.targetBase.g - this.currentBase.g) * lerpSpeed;
      this.currentBase.b += (this.targetBase.b - this.currentBase.b) * lerpSpeed;

      const colorAttr = this.geometry.attributes['color'] as THREE.BufferAttribute;
      for (let i = 0; i < colorAttr.count; i++) {
        colorAttr.setXYZ(i, this.currentBase.r, this.currentBase.g, this.currentBase.b);
      }
      colorAttr.needsUpdate = true;

      // smooth lerp intensity
      this.currentIntensity += (this.targetIntensity - this.currentIntensity) * lerpSpeed;
      if (this.dirLight) {
        this.dirLight.intensity = this.currentIntensity;
      }

      // animation khác
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
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  private hexToRGB(hex: string) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return { r, g, b };
  }
}
