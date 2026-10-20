// The ODE library for the Fun page. Each entry is exactly what the editor takes:
//   eq      the three right-hand sides (dx/dt, dy/dt, dz/dt)
//   params  constants, single letters
//   start   optional starting point (matters for systems with several behaviours)
//   flow    true: launch comets from random points and show the whole flow (sinks, limit cycles...)
//           false/absent: show the attractor
// Every entry here was run through the same fitter the editor uses before being listed.
window.ODE_LIBRARY = [

  // ---------- fun ----------
  { id: 'galaxy', group: 'fun', name: 'Galaxy',
    blurb: 'Launch comets from random points and watch them wind in: a spiral eye, a great sweeping loop, a swirl in between. Four-Wing with a sin(xz) twist.',
    eq: ['ax + yz + sin(xz)', 'bx + cy − xz', '−z − xy − yz'], params: 'a = 0.2, b = 0.01, c = −0.4', flow: true, span: 4 },
  { id: 'spiral-sink', group: 'fun', name: 'Spiral sink',
    blurb: 'Everything slowly spirals into the middle. The simplest galaxy you can write down.',
    eq: ['−ax − y', 'x − ay', '−bz'], params: 'a = 0.08, b = 0.2', flow: true, span: 4 },
  { id: 'thomas-tangle', group: 'fun', name: 'Thomas, less friction',
    blurb: 'Thomas’ cyclically symmetric system with the friction turned down to b = 0.1: a sprawling, tangled lattice.',
    eq: ['sin y − bx', 'sin z − by', 'sin x − bz'], params: 'b = 0.1' },
  { id: 'sprott-quadratic', group: 'fun', name: 'Quadratic knot',
    blurb: 'A conservative flow built from a handful of quadratic terms. It never settles and never repeats.',
    eq: ['y + 2xy + xz', '1 − 2x² + yz', 'x − x² − y²'], params: '', start: '-0.68, 0.42, -1.3' },
  { id: 'newton-leipnik', group: 'fun', name: 'Newton–Leipnik',
    blurb: 'Famous for having two strange attractors side by side. Which one you land on depends on where you start.',
    eq: ['−ax + y + 10yz', '−x − ay + 5xz', 'bz − 5xy'], params: 'a = 0.4, b = 0.175' },

  // ---------- standard ----------
  { id: 'lorenz', group: 'standard', name: 'Lorenz',
    blurb: 'The butterfly: the convection model that made “chaos” famous.',
    eq: ['σ(y − x)', 'x(ρ − z) − y', 'xy − βz'], params: 'σ = 10, ρ = 28, β = 8/3' },
  { id: 'rossler', group: 'standard', name: 'Rössler',
    blurb: 'One folded band: chaos with the fewest ingredients.',
    eq: ['−y − z', 'x + ay', 'b + z(x − c)'], params: 'a = 0.2, b = 0.2, c = 5.7' },
  { id: 'chen', group: 'standard', name: 'Chen',
    blurb: 'Lorenz’s restless cousin: similar wings, more twisting.',
    eq: ['a(y − x)', '(c − a)x − xz + cy', 'xy − bz'], params: 'a = 35, b = 3, c = 28' },
  { id: 'lu', group: 'standard', name: 'Lü',
    blurb: 'Sits between Lorenz and Chen.',
    eq: ['a(y − x)', 'cy − xz', 'xy − bz'], params: 'a = 36, b = 3, c = 20' },
  { id: 'chua', group: 'standard', name: 'Chua’s double scroll',
    blurb: 'From an electronic circuit with a piecewise-linear resistor. The abs() terms build that resistor. p and q are its two slopes.',
    eq: ['α(y − x − qx − (p − q)(abs(x + 1) − abs(x − 1))/2)', 'x − y + z', '−βy'], params: 'α = 15.6, β = 28, p = -8/7, q = -5/7' },
  { id: 'rucklidge', group: 'standard', name: 'Rucklidge',
    blurb: 'Two-lobed chaos from a model of double-diffusive convection.',
    eq: ['−κx + λy − yz', 'x', '−z + y²'], params: 'κ = 2, λ = 6.7' },
  { id: 'burke-shaw', group: 'standard', name: 'Burke–Shaw',
    blurb: 'A Lorenz-like system with a two-lobed attractor.',
    eq: ['−s(x + y)', '−y − sxz', 'sxy + V'], params: 's = 10, V = 4.272' },
  { id: 'arneodo', group: 'standard', name: 'Arneodo',
    blurb: 'A “jerk” system: one third-order equation, written as three first-order ones.',
    eq: ['y', 'z', '5.5x − 3.5y − z − x³'], params: '' },
  { id: 'nose-hoover', group: 'standard', name: 'Nosé–Hoover',
    blurb: 'A thermostat model from molecular dynamics. Conservative: chaos only from some starting points, tori from others.',
    eq: ['y', '−x + yz', '1 − y²'], params: '', start: '0.89, 3.46, 1.87' },
  { id: 'van-der-pol', group: 'standard', name: 'Van der Pol',
    blurb: 'A self-sustained oscillator. From inside or outside, every comet winds onto the same closed loop.',
    eq: ['y', 'μ(1 − x²)y − x', '−z'], params: 'μ = 2', flow: true, span: 4 },
  { id: 'hopf', group: 'standard', name: 'Hopf whirlpool',
    blurb: 'A circle that appears out of nothing as m passes zero. Comets from inside and outside both wind onto it.',
    eq: ['mx − y − x(x² + y²)', 'x + my − y(x² + y²)', '−z'], params: 'm = 1', flow: true, span: 3 },
  { id: 'duffing', group: 'standard', name: 'Duffing double well',
    blurb: 'Two valleys with a hill between. Each comet rolls into one of them, depending on where it starts.',
    eq: ['y', 'x − x³ − dy', '−z'], params: 'd = 0.25', flow: true, span: 3 },
  { id: 'pendulum', group: 'standard', name: 'Damped pendulum',
    blurb: 'A pendulum losing energy, winding into one of its resting points.',
    eq: ['y', '−sin x − dy', '−z'], params: 'd = 0.15', flow: true, span: 5 },
];
