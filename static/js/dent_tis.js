"use strict";
// make sure webGL is available
if ( WEBGL.isWebGLAvailable() === false ) {
document.body.appendChild( WEBGL.getWebGLErrorMessage() );
}

// define some global variables
var container;
var camera, scene, renderer, controls, objMesh;
var hdrCubeRenderTarget, hdrCubeMap;
var values =[];

// do stuff
init();
animate();


function init() {

// create a container for the graphics content
container = document.createElement('div');
document.body.appendChild(container);

// create a renderer for the graphics content
renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.gammaInput = true;
renderer.gammaOutput = true;
// attach the renderer to the container
container.appendChild(renderer.domElement);

// create a new graphics scene
scene = new THREE.Scene();

// load a HDR cubemap to serve as the scene background and object illumination map
var hdrUrls = [ 'px.hdr', 'nx.hdr', 'py.hdr', 'ny.hdr', 'pz.hdr', 'nz.hdr' ];
hdrCubeMap = new THREE.HDRCubeTextureLoader()
            .setPath( '/static/textures/envs/ennis/' )
    .load( THREE.UnsignedByteType, hdrUrls, function() {

    var pmremGenerator = new THREE.PMREMGenerator(hdrCubeMap);
    pmremGenerator.update(renderer);

    var pmremCubeUVPacker = new THREE.PMREMCubeUVPacker(pmremGenerator.cubeLods);
    pmremCubeUVPacker.update(renderer);

    hdrCubeRenderTarget = pmremCubeUVPacker.CubeUVRenderTarget;

    hdrCubeMap.magFilter = THREE.LinearFilter;
    hdrCubeMap.needsUpdate = true;

    pmremGenerator.dispose();
    pmremCubeUVPacker.dispose();

    });

// set the cubemap as the scene background
scene.background = hdrCubeMap;

// add an object to the scene

// 				var geometry = new THREE.PlaneGeometry(1024,1024,32,8);
// 				var material = new THREE.MeshStandardMaterial({
// 					map: new THREE.TextureLoader().load('./objects/manuscript_3js_v3/A_1024_flat_g100.png'),
// 					metalness: 1.0,
// 					metalnessMap: new THREE.TextureLoader().load('./objects/manuscript_3js_v3/M_1024.png'),
// 					roughness: 1.0,
// 					roughnessMap: new THREE.TextureLoader().load('./objects/manuscript_3js_v3/R_1024.png'),
// 					displacementMap: new THREE.TextureLoader().load('./objects/manuscript_3js_v3/H_1024.png'),
// 					displacementScale: 50.0,
// 					displacementBias: 0.0,
// 					normalMap: new THREE.TextureLoader().load('./objects/manuscript_3js_v3/N_1024.png'),
// 					// normalScale: new THREE.Vector2(0.5,0.5),
// 					alphaMap: new THREE.TextureLoader().load('./objects/manuscript_3js_v3/T_1024.png'),
// 					transparent: true,
// 					side: THREE.DoubleSide
// 					});

var xsize = 512;
var ysize = 512;

var meshFunc = function(u,v,target) {
    var r = Math.random(); // may need this someday
    var x = xsize * u; // size of plane in x,y
    var y = ysize * v;
    var u0 = 0.7; // location of dent
    var v0 = 0.7;
    var usig = 0.05; // width of dent
    var vsig = 0.05;
    var disp = -2.5; // depth/height of dent
    var uterm = Math.pow(u-u0,2)/Math.pow(2*usig,2); // make the gaussian dent
    var vterm = Math.pow(v-v0,2)/Math.pow(2*vsig,2);
    var z = disp*Math.exp(-(uterm+vterm));
    target.set(x,y,z); // return the vals to create the geometry
};

var geometry = new THREE.ParametricBufferGeometry(meshFunc, xsize, ysize);
geometry.center(); // plane x,y's start at 0 so center in worldspace
//   				geometry.rotateZ(Math.PI);
//   				geometry.rotateX(-Math.PI/2);

var material = new THREE.MeshStandardMaterial({
    side: THREE.DoubleSide,
    color: new THREE.Color("rgb(10%, 30%, 10%)"),
    roughness: 0.5
    });


objMesh = new THREE.Mesh(geometry, material);
scene.add(objMesh);


// add a camera to the scene
camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 1, 3000);
camera.position.set(0, 0, 600);

// lock the object and camera together
objMesh.add(camera);

// add accelerometer controls to the object/camera group
controls = new THREE.DeviceOrientationControls(objMesh);

// add a listener to handle window resizing
window.addEventListener( 'resize', onWindowResize, false );
window.addEventListener( 'deviceorientation', callback, false );

}

$("button").click(function(){
    $.ajax({
        type: "POST",
        url: '{{ form_fields["post_url"] }}',
        data: {alpha_beta_gamma:JSON.stringify(values)
        },
        success: function() {
            console.log("POST Successful");
            console.log('{{ form_fields["next_page"] }}');
            console.log('{{ form_fields["post_url"] }}');
            window.location.href = '{{ form_fields["next_page"] }}';
        },
        fail: function(e) {
            console.log("sending failed, error: " + e);
            console.log('form_fields["next_page"]');
            console.log('form_fields["post_url"]');
        }
    });
    //return false;
});

// animation loop
function animate() {
requestAnimationFrame(animate);
// get orientation info from the accelerometer
controls.update();
render();
}


// scene renderer
function render() {
var renderTarget, newEnvMap;

// update the object env map if necessary
renderTarget = hdrCubeRenderTarget;
newEnvMap = renderTarget ? renderTarget.texture : null;
if ( newEnvMap && newEnvMap !== objMesh.material.envMap ) {
    objMesh.material.envMap = newEnvMap;
    objMesh.material.needsUpdate = true;
}

		// render the scene
		renderer.render(scene, camera);
}


// window resize handler
function onWindowResize() {
		var width = window.innerWidth;
		var height = window.innerHeight;
		camera.aspect = width/height;
		camera.updateProjectionMatrix();
		renderer.setSize(width, height);
}

function callback(event){
    values.push({ alpha:event.alpha, beta:event.beta, gamma:event.gamma});
}
