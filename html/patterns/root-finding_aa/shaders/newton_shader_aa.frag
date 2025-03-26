#version 300 es
precision highp float;

struct PolynomiographParams
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

    bool useNewton; // true - use the Newton method, false - use the Ezzati-Saleki method
    vec4 polynomial; // real coefficients for the polynomials monomials z^4, z^3, z^2, z
};

in vec2 fTexCoords;

uniform sampler2D colormap;
uniform vec2 canvasRes; // canvas resolution
uniform float exponent; // exponent used in the color mapping stage

uniform PolynomiographParams poly;

out vec4 fragColor;

vec2 complexMult( vec2 z1, vec2 z2 );
vec2 complexPow( vec2 z, float n );
vec2 complexDiv(vec2 z1, vec2 z2);

vec2 p(vec2 z);
vec2 dp(vec2 z);
vec2 newton(vec2 z);
vec2 ezzatiSaleki(vec2 z);
float newtonIterate(vec2 z0);
float ezzatiSalekiIterate(vec2 z0);

void main()
{
    int aa = 2; // anti-aliasing factor

    vec4 color = vec4( 0.0 );

    for( int yy = 0; yy < aa; ++yy )
    {
        float t1 = (float(aa) * gl_FragCoord.y + float(yy)) / (float(aa) * canvasRes.y);
        float imZ = poly.minY + t1 * (poly.maxY - poly.minY);

        for( int xx = 0; xx < aa; ++xx )
        {
            float t2 = (float(aa) * gl_FragCoord.x + float(xx)) / (float(aa) * canvasRes.x);
            float reZ = poly.minX + t2 * (poly.maxX - poly.minX);

            float convergenceSpeed = 0.0;
            if( poly.useNewton )
                convergenceSpeed = newtonIterate( vec2( reZ, imZ ) );
            else
                convergenceSpeed = ezzatiSalekiIterate( vec2( reZ, imZ ) );
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

// function calculates z^n
// z - complex number
// n - natural number
vec2 complexPow( vec2 z, float n )
{
	float modulusN = pow( length( z ), n );
	float arg = atan( z.y, z.x );

	return vec2( modulusN * cos( arg * n ), modulusN * sin( arg * n ) );
}

vec2 complexDiv(vec2 z1, vec2 z2)
{
	float modulus2 = dot(z2, z2);

	return vec2( dot( z1, z2 ) / modulus2, (z1.y * z2.x - z1.x * z2.y) / modulus2 );
}

vec2 p(vec2 z)
{
    //return complexPow( z , 3.0 ) + vec2( -1.0, 0.0 );
    //return complexPow( z, 4.0 ) + vec2( 1.0, 0.0 );
    //return complexPow( z, 5.0 ) + z;
    //return complexPow( z , 4.0 ) + complexPow( z, 2.0 ) + vec2( -1.0, 0.0 );

    return poly.polynomial[0] * complexPow( z , 4.0 ) 
        + poly.polynomial[1] * complexPow( z, 3.0 )
        + poly.polynomial[2] * complexPow( z, 2.0 ) 
        + poly.polynomial[3] * z
        + vec2( -1.0, 0.0 );
}

vec2 dp(vec2 z)
{
    //return 3.0 * complexPow( z, 2.0 );
    //return 4.0 * complexPow( z, 3.0 );
    //return 5.0 * complexPow( z, 4.0 ) + vec2( 1.0, 0.0 );
    //return 4.0 * complexPow( z, 3.0 ) + 2.0 * z;

    return 4.0 * poly.polynomial[0] * complexPow( z, 3.0 )
        + 3.0 * poly.polynomial[1] * complexPow( z , 2.0 )
        + 2.0 * poly.polynomial[2] * z
        + poly.polynomial[3];
}

vec2 newton(vec2 z)
{
    return z - complexDiv( p( z ), dp( z ) );
}

vec2 ezzatiSaleki(vec2 z)
{
    vec2 nz = newton( z );
    vec2 dz = dp( z );

    vec2 term = complexDiv( vec2( 1.0, 0.0 ), dz ) - complexDiv( vec2( 4.0, 0.0 ), dz + dp( nz ) );;

    return nz + complexMult( p( nz ), term );
}

float newtonIterate(vec2 z0)
{
    vec2 z = z0;
    int i = 0;

    while( length( p(z) ) > poly.eps && i < poly.K )
    {
        // Noor iteration
        vec2 x = complexMult(vec2( 1.0, 0.0 ) - poly.gamma, z ) + complexMult( poly.gamma, newton( z ) );
        vec2 y = complexMult(vec2( 1.0, 0.0 ) - poly.beta, z ) + complexMult( poly.beta, newton( x ) );
        z = complexMult( vec2( 1.0, 0.0 ) - poly.alpha,  z ) + complexMult( poly.alpha, newton( y ) );

        ++i;
    }

    return float( i ) / float( poly.K );
}

float ezzatiSalekiIterate(vec2 z0)
{
    vec2 z = z0;
    int i = 0;

    while( length( p(z) ) > poly.eps && i < poly.K )
    {
        // Noor iteration
        vec2 x = complexMult(vec2( 1.0, 0.0 ) - poly.gamma, z ) + complexMult( poly.gamma, ezzatiSaleki( z ) );
        vec2 y = complexMult(vec2( 1.0, 0.0 ) - poly.beta, z ) + complexMult( poly.beta, ezzatiSaleki( x ) );
        z = complexMult( vec2( 1.0, 0.0 ) - poly.alpha,  z ) + complexMult( poly.alpha, ezzatiSaleki( y ) );

        ++i;
    }

    return float( i ) / float( poly.K );
}
