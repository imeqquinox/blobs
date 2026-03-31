import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const uniforms = {
  u_time: { value: 0.0 },
  u_res: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
  u_mouse: { value: new THREE.Vector2() }
}

const vertexShader = `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision mediump float;

  uniform float u_time;
  uniform vec2 u_res;
  uniform vec2 u_mouse; 

  float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5*(b-a)/k, 0.0, 1.0);
    return mix(b, a, h) - k*h*(1.0-h);
  }

  float sdCircle(vec2 p, vec2 c, float r) {
    return length(p - c) - r;
  }

  float sdBox(vec2 p, vec2 c, vec2 b) {
    vec2 d = abs(p - c) - b;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
  }

  float sdRoundedBox(vec2 p, vec2 c, vec2 b, float r) {
    return sdBox(p, c, b - r) - r;
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / min(u_res.x, u_res.y);

    float d = 1e9;
    float k = 0.25;

    vec2 c1 = vec2(-0.35, -0.3);
    d = smin(d, sdCircle(uv, c1, 0.15), k);

    vec2 c2 = vec2(-0.25, 0.25);
    d = smin(d, sdCircle(uv, c2, 0.3), k);

    vec2 r1 = vec2(0.25, 0.15);
    d = smin(d, sdRoundedBox(uv, r1, vec2(0.12, 0.10), 0.04), k);

    float fill = 1.0 - smoothstep(-0.004, 0.004, d);
    vec3 col1 = vec3(0.35, 0.55, 1.0);
    vec3 col2 = vec3(0.55, 0.35, 1.0);
    vec3 bodyCol = mix(col1, col2, uv.x * 0.5 + 0.5);

    vec3 col = vec3(0.0);
    col += bodyCol * fill;

    gl_FragColor = vec4(col, 1.0);
  }
`;

const material = new THREE.ShaderMaterial({
  uniforms: uniforms,
  fragmentShader: fragmentShader,
  vertexShader: vertexShader
});

const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
scene.add(mesh);

const timer = new THREE.Timer();

function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  uniforms.u_res.value.set(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', resize);

window.addEventListener('mousemove', (e) => {
  uniforms.u_mouse.value.set(e.clientX, window.innerHeight - e.clientY);
});

function animate(time) {
  timer.update(time);
  const t = timer.getElapsed();
  uniforms.u_time.value = t;

  renderer.render(scene, camera);
};

renderer.setAnimationLoop(animate);