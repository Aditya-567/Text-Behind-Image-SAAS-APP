import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  AfterViewInit,
  ViewChild,
} from '@angular/core';
import { Renderer, Program, Triangle, Mesh } from 'ogl';

@Component({
  selector: 'app-ripple-grid',
  templateUrl: './ripple-grid.component.html',
  standalone:false,
  styleUrls: ['./ripple-grid.component.scss'],
})
export class RippleGridComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('container', { static: true })
  containerRef!: ElementRef<HTMLDivElement>;

  // Props (with defaults)
  @Input() enableRainbow = false;
  @Input() gridColor = '#ffffff';
  @Input() rippleIntensity = 0.05;
  @Input() gridSize = 10.0;
  @Input() gridThickness = 15.0;
  @Input() fadeDistance = 1.5;
  @Input() vignetteStrength = 2.0;
  @Input() glowIntensity = 0.1;
  @Input() opacity = 1.0;
  @Input() gridRotation = 0;
  @Input() mouseInteraction = true;
  @Input() mouseInteractionRadius = 1;

  private mousePosition = { x: 0.5, y: 0.5 };
  private targetMouse = { x: 0.5, y: 0.5 };
  private mouseInfluence = 0;
  private uniforms: any;
  private renderer: any;
  private mesh: any;
  private animationId: number | null = null;

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initScene();
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resize);
    if (this.mouseInteraction) {
      this.containerRef.nativeElement.removeEventListener(
        'mousemove',
        this.handleMouseMove
      );
      this.containerRef.nativeElement.removeEventListener(
        'mouseenter',
        this.handleMouseEnter
      );
      this.containerRef.nativeElement.removeEventListener(
        'mouseleave',
        this.handleMouseLeave
      );
    }
    if (this.renderer) {
      this.renderer.gl.getExtension('WEBGL_lose_context')?.loseContext();
      this.containerRef.nativeElement.removeChild(this.renderer.gl.canvas);
    }
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  private hexToRgb(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16) / 255,
          parseInt(result[2], 16) / 255,
          parseInt(result[3], 16) / 255,
        ]
      : [1, 1, 1];
  }

  private initScene(): void {
    const container = this.containerRef.nativeElement;

    this.renderer = new Renderer({
      dpr: Math.min(window.devicePixelRatio, 2),
      alpha: true,
    });
    const gl = this.renderer.gl;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.canvas.style.width = '100%';
    gl.canvas.style.height = '100%';
    container.appendChild(gl.canvas);

    const vert = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

    const frag = `
precision highp float;
uniform float iTime;
uniform vec2 iResolution;
uniform bool enableRainbow;
uniform vec3 gridColor;
uniform float rippleIntensity;
uniform float gridSize;
uniform float gridThickness;
uniform float fadeDistance;
uniform float vignetteStrength;
uniform float glowIntensity;
uniform float opacity;
uniform float gridRotation;
uniform bool mouseInteraction;
uniform vec2 mousePosition;
uniform float mouseInfluence;
uniform float mouseInteractionRadius;
varying vec2 vUv;

float pi = 3.141592;

mat2 rotate(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
}

void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  uv.x *= iResolution.x / iResolution.y;

  if (gridRotation != 0.0) {
      uv = rotate(gridRotation * pi / 180.0) * uv;
  }

  float dist = length(uv);
  float func = sin(pi * (iTime - dist));
  vec2 rippleUv = uv + uv * func * rippleIntensity;

  if (mouseInteraction && mouseInfluence > 0.0) {
      vec2 mouseUv = (mousePosition * 2.0 - 1.0);
      mouseUv.x *= iResolution.x / iResolution.y;
      float mouseDist = length(uv - mouseUv);

      float influence = mouseInfluence * exp(-mouseDist * mouseDist / (mouseInteractionRadius * mouseInteractionRadius));
      float mouseWave = sin(pi * (iTime * 2.0 - mouseDist * 3.0)) * influence;
      rippleUv += normalize(uv - mouseUv) * mouseWave * rippleIntensity * 0.3;
  }

  vec2 a = sin(gridSize * 0.5 * pi * rippleUv - pi / 2.0);
  vec2 b = abs(a);

  float aaWidth = 0.5;
  vec2 smoothB = vec2(
      smoothstep(0.0, aaWidth, b.x),
      smoothstep(0.0, aaWidth, b.y)
  );

  vec3 color = vec3(0.0);
  color += exp(-gridThickness * smoothB.x * (0.8 + 0.5 * sin(pi * iTime)));
  color += exp(-gridThickness * smoothB.y);
  color += 0.5 * exp(-(gridThickness / 4.0) * sin(smoothB.x));
  color += 0.5 * exp(-(gridThickness / 3.0) * smoothB.y);

  if (glowIntensity > 0.0) {
      color += glowIntensity * exp(-gridThickness * 0.5 * smoothB.x);
      color += glowIntensity * exp(-gridThickness * 0.5 * smoothB.y);
  }

  float ddd = exp(-2.0 * clamp(pow(dist, fadeDistance), 0.0, 1.0));

  vec2 vignetteCoords = vUv - 0.5;
  float vignetteDistance = length(vignetteCoords);
  float vignette = 1.0 - pow(vignetteDistance * 2.0, vignetteStrength);
  vignette = clamp(vignette, 0.0, 1.0);

  vec3 t;
  if (enableRainbow) {
      t = vec3(
          uv.x * 0.5 + 0.5 * sin(iTime),
          uv.y * 0.5 + 0.5 * cos(iTime),
          pow(cos(iTime), 4.0)
      ) + 0.5;
  } else {
      t = gridColor;
  }

  float finalFade = ddd * vignette;
  float alpha = length(color) * finalFade * opacity;
  gl_FragColor = vec4(color * t * finalFade * opacity, alpha);
}`;

    this.uniforms = {
      iTime: { value: 0 },
      iResolution: { value: [1, 1] },
      enableRainbow: { value: this.enableRainbow },
      gridColor: { value: this.hexToRgb(this.gridColor) },
      rippleIntensity: { value: this.rippleIntensity },
      gridSize: { value: this.gridSize },
      gridThickness: { value: this.gridThickness },
      fadeDistance: { value: this.fadeDistance },
      vignetteStrength: { value: this.vignetteStrength },
      glowIntensity: { value: this.glowIntensity },
      opacity: { value: this.opacity },
      gridRotation: { value: this.gridRotation },
      mouseInteraction: { value: this.mouseInteraction },
      mousePosition: { value: [0.5, 0.5] },
      mouseInfluence: { value: 0 },
      mouseInteractionRadius: { value: this.mouseInteractionRadius },
    };

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: vert,
      fragment: frag,
      uniforms: this.uniforms,
    });
    this.mesh = new Mesh(gl, { geometry, program });

    window.addEventListener('resize', this.resize);
    if (this.mouseInteraction) {
      container.addEventListener('mousemove', this.handleMouseMove);
      container.addEventListener('mouseenter', this.handleMouseEnter);
      container.addEventListener('mouseleave', this.handleMouseLeave);
    }

    this.resize();
    this.renderLoop();
  }

  private resize = () => {
    const container = this.containerRef.nativeElement;
    const w = container.clientWidth;
    const h = container.clientHeight;
    this.renderer.setSize(w, h);
    this.uniforms.iResolution.value = [w, h];
  };

  private handleMouseMove = (e: MouseEvent) => {
    if (!this.mouseInteraction) return;
    const rect = this.containerRef.nativeElement.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1.0 - (e.clientY - rect.top) / rect.height;
    this.targetMouse = { x, y };
  };

  private handleMouseEnter = () => {
    if (!this.mouseInteraction) return;
    this.mouseInfluence = 1.0;
  };

  private handleMouseLeave = () => {
    if (!this.mouseInteraction) return;
    this.mouseInfluence = 0.0;
  };

  private renderLoop = (t: number = 0) => {
    this.uniforms.iTime.value = t * 0.001;

    // Smooth mouse follow
    const lerpFactor = 0.1;
    this.mousePosition.x +=
      (this.targetMouse.x - this.mousePosition.x) * lerpFactor;
    this.mousePosition.y +=
      (this.targetMouse.y - this.mousePosition.y) * lerpFactor;

    // Smooth influence
    const currentInfluence = this.uniforms.mouseInfluence.value;
    const targetInfluence = this.mouseInfluence;
    this.uniforms.mouseInfluence.value +=
      (targetInfluence - currentInfluence) * 0.05;

    this.uniforms.mousePosition.value = [
      this.mousePosition.x,
      this.mousePosition.y,
    ];

    this.renderer.render({ scene: this.mesh });
    this.animationId = requestAnimationFrame(this.renderLoop);
  };
}
