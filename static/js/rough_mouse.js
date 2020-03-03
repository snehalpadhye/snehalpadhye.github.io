"use strict";
// make sure webGL is available
if ( WEBGL.isWebGLAvailable() === false ) {
document.body.appendChild( WEBGL.getWebGLErrorMessage() );
}

// define some global variables
var container;
var camera, scene, renderer, control, orbit, objMesh;
var hdrCubeRenderTarget, hdrCubeMap;
var values =[];

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

// create a scene
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

// create and add the object to the scene
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
    var disp = -0.0; // depth/height of dent (no depth in roughness task)
    var uterm = Math.pow(u-u0,2)/Math.pow(2*usig,2); // make the gaussian dent
    var vterm = Math.pow(v-v0,2)/Math.pow(2*vsig,2);
    var z = disp*Math.exp(-(uterm+vterm));
    target.set(x,y,z); // return the vals to create the geometry
};

var geometry = new THREE.ParametricBufferGeometry(meshFunc, xsize, ysize);
geometry.center(); // plane x,y's start at 0 so center in worldspace

var material = new THREE.MeshStandardMaterial({
    color: new THREE.Color("rgb(10%, 30%, 10%)"), // Fleming green
    roughness: 1.0,
    roughnessMap: new THREE.TextureLoader().load('/static/textures/objects/rough_map/R.png'),
    side: THREE.DoubleSide
    });

objMesh = new THREE.Mesh(geometry, material);
// 				objMesh.lookAt(new THREE.Vector3(0,0,1));

scene.add(objMesh);


// camera
camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 3000);
camera.position.set(0, 0, 600);
// 				camera.lookAt(0, 0, 0);

// orbit controls
orbit = new THREE.OrbitControls(camera, renderer.domElement);
orbit.update();
orbit.addEventListener('change', render);

// transform controls, turn off orbit if dragging?
control = new THREE.TransformControls(camera, renderer.domElement);
control.addEventListener('change', render);
control.addEventListener('dragging-changed', function (event) {
    orbit.enabled = ! event.value;
    });

// set transform controls to rotate
control.setMode( "rotate" );

// attach the transform controls to the object, then add controls to scene
control.attach(objMesh);
scene.add(control);

// standard resize handler
window.addEventListener( 'resize', onWindowResize, false );
window.addEventListener( 'deviceorientation', callback, false );
}

$("button").click(function(){
    $.ajax({
        type: "POST",
        url:  '{{ form_fields["post_url"] }}' ,
        data: {alpha_beta_gamma:JSON.stringify(values)
        },
        success: function() {
            console.log("POST Successful");
            //console.log(form_fields["next_page"]);
            //console.log(form_fields["post_url"]);
            window.location.href = '{{ form_fields["next_page"] }}';
        },
        fail: function(e) {
            console.log("sending failed, error: " + e);
            //console.log(form_fields["next_page"]);
            //console.log(form_fields["post_url"]);
        }
    });
    //return false;
});
// animation loop
function animate() {
		requestAnimationFrame(animate);
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
