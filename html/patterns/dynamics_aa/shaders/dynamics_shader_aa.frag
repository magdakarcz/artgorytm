#version 300 es
precision highp float;

struct PatternParams
{
    float minX;
    float maxX;
    float minY;
    float maxY;

    float eps;
    int K;
    vec2 alpha;
    vec2 beta;
    vec2 gamma;

    bool patternType; // true - pattern 1, false - pattern 2
};

in vec2 fTexCoords;

uniform sampler2D colormap;
uniform vec2 canvasRes; // canvas resolution
uniform float exponent; // exponent used in the color mapping stage

uniform PatternParams pattern;

out vec4 fragColor;

vec2 complexMult( vec2 z1, vec2 z2 );
vec2 pattern1(vec2 p);
vec2 pattern2(vec2 p);
float pattern1Iterate(vec2 z0);
float pattern2Iterate(vec2 z0);

void main()
{
    int aa = 2; // anti-aliasing factor

    vec4 color = vec4( 0.0 );

    for( int yy = 0; yy < aa; ++yy )
    {
        float t1 = (float(aa) * gl_FragCoord.y + float(yy)) / (float(aa) * canvasRes.y);
        float imZ = pattern.minY + t1 * (pattern.maxY - pattern.minY);

        for( int xx = 0; xx < aa; ++xx )
        {
            float t2 = (float(aa) * gl_FragCoord.x + float(xx)) / (float(aa) * canvasRes.x);
            float reZ = pattern.minX + t2 * (pattern.maxX - pattern.minX);

            float convergenceSpeed = 0.0;
            if( pattern.patternType )
                convergenceSpeed = pattern1Iterate( vec2( reZ, imZ ) );
            else
                convergenceSpeed = pattern2Iterate( vec2( reZ, imZ ) );
            convergenceSpeed = pow( convergenceSpeed, exponent );

            //color += texture( colormap, vec2( convergenceSpeed, 0.0 ) );
            if( abs(convergenceSpeed - 1.0 ) < 0.0001 )
                color += vec4( 0.0, 0.0, 0.0, 1.0 );
            else
                color += texture( colormap, vec2( convergenceSpeed, 0.0 ) );
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

vec2 pattern1(vec2 p)
{
    float x = 0.5 * sin( 2.0 * p.x ) * abs( cos( 1.0 * p.y ) ) + 0.5 * sin( 1.0 * p.x ) * abs( cos( 2.0 * p.y ) );
    float y = 0.5 * abs( cos( 1.0 * p.x ) ) * sin( 2.0 * p.y ) + 0.5 * abs( cos( 0.5 * p.x ) ) * sin( 1.0 * p.y );

	return vec2( p.x - x, p.y - y );
}

vec2 pattern2(vec2 p)
{
    float A = sqrt( 3.0 ) / 2.0;
	float B = 1.0 / sqrt( 3.0 );
	float C = 2.0 / sqrt( 3.0 );
	float r = 0.2;
	float s = 0.1;

	vec2 q1 = vec2( 0.5 * p.x - A * p.y, A * p.x + 0.5 * p.y );
    vec2 q2 = vec2( -0.5 * p.x - A * p.y, A * p.x - 0.5 * p.y );

	float hxy = sin( p.x ) * cos( C * p.y );
    vec2 h = vec2( sin( q1.x ) * cos( C * q1.y ), sin( q2.x ) * cos( C * q2.y ) );

	float fxy = r * 2.0 * hxy + s * 2.0 * h.x + (s - r) * 2.0 * h.y;
    float f1xy = r * 2.0 * h.x + s * 2.0 * h.y - (s - r) * 2.0 * hxy;

	float gxy = B * fxy - C * f1xy;

	return vec2( p.x - fxy, p.y - gxy );
}

float pattern1Iterate(vec2 z0)
{
    vec2 z = z0;
    int i = 0;

    while( i < pattern.K )
    {
        vec2 x = complexMult(vec2( 1.0, 0.0 ) - pattern.gamma, z ) + complexMult( pattern.gamma, pattern1( z ) );
        vec2 y = complexMult(vec2( 1.0, 0.0 ) - pattern.beta, z ) + complexMult( pattern.beta, pattern1( x ) );
        vec2 zn = complexMult( vec2( 1.0, 0.0 ) - pattern.alpha,  z ) + complexMult( pattern.alpha, pattern1( y ) );

        if( length( zn - z ) < pattern.eps )
        {
            z = zn;
            break;
        }

        z = zn;
        ++i;
    }

    return float( i ) / float( pattern.K );
}

float pattern2Iterate(vec2 z0)
{
    vec2 z = z0;
    int i = 0;

    while( i < pattern.K )
    {
        vec2 x = complexMult(vec2( 1.0, 0.0 ) - pattern.gamma, z ) + complexMult( pattern.gamma, pattern2( z ) );
        vec2 y = complexMult(vec2( 1.0, 0.0 ) - pattern.beta, z ) + complexMult( pattern.beta, pattern2( x ) );
        vec2 zn = complexMult( vec2( 1.0, 0.0 ) - pattern.alpha,  z ) + complexMult( pattern.alpha, pattern2( y ) );

        if( length( zn - z ) < pattern.eps )
        {
            z = zn;
            break;
        }

        z = zn;
        ++i;
    }

    return float( i ) / float( pattern.K );
}
