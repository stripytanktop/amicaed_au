/* Sentence Builder | AmicaEd: sentence banks (one file per region/locale) */
// ------------------------------------------------------------------
// Sentence banks, Levels 1-7 (roughly Prep to Year 6; Australian English)
// Words are split on spaces, so punctuation stays attached to its word.
// ------------------------------------------------------------------
const LEVELS = [
  {
    id: "prep", name: "Level 1", focus: "Short, familiar words",
    sentences: [
      `I can see a dog.`,
      `The cat is big.`,
      `We like to play.`,
      `My mum is at home.`,
      `Look at the red car.`,
      `I am a good friend.`,
      `The sun is hot.`,
      `Can you see me?`,
      `A frog can jump.`,
      `We go to school.`,
      `The pig is pink.`,
      `I like my new hat.`,
      `Dad has a big bag.`,
      `The bus is red.`,
      `Go and get the ball.`
    ]
  },
  {
    id: "y1", name: "Level 2", focus: "Simple everyday sentences",
    sentences: [
      `The little dog ran to the gate.`,
      `We played on the swings at lunch.`,
      `My sister has a pet rabbit.`,
      `I can hear the rain on the roof.`,
      `The farmer fed the hungry sheep.`,
      `A big green frog sat on a log.`,
      `We had pizza for dinner last night.`,
      `Mum took us to the library.`,
      `The baby bird sat in the nest.`,
      `I like to ride my scooter.`,
      `Can we go to the beach today?`,
      `The teacher read us a funny story.`,
      `A cold wind blew through the trees.`,
      `Our class has a new fish.`,
      `We saw a koala at the zoo.`
    ]
  },
  {
    id: "y2", name: "Level 3", focus: "Describing words and places",
    sentences: [
      `The little brown dog ran fast.`,
      `We like to play at the beach.`,
      `My friend has a bright red bike.`,
      `The kangaroo jumped over the log.`,
      `She put her blue hat on.`,
      `Two green frogs sat by the pond.`,
      `We read a funny book today.`,
      `The yellow bus stopped at school.`,
      `I can see five birds in the tree.`,
      `He ate a sweet apple for lunch.`,
      `The koala is sleeping in the gum tree.`,
      `We went to the park after school.`,
      `Look at the big white clouds.`,
      `My cat likes to sleep on my bed.`,
      `They swam in the cool blue pool.`
    ]
  },
  {
    id: "y3", name: "Level 4", focus: "Joining words and time words",
    sentences: [
      `The tired puppy curled up because it was cold.`,
      `After lunch, we practised our reading in the shade.`,
      `Mia wanted to swim, but the water was freezing.`,
      `A pelican glided slowly across the glittering river.`,
      `We planted tomato seeds in the garden beds today.`,
      `Please pack your lunch box before the bell rings.`,
      `The magpie swooped down and landed on the fence.`,
      `Our class is collecting rubbish to keep the beach clean.`,
      `Although it was raining, we still played handball.`,
      `Tom's brother taught him how to skateboard.`,
      `Early in the morning, the kookaburras began to laugh.`,
      `I will finish my project before the end of term.`,
      `The scientist carefully measured the rainfall each afternoon.`,
      `Can you help me carry these books to the library?`,
      `Jack hurried home because storm clouds were gathering.`
    ]
  },
  {
    id: "y4", name: "Level 5", focus: "Commas, apostrophes and speech",
    sentences: [
      `When the siren sounded, everyone walked quietly to the oval.`,
      `The old lighthouse stood proudly at the edge of the cliff.`,
      `"Please take a seat," said the teacher kindly.`,
      `Yesterday, my grandmother showed me her collection of shells.`,
      `The explorers trudged through the thick, tangled rainforest.`,
      `Whenever it rains, the creek behind our school overflows.`,
      `We couldn't believe how quickly the tide came in.`,
      `The wombat's burrow was hidden beneath a fallen log.`,
      `Despite the heat, the netball team trained after school.`,
      `Our principal announced that the excursion had been postponed.`,
      `Frogs croak loudly at night after a summer storm.`,
      `I've been saving my pocket money for a new bike.`,
      `The giant waves crashed against the rocks, sending spray high into the air.`,
      `Before the storm arrived, the farmers moved their cattle to higher ground.`,
      `"Where did you leave your hat?" asked Dad.`
    ]
  },
  {
    id: "y5", name: "Level 6", focus: "Longer sentences with extra detail",
    sentences: [
      `As the sun set behind the mountains, the sky glowed a deep orange.`,
      `The students who finished early helped their classmates revise for the test.`,
      `Although the experiment failed, we learned something valuable from the results.`,
      `Scientists believe that the Great Barrier Reef is the largest living structure on Earth.`,
      `Gripping the rope tightly, Lena climbed to the top of the wall.`,
      `The recycling program, which started last year, has reduced our school's waste.`,
      `"We must leave now," whispered Zara, "before the tide comes in."`,
      `Without warning, a thunderstorm rolled in and drenched the unsuspecting spectators.`,
      `Our debate team practised every lunchtime until they felt confident.`,
      `The ancient manuscript, crumbling at the edges, had been hidden for centuries.`,
      `If we protect their habitat, koalas will have a better chance of surviving.`,
      `Nervously, Ben stepped onto the stage and faced the enormous audience.`,
      `The bushfire smoke drifted across the valley, turning the afternoon sky grey.`,
      `Because the river had flooded, the bus took a longer route to school.`,
      `Meteors blazed across the night sky while we lay silently on the grass.`
    ]
  },
  {
    id: "y6", name: "Level 7", focus: "Complex sentences and punctuation",
    sentences: [
      `Having completed the research, the group presented their findings to the entire school.`,
      `The explorer, exhausted but determined, pressed on toward the distant summit.`,
      `Not only did the team win the final, but they also broke the school record.`,
      `Climate change is one of the most pressing challenges facing our generation.`,
      `Whenever we visit the wetlands, hundreds of migratory birds can be spotted along the shoreline.`,
      `Although the journey was long and difficult, the pioneers refused to give up.`,
      `The council's decision to build a skate park was welcomed by local families.`,
      `Through persistence and teamwork, our class raised enough money for the wildlife shelter.`,
      `"I can't promise anything," she replied, "but I will certainly try."`,
      `The artist's latest sculpture, made entirely from recycled materials, attracted enormous attention.`,
      `If you read the instructions carefully, you will avoid making unnecessary mistakes.`,
      `By the time the ambulance arrived, the volunteers had already secured the area.`,
      `Technology has transformed the way that students collaborate on their assignments.`,
      `Beneath the shimmering surface of the lagoon, an extraordinary world was waiting to be discovered.`,
      `Despite months of preparation, nothing could have prepared them for the spectacular opening night.`
    ]
  }
];
