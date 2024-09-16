---
layout: psot
title: shader示例测试
date: 2023-09-03 16:39:36
tags: shader
category: 学习笔记
---

## 前言

学习了墨抒颖大神的教程<https://www.msy.plus/2020/10/05/hexo-threejs/>
*还是不会，~~我太笨了~~*
这个项目大抵上要搁置了。
**js**真难学啊，**shader**真难学啊，脑中要不够用了。
这里就直接CTRL+C和CTRL+V了大神的代码，康康能不能嵌入，正好我已经下决心学习Cocos2D-X，以后还会再来学习的。
相信后人的智慧！

## 看得见下面嘛？

<div id="threeShader"></div>
<script id="threeMainShader" type="module">
  if (self.frameElement && self.frameElement.tagName == "IFRAME") {
// 很酷炫的一个浅蓝色3d场景
const ShaderRoyale =
`
// FMS_Cat!!
// Since it's written in the shader royale compo,
// the code is a total mess that is not intended to be read.
// I heard the compo machine is not a beast enough
// so I made this less intensive a bit.
// There are several artifacts that is difficult to ignore :(
#define BEAT (time*170.0/60.0)
#define PI 3.14159265
#define time iTime
#define lofi(x,d) (floor((x)/(d))*(d))
#define saturate(a) (clamp((a),0.,1.))
#define linearstep(a,b,t) (saturate(((t)-(a))/((b)-(a))))
float seed;
float fractsin(float v)
{
  return fract(sin(v*121.445)*34.59);
}
float rand()
{
  seed=fractsin(seed);
  return seed;
}
vec3 randsphere()
{
  float t=PI*2.*rand();
  float p=acos(rand()*2.-1.);
  return vec3(sin(p)*sin(t),cos(p),sin(p)*cos(t));
}
float easeceil(float t, float fac)
{
  return floor(t)+.5+.5*cos(PI*exp(fac*fract(t)));
}
mat2 rot2d(float t)
{
  return mat2(cos(t),-sin(t),sin(t),cos(t));
}
vec3 ifs(vec3 p,vec3 rot,vec3 shift)
{
  vec3 pt=abs(p);
  vec3 t=shift;
  for(int i=0;i<6;i++)
  {
    pt=abs(pt)-abs(lofi(t*pow(1.8,-float(i)),1.0/512.0));
    t.yz=rot2d(rot.x)*t.yz;
    t.zx=rot2d(rot.y)*t.zx;
    t.xy=rot2d(rot.z)*t.xy;
    pt.xy=pt.x<pt.y?pt.yx:pt.xy;
    pt.yz=pt.y<pt.z?pt.zy:pt.yz;
  }
  return pt;
}
float sdbox(vec3 p,vec3 s)
{
  vec3 d=abs(p)-s;
  return length(max(d,0.));
}
// ======= map!!!!!!!!!! ====================================
vec4 map(vec3 p)
{
  vec3 pt=p;
  vec3 haha=lofi(pt,5.0);
  float scrphase=mod(999.9*fractsin(haha.y+haha.z+3.88),PI*2.0);
  float scr=(mod(haha.y+haha.z,2.0)*2.0-1.0)*20.0*smoothstep(-0.5,0.5,sin(time*0.5+scrphase));
  pt.x+=scr;
  haha=lofi(pt,5.0);
  float phase=BEAT/8.0;
  phase+=dot(haha,vec3(2.75,3.625,1.0625));
  phase=easeceil(phase,-10.0);
  pt=mod(pt,5.0)-2.5;
  vec3 pm=pt;
  pt.yz=rot2d(.5*PI*phase+.25*PI)*pt.yz;
  float clampBox=sdbox(pt,vec3(2.25,1.5,1.8));
  pt=ifs(pt,vec3(3.6,3.0+0.4*phase,3.1),vec3(3.0,2.3,3.5));
  pt=mod(pt-.5,1.)-.5;
  float dist=sdbox(pt,vec3(.17));
  dist=max(dist,clampBox);
  return vec4(
    dist,
    sin(PI*fract(phase)),
    step(0.0,0.01-abs(pt.x+pt.y)),
    abs(pm.x)+abs(pm.y)+abs(pm.z)
  );
}
vec3 normalFunc(vec3 p,vec2 d)
{
  return normalize(vec3(
    map(p+d.yxx).x-map(p-d.yxx).x,
    map(p+d.xyx).x-map(p-d.xyx).x,
    map(p+d.xxy).x-map(p-d.xxy).x
  ));
}
float aoFunc(vec3 p,vec3 n)
{
  float accum=0.;
  for(int i=0;i<32;i++){
    vec3 d=(0.02+0.02*float(i))*randsphere();
    d=dot(d,n)<.0?-d:d;
    //accum+=step(map(p+d).x,0.0)/64.0;
    accum+=linearstep(0.02,0.0,map(p+d).x)/64.0;
  }
  return 1.0-sqrt(saturate(6.0*accum));
}
vec2 glitch(vec2 v)
{
  vec2 vt=v;
  for(int i=0;i<6;i++)
  {
    float fac=4.0*pow(2.2,-float(i));
    float s=fractsin(lofi(vt.x,1.6*fac));
    s+=fractsin(lofi(vt.y,0.4*fac));
    s+=fractsin(time);
    float proc=fractsin(s);
    vt+=0.2*step(proc,0.4*exp(-3.0*mod(BEAT,8.0))-0.01)*(vec2(
      fractsin(s+22.56),
      fractsin(s+17.56)
    )-0.5);
  }
  return vt;
}
void mainImage( out vec4 o, in vec2 fragCoord )
{
  vec2 p=(fragCoord.xy*2.0-iResolution.xy)/iResolution.y;
  o=vec4(0,0,0,1);
  seed=texture2D(iChannel0,p).x;
  seed+=time;
  vec2 po=p;
  p=glitch(p);
  vec3 ro=vec3(4.0*time,0,lofi(BEAT,8.0));
  vec3 rd=vec3(p,-1);
  rd.z+=0.6*length(p);
  float camphase=lofi(BEAT,8.0)+mod(BEAT,8.0)*0.2;
  rd.yz=rot2d(0.33*camphase+0.03*sin(3.0*time))*rd.yz;
  rd.zx=rot2d(0.78*camphase+0.03*cos(3.0*time))*rd.zx;
  rd.xy=rot2d(0.048*camphase)*rd.xy;
  rd=normalize(rd);
  vec3 fp=ro+rd*5.0;
  ro+=0.02*randsphere();
  rd=normalize(fp-ro);
  vec4 dist;
  float rl=0.01;
  float glow=0.0;
  vec3 rp=ro+rl*rd;
  for(int i=0;i<69;i++){ // nice
    dist=map(rp);
    glow=dist.y;
    rl+=dist.x*0.7;
    rp=ro+rl*rd;
  }
  float fog=exp(-0.1*max(0.,rl-5.0));
  o.xyz+=(1.0-fog)*vec3(1.);
  vec3 n2=normalFunc(rp,vec2(0.0,1E-2+4E-2*dist.y));
  vec3 n=normalFunc(rp,vec2(0.0,2E-3));
  float edge=saturate(length(n-n2));
  float gorge=dist.z;
  o.xyz+=fog*0.1*vec3(15.0,1.0,1.5)*glow;
  if(dist.x<1E-3)
  {
    float ao=aoFunc(rp,n);
    o.xyz+=fog*vec3((0.4-0.1*gorge)*ao);
    o.xyz+=fog*edge*dist.y*vec3(15.0,1.0,1.5);
    //o.xyz+=fog*gorge*vec3(2.0,15.0,5.0)*exp(-10.0*mod(time+dist.w,1.0));
  }
  o.xyz+=length(p-po)*2.0*sin(3.0+4.0*o.x+vec3(0.0,2.0,4.0));
  o.xyz=pow(o.xyz,vec3(0.4545));
  o.xyz-=0.2*length(p);
  o.xyz=vec3(
    smoothstep(0.1,0.9,o.x),
    linearstep(0.0,0.8,o.y),
    smoothstep(-0.2,1.1,o.z)
  );
  o.xyz*=1.0+0.1*sin(vec3(0.,1.,2.)+fragCoord.y*2.0);
}
`
  import('https://raw.githubusercontent.com/xixinsama/xixinsama.github.io/master/2023/09/03/shader%E7%A4%BA%E4%BE%8B%E6%B5%8B%E8%AF%95/glsl_snippets.js').then(async res=>res.glsl_snippets(ShaderRoyale,(THREE)=>{
    return new Promise(res=>{
      new THREE.TextureLoader().load('https://github.com/xixinsama/xixinsama.github.io/blob/master/2023/09/03/shader%E7%A4%BA%E4%BE%8B%E6%B5%8B%E8%AF%95/noise.png?raw=true',(map)=>{
        res({iChannel0:map})
      })
    })
  }))
} else {
  import("https://raw.githubusercontent.com/xixinsama/xixinsama.github.io/master/2023/09/03/shader%E7%A4%BA%E4%BE%8B%E6%B5%8B%E8%AF%95/createTHREE.js").then((result) => 
      result.initHexoThreeModule(document.getElementById("threeShader"),document.getElementById("threeMainShader")));
}
</script>

## 嵌入threejs3D场景

<div id="three3D"></div>
<script type="module" id="threeMain3D">
if (!(self.frameElement && self.frameElement.tagName == "IFRAME")) {
  import("https://raw.githubusercontent.com/xixinsama/xixinsama.github.io/master/2023/09/03/shader%E7%A4%BA%E4%BE%8B%E6%B5%8B%E8%AF%95/createTHREE.js").then((result) => result.initHexoThreeModule(document.getElementById("three3D"),document.getElementById("threeMain3D")));
} else {
  // 这里的代码会被直接执行，window指向iframe内的window（其实就是把代码整个移动到了iframe内）
  console.log(1)
  main()
  async function main(){
    const THREE = await import("https://cdn.bootcdn.net/ajax/libs/three.js/r120/three.module.js");
    const {OrbitControls} = await import('https://threejs.org/examples/jsm/controls/OrbitControls.js')
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.set(50,90,120);
    const renderer = new THREE.WebGLRenderer({alpha:true});
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.domElement.style.width =renderer.domElement.style.height = '100%'
    document.body.appendChild( renderer.domElement );
    let num2 = null
    let size = 200
    for(let i = 0;i<size;i++){
      num2 = Math.random() * 14 // 随机高度范围
      let box = new THREE.Mesh(new THREE.BoxBufferGeometry(3,num2,3),new THREE.ShaderMaterial({
        vertexShader: `varying float vDepth;void main() {gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );vDepth = (gl_Position.z/gl_Position.w)*.5+.5;}`,
        fragmentShader: `varying float vDepth;void main() {gl_FragColor = vec4(vDepth,vDepth,vDepth,1);}`
      }))
      let box2 = new THREE.Mesh(
        new THREE.BoxBufferGeometry(3,num2,3),
        new THREE.MeshBasicMaterial({color:0xcccccc})
      )
      const [x,y,z] = [-100 + Math.round(Math.random()*200),num2/2,-100 + Math.round(Math.random()*200)] // 控制方块之间的距离
      box.position.set(x,y,z)
      box2.position.set(x,y,z)
      box.castShadow = true
      scene.add(box2)
    }
    new OrbitControls(camera,renderer.domElement)
    window.onresize = function (){
      camera.aspect = window.innerWidth /window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth,window.innerHeight)
    }
    const animate = function () {
      renderer.render( scene, camera );
      requestAnimationFrame( animate );
    };
    animate();
  }
}
</script>
