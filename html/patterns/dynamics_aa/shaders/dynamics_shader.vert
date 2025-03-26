#version 300 es

in vec4 vPosition;
in vec2 vTexCoords;

out vec2 fTexCoords;

void main()
{
    fTexCoords = vTexCoords;

    gl_Position = vPosition;
}