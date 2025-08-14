import type { Quiz } from './types'

export const quizzes: Quiz[] = [
    {
    moduleId: 'Module-1-Introduction-to-Astronomy',
    title: 'Introduction to Astronomy',
    questions: [
      // Multiple-choice questions
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'Which problem does adaptive optics technology solve?',
        options: [
          'Chromatic aberration of telescopes',
          'Image blurring caused by atmospheric turbulence',
          'Weight of telescope mirrors',
          'Limitation of observation time'
        ],
        correctAnswer: 1,
        explanation: 'Adaptive optics corrects image blurring caused by atmospheric turbulence in real time, enabling clearer observations.'
      },
      {
        id: 'q2',
        type: 'multiple-choice',
        question: 'What is the current value of the Hubble constant in km/s/Mpc?',
        options: [
          '50',
          '70',
          '100',
          '150'
        ],
        correctAnswer: 1,
        explanation: 'The Hubble constant is about 70 km/s/Mpc and represents the expansion rate of the universe.'
      },
      {
        id: 'q3',
        type: 'multiple-choice',
        question: 'What phenomenon was observed by LIGO when gravitational waves were first directly detected?',
        options: [
          'Neutron star collision',
          'Black hole merger',
          'Supernova explosion',
          'Quasar activity'
        ],
        correctAnswer: 1,
        explanation: 'In 2015, LIGO directly detected gravitational waves from the merger of two black holes for the first time.'
      },
      {
        id: 'q4',
        type: 'multiple-choice',
        question: 'What is the principle of the radial velocity method used for exoplanet detection?',
        options: [
          'Phenomenon where a planet blocks starlight',
          'Effect of a planet’s gravity shaking the star',
          'Light reflected from the planet',
          'Infrared radiation from the planet'
        ],
        correctAnswer: 1,
        explanation: 'The radial velocity method observes Doppler shifts in the spectrum caused by a planet’s gravity shaking its host star.'
      },
      {
        id: 'q5',
        type: 'multiple-choice',
        question: 'Which hypothesis explains the problem of galaxy rotation curves?',
        options: [
          'Modified Newtonian Dynamics (MOND)',
          'Dark matter',
          'Supermassive black hole',
          'All of the above'
        ],
        correctAnswer: 3,
        explanation: 'The galaxy rotation curve problem is explained by various theories such as dark matter and MOND.'
      },
      {
        id: 'q6',
        type: 'multiple-choice',
        question: 'What is the current temperature of the cosmic microwave background?',
        options: [
          '2.7 K',
          '4.2 K',
          '1.4 K',
          '5.6 K'
        ],
        correctAnswer: 0,
        explanation: 'The current temperature of the cosmic microwave background is about 2.7 K, which is the residual heat from the Big Bang.'
      },
      // Subjective questions
      {
        id: 'q7',
        type: 'subjective',
        question: 'Explain the importance of multi-wavelength astronomy and the observational information provided by each wavelength band.',
        sampleAnswer: 'Multi-wavelength astronomy obtains comprehensive information about celestial objects by observing them simultaneously across various bands of the electromagnetic spectrum. Radio waves show cold gas and molecular clouds, visible light reveals the shapes of stars and galaxies, X-rays show hot plasma and phenomena near black holes, and gamma rays show extremely energetic processes. This allows us to fully understand the physical processes of celestial objects.',
        explanation: 'Each wavelength band reveals different physical processes and temperature ranges, so comprehensive observations are essential.'
      },
      {
        id: 'q8',
        type: 'subjective',
        question: 'Explain the concept of a standard candle and its role in measuring cosmic distances.',
        sampleAnswer: 'A standard candle is a celestial object with a known absolute magnitude, used to measure distance by comparing its apparent magnitude. Type Ia supernovae have similar peak brightness and are key for cosmological distance measurements. Cepheid variables use the period-luminosity relation for intermediate distances, and RR Lyrae variables are used for nearby distances. These form the cosmic distance ladder, enabling determination of the Hubble constant and the size of the universe.',
        explanation: 'Standard candles are essential tools for establishing the cosmic distance scale.'
      },
      {
        id: 'q9',
        type: 'subjective',
        question: 'Describe the process of discovering dark energy and its significance.',
        sampleAnswer: 'In 1998, the Supernova Cosmology Project found that distant Type Ia supernovae were dimmer than expected, indicating accelerated expansion of the universe. The concept of dark energy was introduced to explain this. Dark energy accounts for about 68% of the universe’s total energy and is considered a mysterious repulsive force. This discovery changed the paradigm of cosmology and suggested that the universe’s ultimate fate may be heat death.',
        explanation: 'The discovery of dark energy is one of the most important achievements in modern cosmology.'
      },
      {
        id: 'q10',
        type: 'subjective',
        question: 'Discuss the methods for searching for extraterrestrial life and the limitations of the Drake Equation.',
        sampleAnswer: 'Methods for searching for extraterrestrial life include SETI (radio signal detection), detection of biosignatures on exoplanets, and exploration of life in the Solar System. The Drake Equation estimates the number of communicative civilizations in the galaxy, but its many uncertain variables limit its practical use. Modern approaches focus on analyzing exoplanet atmospheres with telescopes like Kepler and JWST, searching for biomarkers such as oxygen, methane, and water vapor. This allows for a more objective assessment of the possibility of life.',
        explanation: 'The search for extraterrestrial life is becoming more scientific and systematic with technological advances.'
      }
    ]
  },
  // 
  {
  moduleId: 'Module-2-Solar-System',
  title: 'Solar System',
  questions: [
    // 6 multiple-choice questions
    {
      id: 'q1',
      type: 'multiple-choice',
      question: 'What is the boundary formed by the interaction between the solar wind and a planet’s magnetic field?',
      options: [
        'Magnetopause',
        'Heliopause',
        'Bow Shock',
        'Magnetotail'
      ],
      correctAnswer: 0,
      explanation: 'The magnetopause is the boundary where the solar wind and a planet’s magnetic field balance, marking the edge of the Earth’s magnetosphere.'
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      question: 'What is the energy source of volcanic activity on Jupiter’s moon Io?',
      options: [
        'Radioactive decay',
        'Tidal heating',
        'Solar radiation',
        'Residual heat'
      ],
      correctAnswer: 1,
      explanation: 'Io’s volcanic activity is driven by tidal heating caused by the gravitational forces of Jupiter and the other Galilean moons.'
    },
    {
      id: 'q3',
      type: 'multiple-choice',
      question: 'What does the detection of methane on Mars suggest?',
      options: [
        'Evidence of global warming',
        'Possible biological activity or geological processes',
        'Evidence of volcanic activity',
        'Traces of comet impacts'
      ],
      correctAnswer: 1,
      explanation: 'Methane on Mars can be produced by biological or geological processes, suggesting the possibility of life.'
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      question: 'What was the most significant finding of the Cassini spacecraft in the Saturn system?',
      options: [
        'Methane lakes on Titan',
        'Subsurface ocean on Enceladus',
        'Detailed structure of Saturn’s rings',
        'All of the above'
      ],
      correctAnswer: 3,
      explanation: 'The Cassini mission discovered Titan’s methane lakes, Enceladus’s subsurface ocean, and the complex structure of Saturn’s rings.'
    },
    {
      id: 'q5',
      type: 'multiple-choice',
      question: 'What is the main difference between the asteroid belt and the Kuiper belt?',
      options: [
        'Composition (rock vs ice)',
        'Distance from the Sun',
        'Size of celestial bodies',
        'All of the above'
      ],
      correctAnswer: 3,
      explanation: 'The asteroid belt lies between Mars and Jupiter and consists of rocky bodies, while the Kuiper belt lies beyond Neptune and consists of icy bodies.'
    },
    {
      id: 'q6',
      type: 'multiple-choice',
      question: 'What is the most likely cause of Venus’s retrograde rotation?',
      options: [
        'Atmospheric friction',
        'Giant impact event',
        'Tidal locking',
        'Effect of magnetic fields'
      ],
      correctAnswer: 1,
      explanation: 'Venus’s retrograde rotation is explained by a giant collision with another body in the early solar system.'
    },
    // 4 subjective/descriptive questions
    {
      id: 'q7',
      type: 'subjective',
      question: 'Explain the orbital resonance among Jupiter’s Galilean moons and its effects.',
      sampleAnswer: 'Io, Europa, and Ganymede are in a 4:2:1 orbital resonance. This means that Io orbits 4 times, Europa orbits twice, and Ganymede orbits once in the same period. This resonance maintains the moons’ orbital eccentricities, sustaining tidal heating. This is crucial for Io’s volcanic activity and for keeping Europa’s subsurface ocean in liquid form, potentially creating an environment for life in the solar system.',
      explanation: 'Orbital resonance plays an important role in the evolution of moon systems and in the habitability potential for life.'
    },
    {
      id: 'q8',
      type: 'subjective',
      question: 'Discuss the history of Mars’s water cycle and the current forms in which water exists.',
      sampleAnswer: 'Early Mars had a thick atmosphere and liquid water, but the loss of its magnetic field allowed the solar wind to strip away the atmosphere, causing the water to disappear. Today, water exists as polar ice, subsurface permafrost, atmospheric vapor, and possibly subsurface brines. Recent observations by the Mars Reconnaissance Orbiter have revealed recurring slope lineae (RSL), suggesting the possibility of limited present-day liquid water activity. This is directly linked to the potential for life on Mars.',
      explanation: 'The history of water on Mars is key to understanding planetary evolution and the potential for habitability.'
    },
    {
      id: 'q9',
      type: 'subjective',
      question: 'Describe the structure of the outer solar system and the discoveries made by the Voyager spacecraft.',
      sampleAnswer: 'The outer solar system consists of the Kuiper belt, the scattered disk, and the Oort cloud. Voyager 1 and 2 crossed the heliopause into interstellar space, measuring the actual size and shape of the heliosphere and the strength of the interstellar magnetic field. They discovered that the plasma density in interstellar space is higher than expected, and that the heliosphere is not spherical but has a complex shape. These findings provide important insights into the interaction between the solar system and the galaxy.',
      explanation: 'The Voyager missions provided direct information on the boundaries of the solar system and interstellar space.'
    },
    {
      id: 'q10',
      type: 'subjective',
      question: 'Discuss why small bodies (asteroids, comets, meteorites) are important for studying the formation of the solar system.',
      sampleAnswer: 'Small bodies preserve primordial material from the time of the solar system’s formation, acting as “time capsules.” Carbonaceous chondrites contain organic compounds and water, suggesting they may have delivered the ingredients for life to Earth. The nuclei of comets reveal the composition of ice and dust in the outer solar system, and isotope ratio studies allow us to infer the conditions of the solar system’s formation. The composition and distribution of the asteroid belt reveal the effects of Jupiter’s gravity and planetary migration. Sample return missions like Hayabusa2 and OSIRIS-REx have made such studies even more precise.',
      explanation: 'Studying small bodies is a key to understanding the formation of the solar system and the origins of life.'
    }
  ]
},


  // Module 3: Stars and Stellar Evolution (English)
  {
    moduleId: 'Module-3-Stars-and-Stellar-Evolution',
    title: 'Stars and Stellar Evolution',
    questions: [
      // Multiple-choice questions
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'What is the primary energy source for main sequence stars?',
        options: [
          'Gravitational contraction',
          'Nuclear fusion of hydrogen into helium',
          'Radioactive decay',
          'Chemical reactions'
        ],
        correctAnswer: 1,
        explanation: 'Main sequence stars generate energy by fusing hydrogen into helium in their cores.'
      },
      {
        id: 'q2',
        type: 'multiple-choice',
        question: 'Which property determines the lifetime of a star on the main sequence?',
        options: [
          'Temperature',
          'Luminosity',
          'Mass',
          'Radius'
        ],
        correctAnswer: 2,
        explanation: 'A star’s mass is the primary factor that determines its main sequence lifetime.'
      },
      {
        id: 'q3',
        type: 'multiple-choice',
        question: 'What is a white dwarf?',
        options: [
          'A massive star in the process of forming',
          'A remnant core of a low- or intermediate-mass star after shedding its outer layers',
          'A star that is about to explode as a supernova',
          'A star in the red giant phase'
        ],
        correctAnswer: 1,
        explanation: 'A white dwarf is the dense, hot core left behind after a low- or intermediate-mass star expels its outer layers.'
      },
      {
        id: 'q4',
        type: 'multiple-choice',
        question: 'Which event marks the end of a massive star’s life?',
        options: [
          'Becoming a white dwarf',
          'Supernova explosion',
          'Planetary nebula ejection',
          'Becoming a brown dwarf'
        ],
        correctAnswer: 1,
        explanation: 'Massive stars end their lives in a supernova explosion, leaving behind a neutron star or black hole.'
      },
      {
        id: 'q5',
        type: 'multiple-choice',
        question: 'What is the Hertzsprung-Russell (H-R) diagram used for?',
        options: [
          'Classifying galaxies',
          'Plotting stars according to their luminosity and temperature',
          'Measuring distances to stars',
          'Studying planetary orbits'
        ],
        correctAnswer: 1,
        explanation: 'The H-R diagram plots stars by luminosity and temperature, revealing patterns of stellar evolution.'
      },
      {
        id: 'q6',
        type: 'multiple-choice',
        question: 'What is a neutron star?',
        options: [
          'A star made entirely of neutrons, formed after a supernova',
          'A star in the process of forming',
          'A type of white dwarf',
          'A planet-sized star'
        ],
        correctAnswer: 0,
        explanation: 'A neutron star is the collapsed core of a massive star, composed almost entirely of neutrons.'
      },
      // Subjective questions
      {
        id: 'q7',
        type: 'subjective',
        question: 'Explain the process of stellar nucleosynthesis and its significance.',
        sampleAnswer: 'Stellar nucleosynthesis is the process by which elements are formed within stars through nuclear fusion. It is responsible for creating most elements heavier than hydrogen and helium, enriching the universe with the building blocks for planets and life.',
        explanation: 'Stellar nucleosynthesis explains the origin of chemical elements and the evolution of matter in the universe.'
      },
      {
        id: 'q8',
        type: 'subjective',
        question: 'Describe the life cycle of a low-mass star like the Sun.',
        sampleAnswer: 'A low-mass star forms from a molecular cloud, spends most of its life fusing hydrogen on the main sequence, becomes a red giant, sheds its outer layers as a planetary nebula, and ends as a white dwarf.',
        explanation: 'The life cycle of a low-mass star involves several stages, ending with a white dwarf remnant.'
      },
      {
        id: 'q9',
        type: 'subjective',
        question: 'What are the observational signatures of a supernova?',
        sampleAnswer: 'Supernovae are observed as sudden, dramatic increases in brightness, followed by a gradual fading. They may also produce characteristic spectra, neutrino bursts, and expanding remnants visible in various wavelengths.',
        explanation: 'Supernovae are identified by their light curves, spectra, and remnants.'
      },
      {
        id: 'q10',
        type: 'subjective',
        question: 'Discuss the importance of binary star systems in stellar evolution.',
        sampleAnswer: 'Binary star systems allow for mass transfer between stars, leading to phenomena such as novae, X-ray binaries, and Type Ia supernovae. They provide key insights into stellar evolution and end states.',
        explanation: 'Binary interactions can dramatically alter the evolution and fate of stars.'
      }
    ]
  },
  // Module 4: Galaxies and Large-Scale Structure (English)
  {
    moduleId: 'Module-4-Galaxies-and-Large-Scale-Structure',
    title: 'Galaxies and Large-Scale Structure',
    questions: [
      // Multiple-choice questions
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'What is the primary component of the Milky Way’s dark matter halo?',
        options: [
          'Neutrinos',
          'Molecular clouds',
          'Unseen non-baryonic matter',
          'Stellar remnants'
        ],
        correctAnswer: 2,
        explanation: 'The dark matter halo is thought to be composed mainly of non-baryonic, weakly interacting massive particles (WIMPs) or similar candidates.'
      },
      {
        id: 'q2',
        type: 'multiple-choice',
        question: 'Which type of galaxy is characterized by a smooth, featureless light profile and little gas or dust?',
        options: [
          'Spiral galaxy',
          'Elliptical galaxy',
          'Irregular galaxy',
          'Lenticular galaxy'
        ],
        correctAnswer: 1,
        explanation: 'Elliptical galaxies have smooth, featureless profiles and contain little interstellar gas or dust.'
      },
      {
        id: 'q3',
        type: 'multiple-choice',
        question: 'What is the main evidence for the existence of supermassive black holes at the centers of galaxies?',
        options: [
          'High-velocity stellar orbits',
          'Strong X-ray emission',
          'Jets and radio lobes',
          'All of the above'
        ],
        correctAnswer: 3,
        explanation: 'All of these phenomena are observed in galactic centers and are best explained by the presence of supermassive black holes.'
      },
      {
        id: 'q4',
        type: 'multiple-choice',
        question: 'Which structure is the largest in the universe?',
        options: [
          'Galaxy',
          'Galaxy cluster',
          'Supercluster',
          'Filament'
        ],
        correctAnswer: 3,
        explanation: 'Cosmic filaments are the largest known structures, forming the “cosmic web” of galaxies and clusters.'
      },
      {
        id: 'q5',
        type: 'multiple-choice',
        question: 'What is the Tully-Fisher relation used for?',
        options: [
          'Measuring galaxy mass',
          'Estimating galaxy distance',
          'Classifying galaxy type',
          'Determining star formation rate'
        ],
        correctAnswer: 1,
        explanation: 'The Tully-Fisher relation links the luminosity of a spiral galaxy to its rotation speed, allowing distance estimation.'
      },
      {
        id: 'q6',
        type: 'multiple-choice',
        question: 'Which of the following best describes a galaxy merger?',
        options: [
          'A galaxy splitting into two',
          'Two galaxies colliding and combining',
          'A galaxy forming from intergalactic gas',
          'A star cluster merging with a galaxy'
        ],
        correctAnswer: 1,
        explanation: 'A galaxy merger occurs when two galaxies collide and combine, often triggering starbursts.'
      },
      // Subjective questions
      {
        id: 'q7',
        type: 'subjective',
        question: 'Explain the significance of the Hubble sequence in galaxy classification.',
        sampleAnswer: 'The Hubble sequence is a morphological classification scheme for galaxies, organizing them into ellipticals, spirals, and irregulars. It helps astronomers understand galaxy evolution and the relationships between different types.',
        explanation: 'The Hubble sequence provides a framework for studying galaxy properties and their evolutionary paths.'
      },
      {
        id: 'q8',
        type: 'subjective',
        question: 'Describe the role of dark matter in the formation of large-scale structure in the universe.',
        sampleAnswer: 'Dark matter provides the gravitational scaffolding for the formation of galaxies and clusters. Its presence accelerates the growth of density fluctuations, leading to the cosmic web structure observed today.',
        explanation: 'Without dark matter, the observed large-scale structure could not have formed within the age of the universe.'
      },
      {
        id: 'q9',
        type: 'subjective',
        question: 'What observational evidence supports the existence of galaxy clusters and superclusters?',
        sampleAnswer: 'Evidence includes the spatial clustering of galaxies, gravitational lensing, X-ray emission from hot intracluster gas, and redshift surveys mapping large-scale structures.',
        explanation: 'Multiple lines of evidence confirm the existence and properties of galaxy clusters and superclusters.'
      },
      {
        id: 'q10',
        type: 'subjective',
        question: 'Discuss the importance of the cosmic web and its impact on galaxy evolution.',
        sampleAnswer: 'The cosmic web is the large-scale structure of the universe, consisting of filaments, clusters, and voids. It influences galaxy formation, interactions, and the distribution of matter on cosmic scales.',
        explanation: 'The cosmic web shapes the environment in which galaxies form and evolve.'
      }
    ]
  },
  // Module 8: Planetary Science (English)
  {
    moduleId: 'Module-8-Planetary-Science',
    title: 'Planetary Science',
    questions: [
      // Multiple-choice questions
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'What is comparative planetology?',
        options: [
          'The study of stars and galaxies',
          'The comparison of different planets to understand their formation and evolution',
          'The study of planetary atmospheres only',
          'A method for classifying exoplanets'
        ],
        correctAnswer: 1,
        explanation: 'Comparative planetology compares planets to reveal common processes and differences in their evolution.'
      },
      {
        id: 'q2',
        type: 'multiple-choice',
        question: 'Which planet has the thickest atmosphere in the Solar System?',
        options: [
          'Earth',
          'Venus',
          'Mars',
          'Jupiter'
        ],
        correctAnswer: 1,
        explanation: 'Venus has a dense, CO2-rich atmosphere with a surface pressure about 90 times that of Earth.'
      },
      {
        id: 'q3',
        type: 'multiple-choice',
        question: 'What is the main component of the Martian polar ice caps?',
        options: [
          'Water ice and dry ice (CO2)',
          'Methane',
          'Ammonia',
          'Sulfuric acid'
        ],
        correctAnswer: 0,
        explanation: 'The Martian polar caps are composed of water ice and seasonally frozen carbon dioxide.'
      },
      {
        id: 'q4',
        type: 'multiple-choice',
        question: 'Which moon is known for its subsurface ocean and geysers?',
        options: [
          'Io',
          'Europa',
          'Titan',
          'Phobos'
        ],
        correctAnswer: 1,
        explanation: 'Europa, a moon of Jupiter, is famous for its subsurface ocean and water geysers.'
      },
      {
        id: 'q5',
        type: 'multiple-choice',
        question: 'What is the Kuiper Belt?',
        options: [
          'A region of rocky asteroids between Mars and Jupiter',
          'A disk-shaped region beyond Neptune containing icy bodies and dwarf planets',
          'A ring system around Saturn',
          'A layer of Earth’s atmosphere'
        ],
        correctAnswer: 1,
        explanation: 'The Kuiper Belt is a region beyond Neptune filled with icy bodies, including Pluto.'
      },
      {
        id: 'q6',
        type: 'multiple-choice',
        question: 'Which planet has the most prominent ring system?',
        options: [
          'Jupiter',
          'Uranus',
          'Neptune',
          'Saturn'
        ],
        correctAnswer: 3,
        explanation: 'Saturn’s rings are the most extensive and visible in the Solar System.'
      },
      // Subjective questions
      {
        id: 'q7',
        type: 'subjective',
        question: 'Explain the importance of studying planetary atmospheres.',
        sampleAnswer: 'Studying planetary atmospheres helps us understand climate, weather, potential for life, and the evolution of planets. It also informs us about atmospheric escape and greenhouse effects.',
        explanation: 'Atmospheric studies are key to understanding planetary environments and habitability.'
      },
      {
        id: 'q8',
        type: 'subjective',
        question: 'Describe the process of planetary differentiation.',
        sampleAnswer: 'Planetary differentiation is the process by which a planet separates into layers of different composition, such as core, mantle, and crust, due to heating and gravity.',
        explanation: 'Differentiation shapes a planet’s internal structure and geological activity.'
      },
      {
        id: 'q9',
        type: 'subjective',
        question: 'What are the main factors influencing the habitability of a planet or moon?',
        sampleAnswer: 'Key factors include the presence of liquid water, a stable atmosphere, suitable temperature, magnetic field, and energy sources.',
        explanation: 'Habitability depends on a combination of physical and chemical conditions.'
      },
      {
        id: 'q10',
        type: 'subjective',
        question: 'Discuss the scientific value of robotic missions to other planets.',
        sampleAnswer: 'Robotic missions provide direct data on planetary surfaces, atmospheres, and geology, enabling discoveries about planetary history, potential for life, and Solar System evolution.',
        explanation: 'Robotic exploration is essential for advancing planetary science.'
      }
    ]
  },
  // Module 9: Space Exploration (English)
  {
    moduleId: 'Module-9-Space-Exploration',
    title: 'Space Exploration',
    questions: [
      // Multiple-choice questions
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'Which mission was the first to land humans on the Moon?',
        options: [
          'Apollo 11',
          'Vostok 1',
          'Luna 2',
          'Gemini 4'
        ],
        correctAnswer: 0,
        explanation: 'Apollo 11 was the first mission to land humans on the Moon in 1969.'
      },
      {
        id: 'q2',
        type: 'multiple-choice',
        question: 'What is the primary goal of the Mars Rover missions?',
        options: [
          'To study the Sun',
          'To search for signs of past or present life and understand Martian geology',
          'To observe asteroids',
          'To test rocket engines'
        ],
        correctAnswer: 1,
        explanation: 'Mars Rovers are designed to search for life and study the planet’s surface and climate.'
      },
      {
        id: 'q3',
        type: 'multiple-choice',
        question: 'Which spacecraft is the farthest human-made object from Earth?',
        options: [
          'Voyager 1',
          'Pioneer 10',
          'New Horizons',
          'Cassini'
        ],
        correctAnswer: 0,
        explanation: 'Voyager 1 is the most distant spacecraft, having entered interstellar space.'
      },
      {
        id: 'q4',
        type: 'multiple-choice',
        question: 'What is the International Space Station (ISS)?',
        options: [
          'A lunar base',
          'A robotic Mars laboratory',
          'A habitable artificial satellite in low Earth orbit',
          'A space telescope'
        ],
        correctAnswer: 2,
        explanation: 'The ISS is a habitable research laboratory orbiting Earth.'
      },
      {
        id: 'q5',
        type: 'multiple-choice',
        question: 'Which country launched the first artificial satellite, Sputnik 1?',
        options: [
          'United States',
          'China',
          'Soviet Union',
          'Japan'
        ],
        correctAnswer: 2,
        explanation: 'The Soviet Union launched Sputnik 1 in 1957.'
      },
      {
        id: 'q6',
        type: 'multiple-choice',
        question: 'What is the main purpose of the Hubble Space Telescope?',
        options: [
          'To observe the Sun',
          'To study the Earth’s atmosphere',
          'To observe distant galaxies, stars, and planets',
          'To monitor weather patterns'
        ],
        correctAnswer: 2,
        explanation: 'Hubble is used to observe distant objects in the universe with high resolution.'
      },
      // Subjective questions
      {
        id: 'q7',
        type: 'subjective',
        question: 'Explain the significance of robotic exploration in advancing space science.',
        sampleAnswer: 'Robotic exploration allows us to gather data from environments too dangerous or distant for humans, leading to discoveries about planets, moons, and the broader universe.',
        explanation: 'Robotic missions are crucial for expanding our knowledge of the Solar System and beyond.'
      },
      {
        id: 'q8',
        type: 'subjective',
        question: 'Discuss the challenges of long-duration human spaceflight.',
        sampleAnswer: 'Challenges include microgravity effects on health, radiation exposure, psychological stress, and the need for life support and reliable technology.',
        explanation: 'Long-duration missions require solutions for health, safety, and sustainability.'
      },
      {
        id: 'q9',
        type: 'subjective',
        question: 'What are the benefits of international cooperation in space exploration?',
        sampleAnswer: 'International cooperation enables sharing of resources, expertise, and costs, leading to more ambitious missions and fostering peaceful relations.',
        explanation: 'Collaboration enhances scientific returns and global partnerships.'
      },
      {
        id: 'q10',
        type: 'subjective',
        question: 'Describe the role of private companies in the future of space exploration.',
        sampleAnswer: 'Private companies are driving innovation, reducing costs, and expanding access to space through commercial launch services, satellite deployment, and plans for lunar and Mars missions.',
        explanation: 'The private sector is transforming the landscape of space exploration.'
      }
    ]
  },
  // Module 10: Modern Astronomical Techniques (English)
  {
    moduleId: 'Module-10-Modern-Astronomical-Techniques',
    title: 'Modern Astronomical Techniques',
    questions: [
      // Multiple-choice questions
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'What is adaptive optics used for in astronomy?',
        options: [
          'Correcting atmospheric distortion in ground-based telescopes',
          'Measuring cosmic distances',
          'Detecting exoplanets',
          'Analyzing cosmic microwave background'
        ],
        correctAnswer: 0,
        explanation: 'Adaptive optics corrects for atmospheric turbulence, improving image quality.'
      },
      {
        id: 'q2',
        type: 'multiple-choice',
        question: 'Which technique is used to detect exoplanets by measuring the dimming of a star?',
        options: [
          'Radial velocity',
          'Transit method',
          'Direct imaging',
          'Astrometry'
        ],
        correctAnswer: 1,
        explanation: 'The transit method detects exoplanets by observing periodic dips in a star’s brightness.'
      },
      {
        id: 'q3',
        type: 'multiple-choice',
        question: 'What is the main advantage of radio astronomy?',
        options: [
          'It can observe through clouds and dust',
          'It provides color images',
          'It is only used for Solar System objects',
          'It requires space telescopes'
        ],
        correctAnswer: 0,
        explanation: 'Radio waves penetrate dust and clouds, allowing observation of otherwise hidden regions.'
      },
      {
        id: 'q4',
        type: 'multiple-choice',
        question: 'Which instrument is used to analyze the chemical composition of stars?',
        options: [
          'Photometer',
          'Spectrograph',
          'Interferometer',
          'Polarimeter'
        ],
        correctAnswer: 1,
        explanation: 'A spectrograph disperses light into its spectrum, revealing chemical signatures.'
      },
      {
        id: 'q5',
        type: 'multiple-choice',
        question: 'What is interferometry in astronomy?',
        options: [
          'A method for measuring star temperatures',
          'Combining signals from multiple telescopes to increase resolution',
          'A technique for launching satellites',
          'A way to detect gravitational waves'
        ],
        correctAnswer: 1,
        explanation: 'Interferometry combines data from several telescopes to achieve higher resolution.'
      },
      {
        id: 'q6',
        type: 'multiple-choice',
        question: 'Which space telescope is designed to observe in the infrared?',
        options: [
          'Hubble Space Telescope',
          'Chandra X-ray Observatory',
          'James Webb Space Telescope',
          'Fermi Gamma-ray Space Telescope'
        ],
        correctAnswer: 2,
        explanation: 'The James Webb Space Telescope is optimized for infrared observations.'
      },
      // Subjective questions
      {
        id: 'q7',
        type: 'subjective',
        question: 'Explain the importance of spectroscopy in modern astronomy.',
        sampleAnswer: 'Spectroscopy allows astronomers to determine the composition, temperature, motion, and other properties of celestial objects by analyzing their light spectra.',
        explanation: 'Spectroscopy is a fundamental tool for understanding the physical and chemical nature of the universe.'
      },
      {
        id: 'q8',
        type: 'subjective',
        question: 'Describe the role of computer simulations in astronomical research.',
        sampleAnswer: 'Computer simulations model complex processes such as galaxy formation, star evolution, and cosmic structure, helping interpret observations and test theories.',
        explanation: 'Simulations are essential for exploring scenarios that cannot be directly observed.'
      },
      {
        id: 'q9',
        type: 'subjective',
        question: 'What are the benefits of multi-wavelength observations in astronomy?',
        sampleAnswer: 'Multi-wavelength observations combine data from radio, infrared, optical, ultraviolet, X-ray, and gamma-ray telescopes to provide a complete picture of astronomical objects and phenomena.',
        explanation: 'Different wavelengths reveal different physical processes and structures.'
      },
      {
        id: 'q10',
        type: 'subjective',
        question: 'Discuss the impact of big data and machine learning on modern astronomy.',
        sampleAnswer: 'Big data and machine learning enable astronomers to analyze vast datasets, discover patterns, and automate the detection of rare events, accelerating scientific discovery.',
        explanation: 'Advanced data analysis techniques are transforming astronomical research.'
      }
    ]
  },
  // Module 7: High-Energy Astrophysics (English)
  {
    moduleId: 'Module-7-High-Energy-Astrophysics',
    title: 'High-Energy Astrophysics',
    questions: [
      // Multiple-choice questions
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'Which astronomical object is the primary source of gamma-ray bursts (GRBs)?',
        options: [
          'White dwarfs',
          'Merging neutron stars or massive star collapse',
          'Brown dwarfs',
          'Exoplanets'
        ],
        correctAnswer: 1,
        explanation: 'GRBs are produced by merging neutron stars or the collapse of massive stars.'
      },
      {
        id: 'q2',
        type: 'multiple-choice',
        question: 'What is the main mechanism behind X-ray emission from accreting black holes?',
        options: [
          'Nuclear fusion',
          'Synchrotron radiation',
          'Thermal emission from hot accretion disks',
          'Radioactive decay'
        ],
        correctAnswer: 2,
        explanation: 'Hot accretion disks around black holes emit X-rays due to their high temperatures.'
      },
      {
        id: 'q3',
        type: 'multiple-choice',
        question: 'Which phenomenon provided the first direct evidence for gravitational waves?',
        options: [
          'Pulsar timing',
          'LIGO detection of binary black hole merger',
          'Solar flares',
          'Gamma-ray bursts'
        ],
        correctAnswer: 1,
        explanation: 'LIGO’s detection of gravitational waves from a binary black hole merger was the first direct evidence.'
      },
      {
        id: 'q4',
        type: 'multiple-choice',
        question: 'What is an active galactic nucleus (AGN)?',
        options: [
          'A region of intense star formation',
          'A supermassive black hole accreting matter at a galaxy’s center',
          'A cluster of neutron stars',
          'A planetary nebula'
        ],
        correctAnswer: 1,
        explanation: 'An AGN is powered by a supermassive black hole accreting matter at the center of a galaxy.'
      },
      {
        id: 'q5',
        type: 'multiple-choice',
        question: 'Which instrument is designed to detect high-energy X-rays and gamma rays from space?',
        options: [
          'Hubble Space Telescope',
          'Chandra X-ray Observatory',
          'Kepler Space Telescope',
          'Spitzer Space Telescope'
        ],
        correctAnswer: 1,
        explanation: 'Chandra is designed for X-rays; Fermi and Swift are used for gamma rays.'
      },
      {
        id: 'q6',
        type: 'multiple-choice',
        question: 'What is a pulsar?',
        options: [
          'A rapidly rotating neutron star emitting beams of radiation',
          'A type of white dwarf',
          'A supermassive black hole',
          'A variable star in a binary system'
        ],
        correctAnswer: 0,
        explanation: 'A pulsar is a rapidly rotating neutron star that emits beams of electromagnetic radiation.'
      },
      // Subjective questions
      {
        id: 'q7',
        type: 'subjective',
        question: 'Explain the significance of gravitational wave astronomy in modern astrophysics.',
        sampleAnswer: 'Gravitational wave astronomy allows the direct observation of cataclysmic events like black hole and neutron star mergers, providing new insights into the universe’s most energetic phenomena.',
        explanation: 'Gravitational waves open a new window for studying the universe, complementing electromagnetic observations.'
      },
      {
        id: 'q8',
        type: 'subjective',
        question: 'Describe the main types of high-energy astrophysical transients and their importance.',
        sampleAnswer: 'High-energy transients include gamma-ray bursts, supernovae, and tidal disruption events. They are important for understanding stellar evolution, black hole formation, and the extreme physics of the universe.',
        explanation: 'Transients reveal the most energetic and short-lived processes in the cosmos.'
      },
      {
        id: 'q9',
        type: 'subjective',
        question: 'What are the challenges in detecting and studying cosmic rays?',
        sampleAnswer: 'Cosmic rays are difficult to trace to their sources due to magnetic field deflection and low flux at the highest energies. Large detectors and long observation times are required.',
        explanation: 'Cosmic ray studies require advanced technology and face fundamental observational challenges.'
      },
      {
        id: 'q10',
        type: 'subjective',
        question: 'Discuss the role of multi-messenger astronomy in high-energy astrophysics.',
        sampleAnswer: 'Multi-messenger astronomy combines data from electromagnetic waves, gravitational waves, neutrinos, and cosmic rays to provide a more complete understanding of energetic cosmic events.',
        explanation: 'Multi-messenger observations enable breakthroughs in understanding the most extreme phenomena in the universe.'
      }
    ]
  },
  // Module 6: Exoplanets and Astrobiology (English)
  {
    moduleId: 'Module-6-Exoplanets-and-Astrobiology',
    title: 'Exoplanets and Astrobiology',
    questions: [
      // Multiple-choice questions
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'Which method has discovered the largest number of exoplanets to date?',
        options: [
          'Radial velocity method',
          'Transit method',
          'Direct imaging',
          'Microlensing'
        ],
        correctAnswer: 1,
        explanation: 'The transit method, used by missions like Kepler, has discovered the most exoplanets.'
      },
      {
        id: 'q2',
        type: 'multiple-choice',
        question: 'What is a habitable zone?',
        options: [
          'A region where planets have rings',
          'The area around a star where liquid water can exist on a planet’s surface',
          'A region with the highest density of asteroids',
          'The area where planets form most rapidly'
        ],
        correctAnswer: 1,
        explanation: 'The habitable zone is the region around a star where conditions may allow liquid water to exist.'
      },
      {
        id: 'q3',
        type: 'multiple-choice',
        question: 'Which molecule is considered a key biosignature in exoplanet atmospheres?',
        options: [
          'Methane',
          'Ammonia',
          'Oxygen',
          'Carbon monoxide'
        ],
        correctAnswer: 2,
        explanation: 'Oxygen, especially when found with methane, is a strong biosignature for life.'
      },
      {
        id: 'q4',
        type: 'multiple-choice',
        question: 'What is the main goal of the SETI project?',
        options: [
          'To find new planets in the Solar System',
          'To search for signals from extraterrestrial civilizations',
          'To study the atmospheres of exoplanets',
          'To send probes to other stars'
        ],
        correctAnswer: 1,
        explanation: 'SETI (Search for Extraterrestrial Intelligence) aims to detect signals from intelligent life.'
      },
      {
        id: 'q5',
        type: 'multiple-choice',
        question: 'Which of the following is NOT a method for detecting exoplanets?',
        options: [
          'Transit method',
          'Radial velocity method',
          'Parallax method',
          'Microlensing'
        ],
        correctAnswer: 2,
        explanation: 'The parallax method is used for measuring stellar distances, not for detecting exoplanets.'
      },
      {
        id: 'q6',
        type: 'multiple-choice',
        question: 'What is the significance of the TRAPPIST-1 system?',
        options: [
          'It is the closest star to the Sun',
          'It has seven Earth-sized planets, some in the habitable zone',
          'It is the first exoplanet discovered',
          'It is a binary star system'
        ],
        correctAnswer: 1,
        explanation: 'TRAPPIST-1 is notable for its seven Earth-sized planets, several of which may be habitable.'
      },
      // Subjective questions
      {
        id: 'q7',
        type: 'subjective',
        question: 'Explain the transit method for detecting exoplanets and its limitations.',
        sampleAnswer: 'The transit method detects exoplanets by measuring the dip in a star’s brightness as a planet passes in front of it. Its limitations include the need for precise alignment and the possibility of false positives from stellar activity.',
        explanation: 'The transit method is powerful but only works for systems with the right orientation and can be affected by other phenomena.'
      },
      {
        id: 'q8',
        type: 'subjective',
        question: 'Discuss the importance of biosignatures in the search for extraterrestrial life.',
        sampleAnswer: 'Biosignatures are chemical indicators, such as oxygen or methane, that may suggest the presence of life. Their detection in exoplanet atmospheres is a key goal for astrobiology.',
        explanation: 'Biosignatures provide indirect evidence for life and guide observational strategies.'
      },
      {
        id: 'q9',
        type: 'subjective',
        question: 'What are the main challenges in confirming the habitability of exoplanets?',
        sampleAnswer: 'Challenges include limited data on atmospheric composition, surface conditions, and the effects of stellar activity. Direct imaging and spectroscopy are difficult for distant, small planets.',
        explanation: 'Technological and observational limits make it hard to confirm habitability beyond basic criteria.'
      },
      {
        id: 'q10',
        type: 'subjective',
        question: 'Describe the Drake Equation and its significance in astrobiology.',
        sampleAnswer: 'The Drake Equation estimates the number of communicative civilizations in our galaxy by multiplying factors like star formation rate, fraction of stars with planets, and probability of life. It highlights the uncertainties and guides research in astrobiology.',
        explanation: 'The Drake Equation frames the scientific discussion about the prevalence of extraterrestrial intelligence.'
      }
    ]
  },
  // Module 5: Cosmology (English)
  {
    moduleId: 'Module-5-Cosmology',
    title: 'Cosmology',
    questions: [
      // Multiple-choice questions
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'What is the best evidence for the Big Bang theory?',
        options: [
          'The existence of black holes',
          'The cosmic microwave background',
          'The abundance of exoplanets',
          'The presence of dark energy'
        ],
        correctAnswer: 1,
        explanation: 'The cosmic microwave background is a relic radiation from the early universe, providing strong evidence for the Big Bang.'
      },
      {
        id: 'q2',
        type: 'multiple-choice',
        question: 'Which element was NOT primarily formed during Big Bang nucleosynthesis?',
        options: [
          'Hydrogen',
          'Helium',
          'Lithium',
          'Carbon'
        ],
        correctAnswer: 3,
        explanation: 'Carbon is mainly produced in stars, not during the Big Bang nucleosynthesis.'
      },
      {
        id: 'q3',
        type: 'multiple-choice',
        question: 'What does the term “dark energy” refer to?',
        options: [
          'A form of matter that emits no light',
          'The energy associated with black holes',
          'A mysterious force causing the accelerated expansion of the universe',
          'The energy of cosmic rays'
        ],
        correctAnswer: 2,
        explanation: 'Dark energy is the unknown cause of the observed acceleration in the universe’s expansion.'
      },
      {
        id: 'q4',
        type: 'multiple-choice',
        question: 'Which observation led to the discovery of the universe’s accelerated expansion?',
        options: [
          'The rotation curves of galaxies',
          'The redshift of distant supernovae',
          'The cosmic microwave background',
          'The distribution of galaxy clusters'
        ],
        correctAnswer: 1,
        explanation: 'Observations of distant Type Ia supernovae revealed that the universe’s expansion is accelerating.'
      },
      {
        id: 'q5',
        type: 'multiple-choice',
        question: 'What is the fate of the universe if dark energy continues to dominate?',
        options: [
          'It will recollapse in a Big Crunch',
          'It will expand forever, leading to a “heat death”',
          'It will oscillate between expansion and contraction',
          'It will fragment into smaller universes'
        ],
        correctAnswer: 1,
        explanation: 'If dark energy dominates, the universe will expand forever and eventually reach a state of maximum entropy, or “heat death.”'
      },
      {
        id: 'q6',
        type: 'multiple-choice',
        question: 'What is the main evidence for the existence of dark matter?',
        options: [
          'The cosmic microwave background',
          'The rotation curves of galaxies',
          'The abundance of heavy elements',
          'The presence of black holes'
        ],
        correctAnswer: 1,
        explanation: 'The rotation curves of galaxies show that there is more mass present than can be accounted for by visible matter.'
      },
      // Subjective questions
      {
        id: 'q7',
        type: 'subjective',
        question: 'Explain the significance of the cosmic microwave background in cosmology.',
        sampleAnswer: 'The cosmic microwave background (CMB) is the afterglow of the Big Bang, providing a snapshot of the universe when it was about 380,000 years old. Its uniformity and tiny fluctuations give insight into the early universe’s conditions and the formation of large-scale structure.',
        explanation: 'The CMB is a cornerstone of modern cosmology, confirming the Big Bang and informing models of the universe’s evolution.'
      },
      {
        id: 'q8',
        type: 'subjective',
        question: 'Describe the process and importance of Big Bang nucleosynthesis.',
        sampleAnswer: 'Big Bang nucleosynthesis refers to the formation of light elements (hydrogen, helium, and traces of lithium) in the first few minutes after the Big Bang. The observed abundances of these elements match theoretical predictions, supporting the Big Bang model.',
        explanation: 'Big Bang nucleosynthesis is key evidence for the early hot, dense state of the universe.'
      },
      {
        id: 'q9',
        type: 'subjective',
        question: 'What are the main differences between dark matter and dark energy?',
        sampleAnswer: 'Dark matter is a form of matter that interacts gravitationally but not electromagnetically, explaining galaxy rotation curves and structure formation. Dark energy is a mysterious force driving the accelerated expansion of the universe.',
        explanation: 'Dark matter and dark energy are distinct components of the universe with different roles and properties.'
      },
      {
        id: 'q10',
        type: 'subjective',
        question: 'Discuss the role of supernovae in measuring cosmic distances and the expansion of the universe.',
        sampleAnswer: 'Type Ia supernovae serve as standard candles for measuring cosmic distances. Their observed brightness and redshift have been crucial in discovering the universe’s accelerated expansion and constraining cosmological parameters.',
        explanation: 'Supernovae are essential tools for observational cosmology and understanding the universe’s expansion history.'
      }
    ]
  }
]

export function getQuizByModuleId(moduleId: string): Quiz | undefined {
  return quizzes.find(quiz => quiz.moduleId === moduleId)
}
