#version 300 es
precision highp float;

struct MandelbrotSetParams
{
    float minX;
    float maxX;
    float minY;
    float maxY;

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

uniform MandelbrotSetParams mandelbrot;

out vec4 fragColor;

vec2 complexMult( vec2 z1, vec2 z2 );
vec2 complexPow( vec2 z, float n );

vec2 g(vec2 z, vec2 a, vec2 b);
vec2 W(vec2 z, float n, vec2 m, vec2 r);
float mandelbrotIterate(vec2 p);

void main()
{
    int aa = 2; // anti-aliasing factor

    vec4 color = vec4( 0.0 );

    for( int yy = 0; yy < aa; ++yy )
    {
        float t1 = (float(aa) * gl_FragCoord.y + float(yy)) / (float(aa) * canvasRes.y);
        float imZ = mandelbrot.minY + t1 * (mandelbrot.maxY - mandelbrot.minY);

        for( int xx = 0; xx < aa; ++xx )
        {
            float t2 = (float(aa) * gl_FragCoord.x + float(xx)) / (float(aa) * canvasRes.x);
            float reZ = mandelbrot.minX + t2 * (mandelbrot.maxX - mandelbrot.minX);

            float escapeTime = mandelbrotIterate( vec2( reZ, imZ ) );
            escapeTime = pow( escapeTime, exponent );

            if( abs(escapeTime - 1.0 ) < 0.0001 )
                color += vec4( 0.0, 0.0, 0.0, 1.0 );
            else
                color += texture( colormap, vec2( escapeTime, 0.0 ) );
        }
    }

    color /= float( aa * aa );
    fragColor = vec4( color.rgb, 1.0 );

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

float mandelbrotIterate(vec2 r)
{
    float R1 = max( length( r ), length( mandelbrot.b ) );
    float R2 = pow( (2.0 + mandelbrot.alpha + (1.0 - mandelbrot.alpha) * length( mandelbrot.m )) / (1.0 - mandelbrot.alpha), 1.0 / (mandelbrot.n - 1.0) );
    float R = max( R1, R2 );

    vec2 z = r;
    int i = 0;
    while( sqrt( dot( z, z ) ) < R && i < mandelbrot.K )
    {
        z = mandelbrot.alpha * g( z, mandelbrot.a, mandelbrot.b ) + (1.0 - mandelbrot.alpha) * W( z, mandelbrot.n, mandelbrot.m, r );
        ++i;
    }

    return float( i ) / float( mandelbrot.K );
}