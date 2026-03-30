import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const uniforms = {
  u_time: { value: 0.0 },
  u_res: { value: new THREE.Vector2(600, 420) },
  u_mouse: { value: new THREE.Vector2(300, 210) }
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

  const float threshold = 0.95;

  struct Metaball {
    vec3 color;
    vec2 position;
    float radius; 
  };

  void main() {
    Metaball metaballs[4];
    metaballs[0] = Metaball(vec3(1.0,0.0,0.0), vec2(100.0,90.0), 60.0);
    metaballs[1] = Metaball(vec3(0.0,1.0,0.0), vec2(120.0,200.0), 50.0);
    metaballs[2] = Metaball(vec3(0.0,0.0,1.0), vec2(200.0,90.0), 45.0);
    metaballs[3] = Metaball(vec3(1.0,0.0,0.0), vec2(400.0,190.0), 45.0);

    metaballs[0].position.x = u_res.x*sin(u_time*1.2314)/2.0  + u_res.x/2.0;
    metaballs[0].position.y = u_res.y*cos(u_time*1.2314)/2.0  + u_res.y/2.0;	
    metaballs[1].position.x = u_res.x*sin(u_time*1.2314)/2.0  + u_res.x/2.0;

    vec3 col = vec3(0.0, 0.0, 0.0);
    float infl = 0.0;

    for(int i = 0; i < 4; i++) {
      Metaball mb = metaballs[i];
      float currInfl = mb.radius * mb.radius;
      currInfl /= (pow(abs(gl_FragCoord.x-mb.position.x),2.0) + pow(abs(gl_FragCoord.y-mb.position.y),2.0));
      infl += currInfl;
      col += mb.color*currInfl;
    } 

    if (infl > threshold) 
      col = normalize(col); 

    col = mix(col, vec3(1.0), smoothstep(threshold+0.05, threshold, infl) * smoothstep(threshold-0.05, threshold, infl));

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

function animate(time) {
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);