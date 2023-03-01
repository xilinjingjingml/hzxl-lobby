const VS_LOGO = `
attribute vec4 a_Position;
attribute vec2 a_TexCoord;
varying vec2 v_TexCoord;
void main() {
    gl_Position = a_Position;  
    v_TexCoord = a_TexCoord;
}`;

const FS_LOGO = `
precision mediump float;
uniform sampler2D u_Sampler;
varying vec2 v_TexCoord;
void main() {
    gl_FragColor = texture2D(u_Sampler, v_TexCoord);
}`;

const VS_PROGRESSBAR = `
precision mediump float;
attribute vec4 a_Position;
attribute float a_Progress;
varying float v_Progress;
void main() {
    gl_Position = a_Position;  
    v_Progress = a_Progress;
}`;

const FS_PROGRESSBAR = `
precision mediump float;
uniform float u_CurrentProgress;
varying float v_Progress;
uniform vec4 u_ProgressBarColor;
uniform vec4 u_ProgressBackground;
void main() {
    gl_FragColor = v_Progress <= u_CurrentProgress ? u_ProgressBarColor : u_ProgressBackground;
}`;

const options = {
    alpha: false,
    antialias: true,
    depth: true,
    stencil: true,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
    powerPreference: 'default',
    failIfMajorPerformanceCaveat: false,
};

let gl = null;
let image = null;
let imageBg = null;
let program = null;
let programProgress = null;
let rafHandle = null;
let texture = null;
let textureBg = null;
let vertexBuffer = null;
let vertexBufferBg = null;
let vertexBufferProgress = null;
let progress = 0.0;
let progressBarColor = [254 / 255, 72 / 255, 6 / 255, 1];
let progressBackground = [100 / 255, 111 / 255, 118 / 255, 1];
let bgColor = [0, 0, 0, 0]
let afterTick = null;

let aspectRadio = [1, 1]

function initShaders(vshader, fshader) {
    return createProgram(vshader, fshader);
}

function createProgram(vshader, fshader) {
    var vertexShader = loadShader(gl.VERTEX_SHADER, vshader);
    var fragmentShader = loadShader(gl.FRAGMENT_SHADER, fshader);
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
        var error = gl.getProgramInfoLog(program);
        console.log('Failed to link program: ' + error);
        gl.deleteProgram(program);
        program = null;
    }
    gl.deleteShader(fragmentShader);
    gl.deleteShader(vertexShader);
    return program;
}

function loadShader(type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
        var error = gl.getShaderInfoLog(shader);
        console.log('Failed to compile shader: ' + error);
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function initVertexBuffer() {
    // bg
    let widthRatio = 2 / canvas.width;
    let heightRatio = 2 / canvas.height;
    // const heightRatio = (window.devicePixelRatio >= 2 ? 6 : 3) / canvas.height;
    let heightOffset = 0//0.2//0.5;
    let verticesBg = new Float32Array([
        widthRatio, heightOffset + heightRatio, 1.0, 1.0,
        widthRatio, heightOffset + heightRatio, 1.0, 0.0,
        -widthRatio, heightOffset + heightRatio, 0.0, 1.0,
        -widthRatio, heightOffset + heightRatio, 0.0, 0.0,
    ]);
    vertexBufferBg = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferBg);
    gl.bufferData(gl.ARRAY_BUFFER, verticesBg, gl.STATIC_DRAW);

    // logo
    // const heightRatio = (window.devicePixelRatio >= 2 ? 6 : 3) / canvas.height;
    heightOffset = 0.2//0.5;
    const vertices = new Float32Array([
        widthRatio, heightOffset + heightRatio, 1.0, 1.0,
        widthRatio, heightOffset + heightRatio, 1.0, 0.0,
        -widthRatio, heightOffset + heightRatio, 0.0, 1.0,
        -widthRatio, heightOffset + heightRatio, 0.0, 0.0,
    ]);
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
}

function initProgressVertexBuffer() {
    const widthRatio = 0.405;
    const heightRatio = (window.devicePixelRatio >= 2 ? 6 : 3) / canvas.height;
    const heightOffset = -0.5;
    const vertices = new Float32Array([
        widthRatio, heightOffset - heightRatio, 1,
        widthRatio, heightOffset + heightRatio, 1,
        -widthRatio, heightOffset - heightRatio, 0,
        -widthRatio, heightOffset + heightRatio, 0,
    ]);
    vertexBufferProgress = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferProgress);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
}

function updateVertexBuffer() {
    let widthRatio = 1///imageBg.width / canvas.width;
    let heightRatio = 1//imageBg.height / canvas.height;
    let heightOffset = 0//
    let vertices = new Float32Array([
        widthRatio, -heightRatio + heightOffset, 1.0, 1.0,
        widthRatio, heightRatio + heightOffset, 1.0, 0.0,
        -widthRatio, -heightRatio + heightOffset, 0.0, 1.0,
        -widthRatio, heightRatio + heightOffset, 0.0, 0.0,
    ]);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferBg);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    widthRatio = image.width / canvas.width;
    heightRatio = image.height / canvas.height;
    heightOffset = 0.2//0.5;
    vertices = new Float32Array([
        widthRatio, -heightRatio + heightOffset, 1.0, 1.0,
        widthRatio, heightRatio + heightOffset, 1.0, 0.0,
        -widthRatio, -heightRatio + heightOffset, 0.0, 1.0,
        -widthRatio, heightRatio + heightOffset, 0.0, 0.0,
    ]);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
}

function loadImage(imgPath) {
    return new Promise((resolve, reject) => {

        imageBg = new Image();
        imageBg.premultiplyAlpha = false;
        imageBg.onload = function () {

        };
        imageBg.onerror = function (err) {
            reject(err);
        };
        imageBg.src = imgPath[0];

        image = new Image();
        image.premultiplyAlpha = false;
        image.onload = function () {
            resolve([image, imageBg]);
        };
        image.onerror = function (err) {
            reject(err);
        };
        image.src = imgPath[1];
    });
}

function initTexture() {
    textureBg = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureBg);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255]));

    texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255]));
}

function updateTexture() {

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureBg);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageBg);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
}

function draw() {
    gl.clearColor(bgColor[0], bgColor[1], bgColor[2], bgColor[3]);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.enable(gl.BLEND);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureBg);
    var uSampler = gl.getUniformLocation(program, 'u_Sampler');
    gl.uniform1i(uSampler, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferBg);
    var vertexFormatLength = 4;
    var aPosition = gl.getAttribLocation(program, 'a_Position');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, vertexFormatLength * 4, 0);
    var aTexCoord = gl.getAttribLocation(program, 'a_TexCoord');
    gl.enableVertexAttribArray(aTexCoord);
    gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, vertexFormatLength * 4, vertexFormatLength * 2);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);


    gl.useProgram(program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    uSampler = gl.getUniformLocation(program, 'u_Sampler');
    gl.uniform1i(uSampler, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    vertexFormatLength = 4;
    aPosition = gl.getAttribLocation(program, 'a_Position');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, vertexFormatLength * 4, 0);
    aTexCoord = gl.getAttribLocation(program, 'a_TexCoord');
    gl.enableVertexAttribArray(aTexCoord);
    gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, vertexFormatLength * 4, vertexFormatLength * 2);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);



    // gl.useProgram(programProgress);
    // var uCurrentProgress = gl.getUniformLocation(programProgress, 'u_CurrentProgress');
    // gl.uniform1f(uCurrentProgress, progress);
    // var uProgressBarColor = gl.getUniformLocation(programProgress, 'u_ProgressBarColor');
    // gl.uniform4fv(uProgressBarColor, progressBarColor);
    // var uProgressBackground = gl.getUniformLocation(programProgress, 'u_ProgressBackground');
    // gl.uniform4fv(uProgressBackground, progressBackground);
    // gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferProgress);
    // aPosition = gl.getAttribLocation(programProgress, 'a_Position');
    // gl.enableVertexAttribArray(aPosition);
    // gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, vertexFormatLength * 3, 0);
    // var aProgress = gl.getAttribLocation(programProgress, 'a_Progress');
    // gl.enableVertexAttribArray(aProgress);
    // gl.vertexAttribPointer(aProgress, 1, gl.FLOAT, false, vertexFormatLength * 3, vertexFormatLength * 2);
    // gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

function tick() {
    rafHandle = requestAnimationFrame(() => {
        draw();
        tick();
        if (afterTick) {
            afterTick();
            afterTick = null;
        }
    });
}

function end() {
    return setProgress(1).then(() => {
        cancelAnimationFrame(rafHandle);
        gl.useProgram(null);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.deleteTexture(texture);
        gl.deleteTexture(textureBg)
        gl.deleteBuffer(vertexBuffer);
        gl.deleteBuffer(vertexBufferBg)
        // gl.deleteBuffer(vertexBufferProgress);
        gl.deleteProgram(program);
        // gl.deleteProgram(programProgress);
    });
}

function setProgress(val) {
    progress = val;
    return new Promise((resolve, reject) => {
        afterTick = () => {
            resolve();
        };
    });
}

function start(alpha, antialias) {
    options.alpha = alpha === 'true' ? true : false;
    options.antialias = antialias === 'false' ? false : true;
    let canvas = window.canvas
    if (canvas.width < canvas.height) {
        aspectRadio = [canvas.width / canvas.height, 1.0]
    } else {
        aspectRadio = [1.0, canvas.height / canvas.width]
    }

    gl = window.canvas.getContext("webgl", options);
    initVertexBuffer();
    // initProgressVertexBuffer();
    initTexture();
    program = initShaders(VS_LOGO, FS_LOGO);
    // programProgress = initShaders(VS_PROGRESSBAR, FS_PROGRESSBAR);
    tick();
    return loadImage(['splash_bg.jpg', 'splash.png']).then(() => {
        updateVertexBuffer();
        updateTexture();
        return setProgress(0);
    });
}
module.exports = { start, end, setProgress };
