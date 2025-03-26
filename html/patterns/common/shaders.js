export async function initShaders(gl, vertexShaderPath, fragmentShaderPath)
{
    const response1 = await fetch( vertexShaderPath );
    const vertexShaderSource = await response1.text();
    const response2 = await fetch( fragmentShaderPath );
    const fragmentShaderSource = await response2.text();

    let vertexShader = gl.createShader( gl.VERTEX_SHADER );
    gl.shaderSource( vertexShader, vertexShaderSource );
    gl.compileShader( vertexShader );

    if( !gl.getShaderParameter( vertexShader, gl.COMPILE_STATUS ) )
    {
        console.log( "Vertex shader compilation failed!!" );
        console.log( "Log content: \n" + gl.getShaderInfoLog( vertexShader ) );
        return -1;
    }

    let fragmentShader = gl.createShader( gl.FRAGMENT_SHADER );
    gl.shaderSource( fragmentShader, fragmentShaderSource );
    gl.compileShader( fragmentShader );

    if( !gl.getShaderParameter( fragmentShader, gl.COMPILE_STATUS ) )
    {
        console.log( "Fragment shader compilation failed!!" );
        console.log( "Log content: \n" + gl.getShaderInfoLog( fragmentShader ) );
        return -1;
    }

    var program = gl.createProgram();
    gl.attachShader( program, vertexShader );
    gl.attachShader( program, fragmentShader );
    gl.linkProgram( program );

    if( !gl.getProgramParameter( program, gl.LINK_STATUS ) )
    {
        console.log( "Shader program linking failed!!" );
        console.log( "Log content: \n" + gl.getShaderInfoLog( program ) );
        return -1;
    }

    gl.deleteShader( vertexShader );
    gl.deleteShader( fragmentShader );

    return program;
}
