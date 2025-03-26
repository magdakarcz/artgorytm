"use strict";

import { initShaders } from '../html/patterns/common/shaders.js';

window.onload = init;

let gl; // WebGL context

let shaderProgram =
{
    "attribsLocs" : new Map(),
    "uniformsLocs" : new Map(),
    "id" : null
}

let quad =
{
    "VAO" : null,
    "positionVBO" : null,
    "texCoordsVBO" : null,
    "noVertices" : 0
};

let juliaSetParmas = 
{
    "minX" : -2.0,
    "maxX" : 2.0,
    "minY" : -2.0,
    "maxY" : 2.0,
    "c" : [-0.01, 0.08],
    "n" : 5.0,
    "m" : [-0.1, 2.07],
    "a" : [0.2, 0.0],
    "b" : [0.2, 0.0],
    "alpha" : 0.3,
    "K" : 30
}

let colormaps = []; // the list with the textures containing color maps
let canvasRes = [800.0, 800.0]; // canvas resolution
let selected = 0; // the index of the selected color map
let exponent = 1.0; // the exponent used in the color mapping stage

// the list with the paths to the images with the color maps
let colormapsFiles = [
    "../common/colormaps/0408_093-s_3.png", 
    "../common/colormaps/gejulia.png", 
    "../common/colormaps/glass.png",
    "../common/colormaps/jutemap.png", 
    "../common/colormaps/royal.png",
    "../common/colormaps/kim.png",
    "../common/colormaps/coldfire.png",
    "../common/colormaps/lkmtch07.png",
    "../common/colormaps/turbo.png"
];

/*
* function that initializes WebGL and sets starting values of some settings
*/
async function init()
{
    initUI();

    initGL();
    await setupShaderProgram();
    createVBO();

    loadImages( colormapsFiles );

    requestAnimationFrame( render );
}

/*
* function that initializes user interface with the initial values stored in the juliaSetParams object
*/
function initUI()
{
    let nSlider = document.getElementById( "nSlider" );
    nSlider.value = juliaSetParmas.n;
    nSlider.oninput = nChanged;
    document.getElementById( "nValue" ).value = juliaSetParmas.n;

    let reCSlider = document.getElementById( "reCSlider" );
    reCSlider.value = juliaSetParmas.c[0];
    reCSlider.oninput = reCChanged;
    document.getElementById( "reCValue" ).value = juliaSetParmas.c[0];

    let imCSlider = document.getElementById( "imCSlider" );
    imCSlider.value = juliaSetParmas.c[1];
    imCSlider.oninput = imCChanged;
    document.getElementById( "imCValue" ).value = juliaSetParmas.c[1];

    let alphaSlider = document.getElementById( "alphaSlider" );
    alphaSlider.value = juliaSetParmas.alpha;
    alphaSlider.oninput = alphaChanged;
    document.getElementById( "alphaValue" ).value = juliaSetParmas.alpha;

    let exponentSlider = document.getElementById( "exponentSlider" );
    exponentSlider.value = exponent;
    exponentSlider.oninput = exponentChanged;
    document.getElementById( "exponentValue" ).value = exponent;

    let KSlider = document.getElementById( "KSlider" );
    KSlider.value = juliaSetParmas.K;
    KSlider.oninput = KChanged;
    document.getElementById( "KValue" ).value = juliaSetParmas.K;

    let colormapUI = document.getElementById( "colormap" );
    for( let i = 0; i < colormapsFiles.length; ++i )
    {
        let option = document.createElement( "option" );
        let filename = colormapsFiles[i].split( "/" ).slice( -1 )[0];
        option.text = filename.slice( 0, -4 );
        colormapUI.add( option );
    }
    colormapUI.selectedIndex = 0;

    document.getElementById( "colormap" ).onclick = selectColormap;
}

/*
* function that gets WebGL 2 context and initializes some WebGL settings
*/
function initGL()
{
    let canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext( 'webgl2' );
    if( !gl )
        alert( "WebGL2 is not available!" );

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.7, 0.7, 0.7, 1.0 );

    canvasRes[0] = canvas.width;
    canvasRes[1] = canvas.height;
}

/*
* function that loads shaders and gets the attributes and uniforms locations
*/
async function setupShaderProgram()
{
    shaderProgram.id = await initShaders( gl, './shaders/julia_shader.vert', './shaders/julia_shader.frag' );

    shaderProgram.attribsLocs.set( "vPosition", gl.getAttribLocation( shaderProgram.id, "vPosition" ) );
    shaderProgram.attribsLocs.set( "vTexCoords", gl.getAttribLocation( shaderProgram.id, "vTexCoords" ) );

    shaderProgram.uniformsLocs.set( "colormap", gl.getUniformLocation( shaderProgram.id, "colormap" ) );
    shaderProgram.uniformsLocs.set( "canvasRes", gl.getUniformLocation( shaderProgram.id, "canvasRes" ) );

    shaderProgram.uniformsLocs.set( "julia.alpha", gl.getUniformLocation( shaderProgram.id, "julia.alpha" ) );

    shaderProgram.uniformsLocs.set( "julia.minX", gl.getUniformLocation( shaderProgram.id, "julia.minX" ) );
    shaderProgram.uniformsLocs.set( "julia.maxX", gl.getUniformLocation( shaderProgram.id, "julia.maxX" ) );
    shaderProgram.uniformsLocs.set( "julia.minY", gl.getUniformLocation( shaderProgram.id, "julia.minY" ) );
    shaderProgram.uniformsLocs.set( "julia.maxY", gl.getUniformLocation( shaderProgram.id, "julia.maxY" ) );

    shaderProgram.uniformsLocs.set( "julia.c", gl.getUniformLocation( shaderProgram.id, "julia.c" ) );
    shaderProgram.uniformsLocs.set( "julia.n", gl.getUniformLocation( shaderProgram.id, "julia.n" ) );
    shaderProgram.uniformsLocs.set( "julia.m", gl.getUniformLocation( shaderProgram.id, "julia.m" ) );
    shaderProgram.uniformsLocs.set( "julia.a", gl.getUniformLocation( shaderProgram.id, "julia.a" ) );
    shaderProgram.uniformsLocs.set( "julia.b", gl.getUniformLocation( shaderProgram.id, "julia.b" ) );
    shaderProgram.uniformsLocs.set( "julia.K", gl.getUniformLocation( shaderProgram.id, "julia.K" ) );

    shaderProgram.uniformsLocs.set( "exponent", gl.getUniformLocation( shaderProgram.id, "exponent" ) );
}

/*
* function that renders the scene
*/
function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );

    gl.useProgram( shaderProgram.id );

    gl.uniform1f( shaderProgram.uniformsLocs.get( "exponent" ), exponent );

    gl.uniform1f( shaderProgram.uniformsLocs.get( "julia.alpha" ), juliaSetParmas.alpha );
    gl.uniform1f( shaderProgram.uniformsLocs.get( "julia.minX" ), juliaSetParmas.minX );
    gl.uniform1f( shaderProgram.uniformsLocs.get( "julia.maxX" ), juliaSetParmas.maxX );
    gl.uniform1f( shaderProgram.uniformsLocs.get( "julia.minY" ), juliaSetParmas.minY );
    gl.uniform1f( shaderProgram.uniformsLocs.get( "julia.maxY" ), juliaSetParmas.maxY );
    gl.uniform2fv( shaderProgram.uniformsLocs.get( "julia.c" ), juliaSetParmas.c );
    gl.uniform1f( shaderProgram.uniformsLocs.get( "julia.n" ), juliaSetParmas.n );
    gl.uniform2fv( shaderProgram.uniformsLocs.get( "julia.m" ), juliaSetParmas.m );
    gl.uniform2fv( shaderProgram.uniformsLocs.get( "julia.a" ), juliaSetParmas.a );
    gl.uniform2fv( shaderProgram.uniformsLocs.get( "julia.b" ), juliaSetParmas.b );
    gl.uniform1i( shaderProgram.uniformsLocs.get( "julia.K" ), juliaSetParmas.K );

    gl.uniform2fv( shaderProgram.uniformsLocs.get( "canvasRes" ), canvasRes );

    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, colormaps[selected] );
    gl.uniform1i( shaderProgram.uniformsLocs.get( "colormap" ), 0 );

    gl.bindVertexArray( quad.VAO );
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, quad.noVertices );

    requestAnimationFrame( render );
}

/*
* function that creates the VAO and VBOs with the quad
*/
function createVBO()
{
    let vertices =
    [
        -1.0, 1.0, 0.0, 1.0,
		-1.0, -1.0, 0.0, 1.0,
		1.0, 1.0, 0.0, 1.0,
        1.0, -1.0, 0.0, 1.0
    ];

    let texCoords =
    [
        0.0, 1.0,
        0.0, 0.0,
        1.0, 1.0,
        1.0, 0.0
    ];

    quad.VAO = gl.createVertexArray();
    gl.bindVertexArray( quad.VAO );

    quad.positionVBO = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, quad.positionVBO );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( vertices ), gl.STATIC_DRAW );
    gl.enableVertexAttribArray( shaderProgram.attribsLocs.get( "vPosition" ) );
    gl.vertexAttribPointer( shaderProgram.attribsLocs.get( "vPosition" ), 4, gl.FLOAT, false, 0, 0 );

    quad.texCoordsVBO = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, quad.texCoordsVBO );
    gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( texCoords ), gl.STATIC_DRAW );
    gl.enableVertexAttribArray( shaderProgram.attribsLocs.get( "vTexCoords" ) );
    gl.vertexAttribPointer( shaderProgram.attribsLocs.get( "vTexCoords" ), 2, gl.FLOAT, false, 0, 0 );

    quad.noVertices = 4;
}

/*
* function that loads images from the imgURLs list, and after the loading it calls the function which creates textures
* imgURLs - the list with the paths to the images that should be loaded
*/
function loadImages(imgURLs)
{
    colormaps = [];
    let images = [];
    let imagesToLoad = imgURLs.length;

    let onImageLoad = function()
    {
        --imagesToLoad;

        if( imagesToLoad == 0 )
            setupTextures( images );
    };

    for( let i = 0; i < imagesToLoad; ++i )
    {
        let image = loadImage( imgURLs[i], onImageLoad );
        images.push( image );
    }
}

/*
* function loads a single image
* imgURL - the path to the image to load
* callback - a callback function that will be called after the loading process
*/
function loadImage( imgURL, callback )
{
    let image = new Image();
    image.src = imgURL;
    image.onload = callback;

    return image;
}

/*
* function that creates the textures
* images - the list with the images that should be used as textures
*/
function setupTextures(images)
{
    for( let i = 0; i < images.length; ++i )
    {
        let colormap = gl.createTexture();

        gl.bindTexture( gl.TEXTURE_2D, colormap );
        gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );
        gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, images[i] );

        gl.generateMipmap( gl.TEXTURE_2D );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );

        colormaps.push( colormap );
    }
}

/*
* callback functions for UI controls
*/
function nChanged()
{
    juliaSetParmas.n = parseInt( updateOutput( "nSlider", "nValue" ) );
}

function reCChanged()
{
    juliaSetParmas.c[0] = parseFloat( updateOutput( "reCSlider", "reCValue" ) );
}

function imCChanged()
{
    juliaSetParmas.c[1] = parseFloat( updateOutput( "imCSlider", "imCValue" ) );
}

function alphaChanged()
{
    juliaSetParmas.alpha = parseFloat( updateOutput( "alphaSlider", "alphaValue" ) );
}

function exponentChanged()
{
    exponent = parseFloat( updateOutput( "exponentSlider", "exponentValue" ) );
}

function KChanged()
{
    juliaSetParmas.K = parseInt( updateOutput( "KSlider", "KValue" ) );
}

function selectColormap()
{
    var index = document.getElementById( "colormap" ).selectedIndex;
    selected = (index === undefined) ? 0 : index;
}

/*
* function updates given output control with the value from a given slider
* sliderControl - id of the slider
* outputControl - id of the output control that should be updated
* returns - a string with the value from the slider
*/
function updateOutput(sliderControl, outputControl)
{
    var value = document.getElementById( outputControl );
    var slider = document.getElementById( sliderControl );

    value.value = slider.value;

    return slider.value;
}


/*
* functions enabling to save images:
* saveCanvas - Converts the canvas content to the specified format (.jpg or .png) and triggers a download.
* saveCanvasAsSVG - Creates an SVG XML structure from the canvas and downloads it as an .svg file.
*/
function saveCanvasImage() {
    const canvas = document.getElementById("gl-canvas");
    const format = document.getElementById("imageFormat").value; // Get the selected image format   
    // Ensure WebGL rendering is complete before saving image
    requestAnimationFrame(() => {
        let imageUrl;

        if (format === "png") {
            imageUrl = canvas.toDataURL("image/png");
        } else if (format === "jpg") {
            imageUrl = canvas.toDataURL("image/jpeg");
        } else if (format === "svg") {
            // For SVG, we convert the canvas to SVG format (as an approximation)
            const svgData = canvasToSVG(canvas);
            imageUrl = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgData);
        }

        // Create a temporary link to trigger the download
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `generated-pattern.${format}`;
        link.click();
    });
}

/*
* Function to convert WebGL canvas to SVG (simplified approximation)
*/
function canvasToSVG(canvas) {
    return `
        <svg width="${canvas.width}" height="${canvas.height}" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="white" />
            <image href="${canvas.toDataURL("image/png")}" x="0" y="0" width="${canvas.width}" height="${canvas.height}" />
        </svg>
    `;
}

document.getElementById("saveButton").addEventListener("click", saveCanvasImage);
document.getElementById("shareButton").addEventListener("click", shareCanvasImage);

/*
* functions enabling to share images in social media:
*/
async function shareCanvasImage() {
    const canvas = document.getElementById("gl-canvas");
    requestAnimationFrame(async () => {

        const imageUrl = canvas.toDataURL("image/png");

        const blob = await (await fetch(imageUrl)).blob();

        const file = new File([blob], "generated-pattern.png", { type: "image/png" });

        if (navigator.share) {
            try {
                await navigator.share({
                    title: "Generated Pattern",
                    files: [file],
                });
            } catch (error) {
                console.error("Error sharing:", error);
            }
        } else {
            alert("Niestety API Web Share nie jest obsługiwane w Twojej przeglądarce.");
        }
    });
}

/*
* functions enabling to share images to the website's gallery:
*/

document.getElementById("shareToGalleryButton").addEventListener("click", shareToGallery);

async function shareToGallery() {
    const canvas = document.getElementById("gl-canvas");
    const imageName = document.getElementById("imageName").value;
    const imageDescription = document.getElementById("imageDescription").value;

    if (!imageName) {
        alert("Proszę podać nazwę obrazu.");
        return;
    }

    requestAnimationFrame(async () => {
        const imageUrl = canvas.toDataURL("image/png");

        const formData = new FormData();
        formData.append("user_id", "<?php echo $_SESSION['user_id']; ?>"); // Use user_id from session
        formData.append("algorithm_name", "Zbiory Julii"); // Extract from URL or pass dynamically
        formData.append("image_name", imageName);
        formData.append("description", imageDescription);
        formData.append("image_data", imageUrl);

        try {
            const response = await fetch("/artgorytm/php/save_to_gallery.php", {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                alert("Obraz został udostępniony do galerii!");
            } else {
                alert("Błąd: " + result.message);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Wystąpił błąd podczas udostępniania obrazu.");
        }
    });
}