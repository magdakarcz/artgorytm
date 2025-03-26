#version 300 es
precision highp float;

struct JuliaSetParams
{
    float minX;
    float maxX;
    float minY;
    float maxY;

    vec2 c;
    float n;
    vec2 m;
    vec2 a;
    vec2 b;
    float alpha;
    int K;
};

in vec2 fTexCoords;

uniform sampler2D colormap;
uniform vec2 canvasRes; // canvas resolution
uniform float exponent; // exponent used in the color mapping stage

uniform JuliaSetParams julia;

out vec4 fragColor;

vec2 complexMult( vec2 z1, vec2 z2 );
vec2 complexPow( vec2 z, float n );

vec2 g(vec2 z, vec2 a, vec2 b);
vec2 W(vec2 z, float n, vec2 m, vec2 r);
float juliaIterate(vec2 p);

void main()
{
    vec2 t = gl_FragCoord.xy / canvasRes;
    float reZ = julia.minX + t.x * (julia.maxX - julia.minX);
    float imZ = julia.minY + t.y * (julia.maxY - julia.minY);

    float escapeTime = juliaIterate( vec2( reZ, imZ ) );
    escapeTime = pow( escapeTime, exponent );

    if( abs(escapeTime - 1.0 ) < 0.0001 )
        fragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
    else
        fragColor = texture( colormap, vec2( escapeTime, 0.0 ) );

    //fragColor = vec4( fTexCoords, 0.0, 1.0 );
}

// multiplication of two complex numbers
vec2 complexMult( vec2 z1, vec2 z2 )
{
	return vec2( z1.x * z2.x - z1.y * z2.y, z1.x * z2.y + z1.y * z2.x );
}

// function calculates z^n
// z - complex number
// n - natural number
vec2 complexPow( vec2 z, float n )
{
	float modulusN = pow( length( z ), n );
	float arg = atan( z.y, z.x );

	return vec2( modulusN * cos( arg * n ), modulusN * sin( arg * n ) );
}

vec2 g(vec2 z, vec2 a, vec2 b)
{
    return complexMult( a, z ) + b;
}

vec2 W(vec2 z, float n, vec2 m, vec2 r)
{
    vec2 zn = complexPow( z, n );
    vec2 mz = complexMult( m, z );

    return zn + mz + r;
}

float juliaIterate(vec2 z0)
{
    float R1 = max( length( julia.c ), length( julia.b ) );
    float R2 = pow( (2.0 + julia.alpha + (1.0 - julia.alpha) * length( julia.m )) / (1.0 - julia.alpha), 1.0 / (julia.n - 1.0) );
    //float R = pow( max( R1, R2 ), 2.0 );
    float R = max( R1, R2 );

    vec2 z = z0;
    int i = 0;
    //while( dot( z, z ) < R && i < julia.K )
    while( sqrt( dot( z, z ) ) < R && i < julia.K )
    {
        z = julia.alpha * g( z, julia.a, julia.b ) + (1.0 - julia.alpha) * W( z, julia.n, julia.m, julia.c );
        ++i;
    }

    return float( i ) / float( julia.K );
}