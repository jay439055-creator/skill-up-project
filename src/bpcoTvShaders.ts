import type { Shader } from "three";

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const staticShader = {
  uniforms: {
    tDiffuse: { value: null },
    time: { value: 0 },
    amount: { value: 0.5 },
    size: { value: 4 },
  },
  vertexShader,
  fragmentShader: `
uniform sampler2D tDiffuse;
uniform float time;
uniform float amount;
uniform float size;
varying vec2 vUv;
float rand(vec2 co) {
  return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}
void main() {
  vec4 color = texture2D(tDiffuse, vUv);
  float xs = floor(gl_FragCoord.x / size);
  float ys = floor(gl_FragCoord.y / size);
  vec4 snow = vec4(rand(vec2(xs * time, ys * time)) * amount);
  gl_FragColor = color + snow;
}
`,
} satisfies Shader;

export const badTvShader = {
  uniforms: {
    tDiffuse: { value: null },
    time: { value: 0 },
    distortion: { value: 3 },
    distortion2: { value: 5 },
    speed: { value: 0.2 },
    rollSpeed: { value: 0.1 },
  },
  vertexShader,
  fragmentShader: `
uniform sampler2D tDiffuse;
uniform float time;
uniform float distortion;
uniform float distortion2;
uniform float speed;
uniform float rollSpeed;
varying vec2 vUv;
vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec3 permute(vec3 x) {
  return mod289(((x * 34.0) + 1.0) * x);
}
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = x0.x > x0.y ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
void main() {
  vec2 p = vUv;
  float ty = time * speed;
  float yt = p.y - ty;
  float offset = snoise(vec2(yt * 3.0, 0.0)) * 0.2;
  offset = offset * distortion * offset * distortion * offset;
  offset += snoise(vec2(yt * 50.0, 0.0)) * distortion2 * 0.001;
  gl_FragColor = texture2D(tDiffuse, vec2(fract(p.x + offset), fract(p.y - time * rollSpeed)));
}
`,
} satisfies Shader;

export const rgbShiftShader = {
  uniforms: {
    tDiffuse: { value: null },
    amount: { value: 0.005 },
    angle: { value: 0 },
  },
  vertexShader,
  fragmentShader: `
uniform sampler2D tDiffuse;
uniform float amount;
uniform float angle;
varying vec2 vUv;
void main() {
  vec2 offset = amount * vec2(cos(angle), sin(angle));
  vec4 cr = texture2D(tDiffuse, vUv + offset);
  vec4 cga = texture2D(tDiffuse, vUv);
  vec4 cb = texture2D(tDiffuse, vUv - offset);
  gl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a);
}
`,
} satisfies Shader;

export const filmShader = {
  uniforms: {
    tDiffuse: { value: null },
    time: { value: 0 },
    nIntensity: { value: 0.5 },
    sIntensity: { value: 0.05 },
    sCount: { value: 4096 },
    grayscale: { value: true },
  },
  vertexShader,
  fragmentShader: `
uniform float time;
uniform bool grayscale;
uniform float nIntensity;
uniform float sIntensity;
uniform float sCount;
uniform sampler2D tDiffuse;
varying vec2 vUv;
void main() {
  vec4 cTextureScreen = texture2D(tDiffuse, vUv);
  float x = vUv.x * vUv.y * time * 1000.0;
  x = mod(x, 13.0) * mod(x, 123.0);
  float dx = mod(x, 0.01);
  vec3 cResult = cTextureScreen.rgb + cTextureScreen.rgb * clamp(0.1 + dx * 100.0, 0.0, 1.0);
  vec2 sc = vec2(sin(vUv.y * sCount), cos(vUv.y * sCount));
  cResult += cTextureScreen.rgb * vec3(sc.x, sc.y, sc.x) * sIntensity;
  cResult = cTextureScreen.rgb + clamp(nIntensity, 0.0, 1.0) * (cResult - cTextureScreen.rgb);
  if (grayscale) {
    cResult = vec3(cResult.r * 0.3 + cResult.g * 0.59 + cResult.b * 0.11);
  }
  gl_FragColor = vec4(cResult, cTextureScreen.a);
}
`,
} satisfies Shader;

export const copyOpacityShader = {
  uniforms: {
    tDiffuse: { value: null },
    opacity: { value: 1 },
  },
  vertexShader,
  fragmentShader: `
uniform float opacity;
uniform sampler2D tDiffuse;
varying vec2 vUv;
void main() {
  vec4 texel = texture2D(tDiffuse, vUv);
  gl_FragColor = opacity * texel;
}
`,
} satisfies Shader;
