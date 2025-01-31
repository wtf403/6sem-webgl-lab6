"use strict";

function main() {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  let canvas = document.querySelector("#canvas");
  let gl = canvas.getContext("webgl");
  if (!gl) {
    alert(
      "Unable to initialize WebGL. Your browser or machine may not support it."
    );
    return;
  }

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // setup GLSL program
  let program = webglUtils.createProgramFromScripts(gl, [
    "vertex-shader-2d",
    "fragment-shader-2d",
  ]);

  // look up where the vertex data needs to go.
  let positionLocation = gl.getAttribLocation(program, "a_position");

  // lookup uniforms
  let resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  let gradientLocation = gl.getUniformLocation(program, "u_gradient");
  let translationLocation = gl.getUniformLocation(program, "u_translation");
  let rotationLocation = gl.getUniformLocation(program, "u_rotation");
  let scaleLocation = gl.getUniformLocation(program, "u_scale");

  // Create a buffer to put positions in
  let positionBuffer = gl.createBuffer();
  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // Put geometry data into buffer
  setGeometry(gl);

  let translation = [800, 500];
  let rotation = [0, 1];
  let scale = [5, 5];
  let gradient = 0.5; // initial gradient offset

  drawScene();

  // Setup a ui.
  webglLessonsUI.setupSlider("#x", {
    value: translation[0],
    slide: updatePosition(0),
    max: gl.canvas.width,
  });
  webglLessonsUI.setupSlider("#y", {
    value: translation[1],
    slide: updatePosition(1),
    max: gl.canvas.height,
  });
  webglLessonsUI.setupSlider("#angle", { slide: updateAngle, max: 360 });
  webglLessonsUI.setupSlider("#scaleX", {
    value: scale[0],
    slide: updateScale(0),
    min: -5,
    max: 5,
    step: 0.01,
    precision: 2,
  });
  webglLessonsUI.setupSlider("#scaleY", {
    value: scale[1],
    slide: updateScale(1),
    min: -5,
    max: 5,
    step: 0.01,
    precision: 2,
  });
  webglLessonsUI.setupSlider("#gradient", {
    value: gradient,
    slide: updateGradient,
    min: 0,
    max: 1,
    step: 0.01,
    precision: 2,
  });

  function updatePosition(index) {
    return function (event, ui) {
      translation[index] = ui.value;
      drawScene();
    };
  }

  function updateAngle(event, ui) {
    let angleInDegrees = 360 - ui.value;
    let angleInRadians = (angleInDegrees * Math.PI) / 180;
    rotation[0] = Math.sin(angleInRadians);
    rotation[1] = Math.cos(angleInRadians);
    drawScene();
  }

  function updateScale(index) {
    return function (event, ui) {
      scale[index] = ui.value;
      drawScene();
    };
  }

  function updateGradient(event, ui) {
    gradient = ui.value;
    drawScene();
  }

  // Draw the scene.
  function drawScene() {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    // Clear the canvas.
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Turn on the attribute
    gl.enableVertexAttribArray(positionLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    let size = 2; // 2 components per iteration
    let type = gl.FLOAT; // the data is 32bit floats
    let normalize = false; // don't normalize the data
    let stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
    let offset = 0; // start at the beginning of the buffer
    gl.vertexAttribPointer(
      positionLocation,
      size,
      type,
      normalize,
      stride,
      offset
    );

    // set the resolution
    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

    // set the gradient
    gl.uniform1f(gradientLocation, gradient);

    // Set the translation.
    gl.uniform2fv(translationLocation, translation);

    // Set the rotation.
    gl.uniform2fv(rotationLocation, rotation);

    // Set the scale.
    gl.uniform2fv(scaleLocation, scale);

    // Draw the geometry.
    let primitiveType = gl.TRIANGLES;
    let count = 42; // 6 triangles in the 'F', 3 points per triangle
    gl.drawArrays(primitiveType, offset, count);
  }
}
function setGeometry(gl) {
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      // М
      -45, 40, -50, -40, -60, 40,

      -50, -40, -45, 40, -40, -10,

      -50, -40, -40, -10, -30, -15,

      -40, -10, -30, -15, -30, 5,

      -30, -15, -30, 5, -20, -10,

      -30, -15, -20, -10, -10, -40,

      -20, -10, -15, 40, -10, -40,

      -15, 40, -10, -40, 0, 40,

      //K
      5, -40, 5, 40, 18, 40,

      5, -40, 18, -40, 18, 40,

      18, -5, 40, -40, 60, -40,

      18, -5, 18, 15, 60, -40,

      18, 0, 18, 15, 60, 40,

      18, 15, 40, 40, 60, 40,
    ]),
    gl.STATIC_DRAW
  );
}
main();
