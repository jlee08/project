// src/data/astronomyFacts.ts

export interface AstronomyFact {
  id: string;
  title: string;
  description: string;
  category: 'Basic' | 'Planets' | 'Stars' | 'Galaxies' | 'Phenomena' | 'Exploration';
  fact: string;
}

export const astronomyFacts: AstronomyFact[] = [
  {
    id: 'fact-001',
    title: 'The Speed of Light',
    description: 'Light travels at incredible speeds',
    category: 'Basic',
    fact: 'Light travels at approximately 299,792,458 meters per second in a vacuum, making it the fastest thing in the universe.'
  },
  {
    id: 'fact-002',
    title: 'Jupiter\'s Great Red Spot',
    description: 'A storm larger than Earth',
    category: 'Planets',
    fact: 'Jupiter\'s Great Red Spot is a giant storm that has been raging for at least 400 years and is larger than Earth.'
  },
  {
    id: 'fact-003',
    title: 'Neutron Star Density',
    description: 'Incredibly dense stellar remnants',
    category: 'Stars',
    fact: 'A neutron star is so dense that a teaspoon of its material would weigh about 6 billion tons on Earth.'
  },
  {
    id: 'fact-004',
    title: 'The Milky Way\'s Age',
    description: 'Our galaxy is ancient',
    category: 'Galaxies',
    fact: 'The Milky Way galaxy is approximately 13.6 billion years old, almost as old as the universe itself.'
  },
  {
    id: 'fact-005',
    title: 'Black Hole Event Horizon',
    description: 'The point of no return',
    category: 'Phenomena',
    fact: 'The event horizon of a black hole is the boundary beyond which nothing, not even light, can escape.'
  },
  {
    id: 'fact-006',
    title: 'Voyager 1\'s Journey',
    description: 'Humanity\'s farthest traveler',
    category: 'Exploration',
    fact: 'Voyager 1 is now in interstellar space, over 14 billion miles from Earth, and still sending data back.'
  },
  {
    id: 'fact-007',
    title: 'Venus\'s Retrograde Rotation',
    description: 'Backwards spinning planet',
    category: 'Planets',
    fact: 'Venus rotates backwards compared to most planets, likely due to a massive collision in its past.'
  },
  {
    id: 'fact-008',
    title: 'Solar System Formation',
    description: 'Birth of our cosmic neighborhood',
    category: 'Basic',
    fact: 'Our solar system formed about 4.6 billion years ago from the gravitational collapse of a giant molecular cloud.'
  },
  {
    id: 'fact-009',
    title: 'Supernova Explosions',
    description: 'Stellar death creates elements',
    category: 'Stars',
    fact: 'Supernovae create and distribute heavy elements throughout the universe, including those essential for life.'
  },
  {
    id: 'fact-010',
    title: 'Dark Matter Mystery',
    description: 'The invisible universe',
    category: 'Phenomena',
    fact: 'Dark matter makes up about 27% of the universe, but we can only detect it through its gravitational effects.'
  },
  {
    id: 'fact-011',
    title: 'Saturn\'s Density',
    description: 'A planet that could float',
    category: 'Planets',
    fact: 'Saturn is less dense than water - if you could find an ocean big enough, Saturn would float.'
  },
  {
    id: 'fact-012',
    title: 'The Hubble Constant',
    description: 'Universe expansion rate',
    category: 'Basic',
    fact: 'The universe is expanding at about 70 kilometers per second per megaparsec, known as the Hubble Constant.'
  },
  {
    id: 'fact-013',
    title: 'Andromeda Galaxy Collision',
    description: 'Our galactic future',
    category: 'Galaxies',
    fact: 'The Andromeda Galaxy is approaching the Milky Way and will collide with it in about 4.5 billion years.'
  },
  {
    id: 'fact-014',
    title: 'Cosmic Microwave Background',
    description: 'Echo of the Big Bang',
    category: 'Phenomena',
    fact: 'The cosmic microwave background radiation is the afterglow of the Big Bang, detectable throughout the universe.'
  },
  {
    id: 'fact-015',
    title: 'Mars Day Length',
    description: 'Similar to Earth\'s day',
    category: 'Planets',
    fact: 'A day on Mars is about 24 hours and 37 minutes, very similar to Earth\'s 24-hour day.'
  },
  {
    id: 'fact-016',
    title: 'Alpha Centauri Distance',
    description: 'Our nearest stellar neighbor',
    category: 'Stars',
    fact: 'Alpha Centauri, the nearest star system to Earth, is about 4.37 light-years away.'
  },
  {
    id: 'fact-017',
    title: 'International Space Station Speed',
    description: 'Racing around Earth',
    category: 'Exploration',
    fact: 'The International Space Station orbits Earth at approximately 28,000 kilometers per hour.'
  },
  {
    id: 'fact-018',
    title: 'Observable Universe Size',
    description: 'The limits of what we can see',
    category: 'Basic',
    fact: 'The observable universe is about 93 billion light-years in diameter, despite being only 13.8 billion years old.'
  },
  {
    id: 'fact-019',
    title: 'White Dwarf Stars',
    description: 'Stellar retirement homes',
    category: 'Stars',
    fact: 'White dwarf stars are the final stage for stars like our Sun, slowly cooling over billions of years.'
  },
  {
    id: 'fact-020',
    title: 'Galactic Cannibalism',
    description: 'Galaxies eating galaxies',
    category: 'Galaxies',
    fact: 'Large galaxies grow by consuming smaller galaxies in a process called galactic cannibalism.'
  },
  {
    id: 'fact-021',
    title: 'Solar Wind',
    description: 'The Sun\'s constant breeze',
    category: 'Phenomena',
    fact: 'The solar wind is a stream of charged particles constantly flowing from the Sun at speeds of 400-800 km/s.'
  },
  {
    id: 'fact-022',
    title: 'Mercury\'s Temperature Extremes',
    description: 'Hot days, cold nights',
    category: 'Planets',
    fact: 'Mercury\'s surface temperatures range from 427°C (800°F) during the day to -173°C (-280°F) at night.'
  },
  {
    id: 'fact-023',
    title: 'Betelgeuse Supergiant',
    description: 'A star ready to explode',
    category: 'Stars',
    fact: 'Betelgeuse is a red supergiant star that could explode as a supernova anytime in the next 100,000 years.'
  },
  {
    id: 'fact-024',
    title: 'Apollo 11 Computer Power',
    description: 'Less power than a smartphone',
    category: 'Exploration',
    fact: 'The Apollo 11 guidance computer had less processing power than a modern calculator or smartphone.'
  },
  {
    id: 'fact-025',
    title: 'Cosmic Rays',
    description: 'High-energy space particles',
    category: 'Phenomena',
    fact: 'Cosmic rays are high-energy particles from space that constantly bombard Earth\'s atmosphere.'
  },
  {
    id: 'fact-026',
    title: 'Uranus\'s Unique Rotation',
    description: 'Rolling through space',
    category: 'Planets',
    fact: 'Uranus rotates on its side with an axial tilt of about 98 degrees, likely due to an ancient collision.'
  },
  {
    id: 'fact-027',
    title: 'Pulsar Precision',
    description: 'Nature\'s most accurate clocks',
    category: 'Stars',
    fact: 'Pulsars are rotating neutron stars that emit beams of radiation with timing more precise than atomic clocks.'
  },
  {
    id: 'fact-028',
    title: 'Local Group',
    description: 'Our galactic neighborhood',
    category: 'Galaxies',
    fact: 'The Milky Way is part of the Local Group, containing about 80 galaxies within 10 million light-years.'
  },
  {
    id: 'fact-029',
    title: 'Aurora Formation',
    description: 'Nature\'s light show',
    category: 'Phenomena',
    fact: 'Auroras are created when solar wind particles interact with Earth\'s magnetic field and atmosphere.'
  },
  {
    id: 'fact-030',
    title: 'Titan\'s Atmosphere',
    description: 'Saturn\'s moon with weather',
    category: 'Planets',
    fact: 'Titan, Saturn\'s largest moon, has a thick atmosphere and liquid methane lakes on its surface.'
  },
  {
    id: 'fact-031',
    title: 'Red Giant Phase',
    description: 'The Sun\'s future expansion',
    category: 'Stars',
    fact: 'In about 5 billion years, the Sun will expand into a red giant, potentially engulfing Mercury and Venus.'
  },
  {
    id: 'fact-032',
    title: 'Hubble Space Telescope',
    description: 'Our window to the universe',
    category: 'Exploration',
    fact: 'The Hubble Space Telescope has been observing the universe for over 30 years from 547 kilometers above Earth.'
  },
  {
    id: 'fact-033',
    title: 'Wormhole Theory',
    description: 'Hypothetical space shortcuts',
    category: 'Phenomena',
    fact: 'Wormholes are theoretical tunnels through spacetime that could potentially connect distant regions of the universe.'
  },
  {
    id: 'fact-034',
    title: 'Neptune\'s Winds',
    description: 'Fastest winds in the solar system',
    category: 'Planets',
    fact: 'Neptune has the strongest winds in the solar system, reaching speeds of up to 2,100 kilometers per hour.'
  },
  {
    id: 'fact-035',
    title: 'Binary Star Systems',
    description: 'Stellar dance partners',
    category: 'Stars',
    fact: 'About half of all stars in the Milky Way are part of binary or multiple star systems.'
  },
  {
    id: 'fact-036',
    title: 'Great Attractor',
    description: 'Mysterious gravitational pull',
    category: 'Galaxies',
    fact: 'The Great Attractor is a mysterious region of space pulling our Local Group and thousands of other galaxies toward it.'
  },
  {
    id: 'fact-037',
    title: 'Gravitational Waves',
    description: 'Ripples in spacetime',
    category: 'Phenomena',
    fact: 'Gravitational waves are ripples in spacetime caused by accelerating masses, first detected in 2015.'
  },
  {
    id: 'fact-038',
    title: 'Pluto\'s Reclassification',
    description: 'From planet to dwarf planet',
    category: 'Planets',
    fact: 'Pluto was reclassified as a dwarf planet in 2006 due to not clearing its orbital neighborhood.'
  },
  {
    id: 'fact-039',
    title: 'Brown Dwarf Stars',
    description: 'Failed stars',
    category: 'Stars',
    fact: 'Brown dwarfs are "failed stars" that don\'t have enough mass to sustain nuclear fusion in their cores.'
  },
  {
    id: 'fact-040',
    title: 'Mars Rover Perseverance',
    description: 'Searching for ancient life',
    category: 'Exploration',
    fact: 'NASA\'s Perseverance rover is collecting rock samples on Mars to search for signs of ancient microbial life.'
  },
  {
    id: 'fact-041',
    title: 'Exoplanet Discovery',
    description: 'Worlds beyond our solar system',
    category: 'Phenomena',
    fact: 'Over 5,000 exoplanets have been discovered, with some potentially habitable worlds among them.'
  },
  {
    id: 'fact-042',
    title: 'Europa\'s Hidden Ocean',
    description: 'Jupiter\'s icy moon',
    category: 'Planets',
    fact: 'Europa, one of Jupiter\'s moons, likely has a subsurface ocean containing more water than all Earth\'s oceans combined.'
  },
  {
    id: 'fact-043',
    title: 'Stellar Nurseries',
    description: 'Where stars are born',
    category: 'Stars',
    fact: 'Nebulae are stellar nurseries where gravitational collapse of gas and dust creates new stars.'
  },
  {
    id: 'fact-044',
    title: 'Spiral Galaxy Arms',
    description: 'Waves of star formation',
    category: 'Galaxies',
    fact: 'Spiral galaxy arms are density waves that trigger star formation as material moves through them.'
  },
  {
    id: 'fact-045',
    title: 'Solar Eclipse Rarity',
    description: 'Cosmic coincidence',
    category: 'Phenomena',
    fact: 'Total solar eclipses are possible because the Moon and Sun appear nearly the same size from Earth by coincidence.'
  },
  {
    id: 'fact-046',
    title: 'Asteroid Belt',
    description: 'Rocky debris between planets',
    category: 'Planets',
    fact: 'The asteroid belt between Mars and Jupiter contains hundreds of thousands of rocky objects.'
  },
  {
    id: 'fact-047',
    title: 'Main Sequence Stars',
    description: 'Stellar middle age',
    category: 'Stars',
    fact: 'Main sequence stars like our Sun spend about 90% of their lives fusing hydrogen into helium in their cores.'
  },
  {
    id: 'fact-048',
    title: 'James Webb Space Telescope',
    description: 'Successor to Hubble',
    category: 'Exploration',
    fact: 'The James Webb Space Telescope can observe the universe in infrared light, seeing through cosmic dust.'
  },
  {
    id: 'fact-049',
    title: 'Redshift Phenomenon',
    description: 'Evidence of expansion',
    category: 'Phenomena',
    fact: 'Redshift in light from distant galaxies provides evidence that the universe is expanding.'
  },
  {
    id: 'fact-050',
    title: 'Goldilocks Zone',
    description: 'Just right for life',
    category: 'Basic',
    fact: 'The habitable zone or "Goldilocks zone" is the region around a star where liquid water can exist on a planet\'s surface.'
  }
];

// 랜덤하게 10개 팩트를 선택하는 함수
export const getRandomFacts = (count: number = 10): AstronomyFact[] => {
  const shuffled = [...astronomyFacts].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// 카테고리별로 팩트를 필터링하는 함수
export const getFactsByCategory = (category: AstronomyFact['category']): AstronomyFact[] => {
  return astronomyFacts.filter(fact => fact.category === category);
};
