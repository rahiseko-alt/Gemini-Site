import * as THREE from 'three';

// GL-A 背景シーン（等高線シェーダー）
const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uCursor;
uniform float uTransition; // 0.0 = S2明, 1.0 = S3暗
uniform float uSpeed;
uniform float uCursorScale;
uniform float uCursorIntensity;

varying vec2 vUv;

// Simplex 2D noise
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
  + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// 3オクターブ FBM
float fbm(vec2 uv) {
  float val = 0.0;
  float amp = 0.5;
  float freq = 1.0;
  for(int i = 0; i < 3; i++) {
    val += amp * snoise(uv * freq);
    freq *= 2.0;
    amp *= 0.5;
  }
  return val;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
  vec2 p = uv * aspect;

  // カーソル歪み (lerp追従uCursor, 半径CURSOR_SCALE: 3 UV比, CURSOR_INTENSITY: 0.15)
  vec2 cursorAspect = uCursor * aspect;
  float dist = length(p - cursorAspect);
  float cursorEffect = smoothstep(uCursorScale * 0.25, 0.0, dist) * uCursorIntensity;
  vec2 distortedUv = p + normalize(p - cursorAspect + 0.0001) * cursorEffect;

  // タイムオフセット (SPEED: 0.1)
  float t = uTime * uSpeed;
  float n = fbm(distortedUv * 2.5 + vec2(t * 0.2, t * 0.15));

  // 等高線 (topographic contour): fract(noise * 12.0)
  float linesVal = fract((n + 1.0) * 6.0);
  float thickness = 0.04;
  float contour = smoothstep(thickness, 0.0, abs(linesVal - 0.5) * 2.0);

  // 色パレット定義
  // S2 (明): 背景 #F8F8F3, 線色 #CBCBB9, 面色 #D2FF00 極薄混合
  vec3 s2Bg = vec3(0.972, 0.972, 0.953);
  vec3 s2Line = vec3(0.796, 0.796, 0.725);
  vec3 s2Accent = vec3(0.823, 1.0, 0.0);
  vec3 s2Base = mix(s2Bg, s2Accent, 0.03);
  vec3 s2Color = mix(s2Base, s2Line, contour * 0.75);

  // S3 (暗): 背景 #282c20, 線色 #363B25, カーソル色 #b2c73a
  vec3 s3Bg = vec3(0.157, 0.173, 0.125);
  vec3 s3Line = vec3(0.212, 0.231, 0.145);
  vec3 s3Cursor = vec3(0.698, 0.780, 0.227);
  vec3 s3Base = mix(s3Bg, s3Cursor, cursorEffect * 1.5);
  vec3 s3Color = mix(s3Base, s3Line, contour * 0.85);

  // uTransition (0.0 -> 1.0) で明暗を 1.1s 補間
  vec3 finalColor = mix(s2Color, s3Color, uTransition);

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

export function createBackgroundScene() {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const uniforms = {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    uCursor: { value: new THREE.Vector2(0.5, 0.5) },
    uTransition: { value: 0.0 }, // S2明(0.0) -> S3暗(1.0)
    uSpeed: { value: 0.1 },
    uCursorScale: { value: 3.0 },
    uCursorIntensity: { value: 0.15 },
  };

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    depthWrite: false,
    depthTest: false,
  });

  const geometry = new THREE.PlaneGeometry(2, 2);
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  return {
    scene,
    camera,
    uniforms,
    update: (time) => {
      uniforms.uTime.value = time;
    },
    resize: (width, height) => {
      uniforms.uResolution.value.set(width, height);
    },
  };
}
