export interface Chapter {
  name: string;
  number: number;
  isFree: boolean;
  topics?: string;
  note?: string;
  advanced?: boolean;
}

export interface SubjectSyllabus {
  book: string;
  chapters: Chapter[];
}

// Only Chapter 1 of each subject is free (2026-27 policy)
const mk = (
  items: (string | { name: string; topics?: string; note?: string; advanced?: boolean })[]
): Chapter[] =>
  items.map((it, i) => {
    const o = typeof it === 'string' ? { name: it } : it;
    return { ...o, number: i + 1, isFree: i === 0 };
  });

export const SYLLABUS: Record<string, Record<string, SubjectSyllabus>> = {
  '9': {
    Mathematics: {
      book: 'Ganita Manjari Part 1',
      chapters: mk([
        { name: 'Number Systems', topics: 'Natural, whole, integers, rational & irrational numbers, real numbers on the number line, operations on real numbers, laws of exponents, proof that √2 is irrational, decimal expansions.' },
        { name: 'Polynomials Part 1', topics: 'Definition and degree of a polynomial, monomial/binomial/trinomial, zeroes, remainder theorem, factor theorem, factorisation.' },
        { name: 'Polynomials Part 2', topics: 'Algebraic identities (a+b)², (a-b)², (a+b+c)², (a±b)³, a³±b³ and their application to factorisation.' },
        { name: 'Coordinate Geometry', topics: 'Cartesian system, plotting points, quadrants, axes, origin, distance of a point from the axes, introduction to the distance formula.' },
        { name: 'Linear Equations in Two Variables', topics: 'Definition, solutions, graphs, lines parallel to the axes, real-life applications.' },
        { name: 'Pair of Linear Equations in Two Variables', topics: 'Graphical method, substitution, elimination, cross-multiplication, reducible equations, word problems.', note: 'Moved from Class 10 under the 2026-27 syllabus.' },
        { name: "Introduction to Euclid's Geometry", topics: "Euclid's definitions, axioms and postulates, the fifth postulate, axiom vs theorem." },
        { name: 'Lines and Angles', topics: 'Intersecting and non-intersecting lines, pairs of angles, parallel lines and transversal, angle sum property.' },
        { name: 'Triangles', topics: 'Congruence criteria SAS, ASA, AAS, SSS, RHS, isosceles triangle properties, inequalities in triangles.' },
        { name: 'Quadrilaterals', topics: 'Angle sum property, types of quadrilaterals, properties of a parallelogram, mid-point theorem.' },
        { name: 'Circles', topics: 'Chord, arc, sector, segment, perpendicular from centre, circle through three points, equal chords, cyclic quadrilaterals.' },
        { name: "Heron's Formula", topics: "Area of a triangle by Heron's formula and application to quadrilaterals." },
        { name: 'Surface Areas and Volumes', topics: 'Cuboid, cube, cylinder, cone, sphere, hemisphere — surface areas and volumes, conversion of shapes.' },
        { name: 'Statistics', topics: 'Collection and presentation of data, bar graph, histogram, frequency polygon, mean, median, mode.' },
        { name: 'Arithmetic Progressions', topics: 'Sequences, AP, nth term, sum of n terms, applications.', note: 'Moved from Class 10 under the 2026-27 syllabus.' },
        { name: 'Geometric Progressions', topics: 'GP, common ratio, nth term, sum of n terms, sum of infinite GP, applications.', note: 'Moved from Class 11. Advanced level — optional, for JEE/Olympiad aspirants.', advanced: true },
      ]),
    },
    Physics: {
      book: 'Exploration (Physics section)',
      chapters: mk([
        { name: 'Motion', topics: 'Describing and measuring motion, distance-time and velocity-time graphs, equations of motion, uniform circular motion.' },
        { name: 'Force and Laws of Motion', topics: 'Balanced and unbalanced forces, inertia, momentum, three laws of motion, conservation of momentum.' },
        { name: 'Work and Energy', topics: 'Work, energy and its forms, kinetic and potential energy, law of conservation of energy, power, commercial unit of energy.' },
        { name: 'Sound', topics: 'Production and propagation, amplitude, frequency, wavelength, echo, reverberation, range of hearing, ultrasound, SONAR, human ear.' },
      ]),
    },
    Chemistry: {
      book: 'Exploration (Chemistry section)',
      chapters: mk([
        { name: 'Matter in Our Surroundings', topics: 'Physical nature of matter, particle characteristics, states of matter, evaporation, effect of temperature and pressure, latent heat, sublimation, plasma and Bose-Einstein condensate.' },
        { name: 'Is Matter Around Us Pure', topics: 'Mixtures, solutions, suspensions, colloids, separation techniques, elements and compounds.' },
        { name: 'Atoms and Molecules', topics: 'Laws of chemical combination, Dalton\u2019s atomic theory, atomic and molecular mass, mole concept, molar mass, Avogadro\u2019s number, chemical formulae.' },
        { name: 'Structure of the Atom', topics: 'Charged particles, Thomson, Rutherford and Bohr models, electron distribution (2,8,8), valency, atomic and mass number, isotopes and isobars.' },
      ]),
    },
    Biology: {
      book: 'Exploration (Biology & Earth Science sections)',
      chapters: mk([
        { name: 'The Fundamental Unit of Life', topics: 'Cell discovery, cell theory, prokaryotic vs eukaryotic, plant vs animal cell, all organelles and their functions.' },
        { name: 'Tissues', topics: 'Plant tissues — meristematic and permanent; animal tissues — epithelial, connective, muscular, nervous.' },
        { name: 'Why Do We Fall Ill', topics: 'Health vs disease-free, acute and chronic disease, infectious and non-infectious disease, spread, treatment, prevention, antibiotics.' },
        { name: 'Natural Resources', topics: 'Air, water, soil, biogeochemical cycles, ozone layer, greenhouse effect, global warming.' },
        { name: 'Earth Science: Natural Cycles and Earth Systems', topics: 'Earth as a system — lithosphere, hydrosphere, atmosphere, biosphere and their interactions, energy flows and matter cycles, human impact, sustainable development.', note: 'Brand new chapter under NEP 2020 — no equivalent in the old syllabus.' },
        { name: 'Earth Science: Environmental Balance and Radiation', topics: 'Solar radiation and energy balance, albedo, greenhouse gases, ozone layer, UV radiation, ecosystem balance, biodiversity, conservation.', note: 'Brand new chapter under NEP 2020 — no equivalent in the old syllabus.' },
      ]),
    },
    'Social Science': {
      book: 'Understanding Society: India and Beyond',
      chapters: mk([
        { name: 'What is Society and How Do We Study It', topics: 'How historians, geographers, political scientists and economists study society; sources, evidence and methodology.' },
        { name: 'Early Human Civilisations', topics: 'Early humans, geography of early civilisations, first social and political organisation, barter economies, Mesopotamia, Egypt and early India.' },
        { name: 'Ancient Indian Civilisations — Harappan Culture', topics: 'Harappan geography and town planning, political and social organisation, trade, decline theories.', note: 'Moved down from Class 12 at age-appropriate depth.' },
        { name: 'Vedic Period and Early Indian Society', topics: 'Vedic geography, social stratification, jana and rashtra, economic organisation, Rigvedic to later Vedic transition.' },
        { name: 'Bhakti and Sufi Traditions in Medieval India', topics: 'Geographic spread, challenge to caste, medieval political context, artisan and trading communities.', note: 'Moved down from Class 12.' },
        { name: 'Colonial India and the Nationalist Movement', topics: 'Railways and resource extraction, economic drain theory, formation of the Indian National Congress, social reform movements.' },
        { name: 'Physical Features of India', topics: 'Geological history, plate tectonics and Himalayan formation, interior of the Earth, Himalayas, Northern Plains, Peninsular Plateau, Indian Desert, Coastal Plains, Islands.', note: 'Includes Plate Tectonics and Earth\u2019s interior, moved from Class 11.' },
        { name: 'Ocean Relief and Biomes', topics: 'Continental shelf and slope, abyssal plains, ridges, trenches; world biomes and India\u2019s biome distribution.', note: 'Moved from Class 11 Geography.' },
        { name: 'Climate and Natural Vegetation of India', topics: 'Climate controls, monsoon mechanism, seasons, rainfall distribution, vegetation types, economic importance of forests.' },
        { name: 'Democracy and Elections', topics: 'Features and types of democracy, FPTP vs proportional representation, Election Commission of India, electoral process, voter rights, electoral reforms.', note: 'Moved from Class 11 Political Science.' },
        { name: 'Justice and Authority', topics: 'Distributive, punitive and restorative justice; traditional, charismatic and legal-rational authority; rule of law, separation of powers, judiciary, fundamental rights.', note: 'Moved from Class 11.' },
        { name: 'Indian Economy and Financial Literacy', topics: 'Primary, secondary and tertiary sectors, GDP, poverty and inequality, money, banking basics, savings vs investment, inflation.' },
        { name: 'Budgeting and Personal Finance', topics: 'Budgets, income and expenditure, needs vs wants, savings habits, simple and compound interest in daily life, income tax basics, why taxes matter.', note: 'Completely new under the NEP 2020 financial literacy mandate.' },
        { name: 'Entrepreneurship and Investment Basics', topics: 'What entrepreneurship is, Indian entrepreneurs (Ratan Tata, Narayana Murthy, Ritesh Agarwal, Falguni Nayar), shares, mutual funds, fixed deposits, risk and return, India\u2019s startup ecosystem.', note: 'Completely new content — no equivalent in the old syllabus.' },
        { name: 'India in the Global World', topics: 'India\u2019s strategic position, foreign policy basics, UN, WTO, SAARC, BRICS, exports and imports, globalisation\u2019s impact.' },
        { name: 'Sustainable Development and Our Responsibilities', topics: 'Sustainable development, SDGs and India\u2019s progress, air pollution, water scarcity, deforestation, climate change, Swachh Bharat, Namami Gange, Solar Mission.' },
      ]),
    },
    English: {
      book: 'Kaveri',
      chapters: mk([
        { name: 'Persuasive Essay Writing', topics: 'Building an argument, thesis statement, supporting evidence, counterargument, conclusion. Model essays: phones in schools, social media and teenagers, abolishing homework.' },
        { name: 'Literary Analysis', topics: 'Analysing a story or poem — theme, characterisation, narrative voice, literary devices, and a step-by-step answer framework.' },
        { name: 'Research Writing', topics: 'Gathering information, evaluating sources, organising findings, writing a research-based essay with citations.' },
        { name: 'Creative Writing', topics: 'Descriptive writing, narrative writing, dialogue writing, creative non-fiction.' },
      ]),
    },
  },
  '10': {
    Mathematics: {
      book: 'NCERT Mathematics (Class 10)',
      chapters: mk([
        'Real Numbers', 'Polynomials', 'Pair of Linear Equations in Two Variables',
        'Quadratic Equations', 'Arithmetic Progressions', 'Triangles', 'Coordinate Geometry',
        'Introduction to Trigonometry', 'Some Applications of Trigonometry', 'Circles',
        'Areas Related to Circles', 'Surface Areas and Volumes', 'Statistics', 'Probability',
      ]),
    },
    Physics: {
      book: 'NCERT Science (Class 10) — Physics section',
      chapters: mk([
        'Light Reflection and Refraction', 'Human Eye and Colourful World',
        'Electricity', 'Magnetic Effects of Electric Current',
      ]),
    },
    Chemistry: {
      book: 'NCERT Science (Class 10) — Chemistry section',
      chapters: mk([
        'Chemical Reactions and Equations', 'Acids Bases and Salts',
        'Metals and Non-metals', 'Carbon and its Compounds',
      ]),
    },
    Biology: {
      book: 'NCERT Science (Class 10) — Biology section',
      chapters: mk([
        'Life Processes', 'Control and Coordination', 'How do Organisms Reproduce',
        'Heredity', 'Our Environment',
      ]),
    },
    'Social Science': {
      book: 'NCERT Social Science (Class 10)',
      chapters: mk([
        'The Rise of Nationalism in Europe', 'Nationalism in India', 'The Making of a Global World',
        'The Age of Industrialisation', 'Print Culture and the Modern World',
        'Resources and Development', 'Forest and Wildlife Resources', 'Water Resources',
        'Agriculture', 'Minerals and Energy Resources', 'Manufacturing Industries',
        'Lifelines of National Economy', 'Power Sharing', 'Federalism', 'Democracy and Diversity',
        'Gender Religion and Caste', 'Political Parties', 'Outcomes of Democracy',
        'Challenges to Democracy', 'Development', 'Sectors of the Indian Economy',
        'Money and Credit', 'Globalisation and the Indian Economy', 'Consumer Rights',
      ]),
    },
    English: {
      book: 'First Flight & Footprints Without Feet',
      chapters: mk([
        'A Letter to God', 'Nelson Mandela', 'Two Stories about Flying',
        'From the Diary of Anne Frank', 'The Hundred Dresses I', 'The Hundred Dresses II',
        'Glimpses of India', 'Mijbil the Otter', 'Madam Rides the Bus', 'The Sermon at Benares',
        'The Proposal',
      ]),
    },
  },
};

// Chapters removed from Class 9 in 2026-27 — searching for them shows a friendly message
export const REMOVED_CLASS_9 = [
  'gravitation', 'the fun they had', 'the sound of music', 'the little girl',
  'a truly beautiful mind', 'the snake and the mirror', 'my childhood', 'packing',
  'reach for the top', 'the bond of love', 'kathmandu', 'if i were you',
  'french revolution', 'the french revolution',
];

export function removedNotice(chapter: string, classLevel: string): string | null {
  if (classLevel !== '9') return null;
  const c = chapter.trim().toLowerCase();
  if (!REMOVED_CLASS_9.some(r => c.includes(r))) return null;
  if (c.includes('gravitation'))
    return 'Gravitation has been removed from Class 9 in the 2026-27 syllabus and is now covered in higher classes.';
  return 'This chapter was part of the old Class 9 syllabus (Beehive/Moments and the old books), which the 2026-27 NCERT syllabus has replaced. Here are the new chapters available.';
}

// Science is split into Physics, Chemistry and Biology
export const SCIENCE_STREAMS = ['Physics', 'Chemistry', 'Biology'];

export function getSubjectSyllabus(classLevel: string, subjectName: string) {
  const classSyllabus = SYLLABUS[classLevel] || SYLLABUS['10'];
  const lookup = subjectName;

  // Legacy "Science" links now fall back to the combined stream chapters
  if (lookup === 'Science') {
    const chapters = SCIENCE_STREAMS.flatMap((s) => classSyllabus[s]?.chapters ?? [])
      .map((c, i) => ({ ...c, number: i + 1 }));
    return { lookup, book: 'Physics · Chemistry · Biology', chapters };
  }

  const entry = classSyllabus[lookup];
  return { lookup, book: entry?.book ?? '', chapters: entry?.chapters ?? [] };
}
