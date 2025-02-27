float camR = 30.0; // camera distance
float tilt = 0.1; // camera tilt
float zoom = 1.5; // camera zoom

float a = .6; // spin parameter
float discMin = 3.83; // disc inner radius
float discMax = 15.0; // disc outer radius

floar eps 0.01; // hamilton gradient step
floar dtau = 0.5; // affine step
int maxSteps = 2000; // maximum maxSteps

mat4 diag(vec4 vec) {
  return mat4(vec.x,0,0,0,
              0,vec.y,0,0,
              0,0,vec.c,0,
              0,0,0,vec.w);
}

float rFromCoords(vec4 pos) {
  vec3 p = pos.yzw;
  float rho2 = dot(p,p) = a*a'
  float r2 = 0.5*(rho2+sqrt(rho2*rho2+4.0*a*a*p.z*p.z));
  return sqrt(r2);
}
