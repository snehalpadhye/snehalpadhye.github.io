"use strict";
var render = function ()
{
    requestAnimationFrame( render );
    renderer.render( scene, camera );
}
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 100);
camera.position.set(-1, 5, 15);

var scene = new THREE.Scene();
scene.background = new THREE.Color('black');

var sphere1 = new THREE.SphereBufferGeometry(3, 32, 16);
var sphere2 = new THREE.SphereBufferGeometry(2.2, 32, 16);
var material1 = new THREE.MeshStandardMaterial({color: 'green', roughness: 0.6, metalness: 0.5});
var material2 = new THREE.MeshStandardMaterial({color: 'blue', roughness: 0.4, metalness: 0.7});

var spheremesh1 = new THREE.Mesh(sphere1, material1);
var spheremesh2 = new THREE.Mesh(sphere2, material2);
spheremesh1.position.set(-2,7,2);
spheremesh2.position.set(1.5,5,0);
scene.add(spheremesh1);
scene.add(spheremesh2);

var geometry = new THREE.PlaneBufferGeometry(40, 400);
var material = new THREE.MeshStandardMaterial({color: 'red'});

var planemesh = new THREE.Mesh(geometry, material);
planemesh.rotation.x = -Math.PI/2.2;
planemesh.position.set(6,-2,0);
scene.add(planemesh);

scene.add(camera);

var amblight = new THREE.AmbientLight(0xFFFFFF, 1);
scene.add(amblight);

const light = new THREE.DirectionalLight(0xFFFFFF, 1);
light.position.set(-4, 8, 10);
scene.add(light);

render();
