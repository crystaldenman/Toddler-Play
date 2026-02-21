import { Activity } from "../services/geminiService";

export interface SeasonalPack {
  id: string;
  title: string;
  icon: string;
  description: string;
  activities: Activity[];
}

export const SEASONAL_PACKS: SeasonalPack[] = [
  {
    id: "fall-sensory",
    title: "Fall Sensory",
    icon: "🍂",
    description: "Crisp air and crunchy leaves. Perfect for autumn afternoons.",
    activities: [
      {
        id: "fall-1",
        title: "Leaf Crunch Bin",
        instructions: [
          "Collect a variety of dry leaves from outside.",
          "Place them in a large shallow bin or cardboard box.",
          "Let your toddler crunch them with their hands or stomp with feet.",
          "Hide small toy animals inside for them to find."
        ],
        supplies: ["Dry leaves", "Large bin", "Small toys"],
        safety: "Supervise to ensure leaves aren't eaten. Check for sharp sticks.",
        messLevel: "Medium",
        benefit: "Sensory exploration & Fine motor",
        ageGroup: "12-36 months"
      },
      {
        id: "fall-2",
        title: "Pumpkin Wash",
        instructions: [
          "Place a few small pumpkins in a bin of soapy water.",
          "Give your toddler a scrub brush or sponge.",
          "Show them how to 'clean' the pumpkins.",
          "Provide a towel for 'drying' duty."
        ],
        supplies: ["Small pumpkins", "Bin", "Water", "Dish soap", "Brush"],
        safety: "Water play requires constant supervision.",
        messLevel: "Medium",
        benefit: "Practical life skills & Hand-eye coordination",
        ageGroup: "18-36 months"
      }
    ]
  },
  {
    id: "winter-wonder",
    title: "Winter Wonder",
    icon: "❄️",
    description: "Cozy indoor play for chilly days.",
    activities: [
      {
        id: "winter-1",
        title: "Cotton Ball Snowman",
        instructions: [
          "Cut out three circles from paper and tape them to a tray.",
          "Provide a bowl of cotton balls and a small cup of water or glue stick.",
          "Let them stick the 'snow' onto the circles.",
          "Use buttons or markers for the face."
        ],
        supplies: ["Cotton balls", "Paper", "Tape", "Glue/Water"],
        safety: "Cotton balls can be a choking hazard if pulled apart and eaten.",
        messLevel: "Low",
        benefit: "Fine motor & Creativity",
        ageGroup: "18-36 months"
      },
      {
        id: "winter-2",
        title: "Ice Cube Painting",
        instructions: [
          "Freeze water with food coloring in an ice tray.",
          "Place a large sheet of paper on a tray.",
          "Let the toddler move the colored ice cubes across the paper as they melt.",
          "Watch the colors mix!"
        ],
        supplies: ["Ice tray", "Food coloring", "Paper", "Tray"],
        safety: "Cold items can be sensitive for some toddlers. Use food-safe coloring.",
        messLevel: "Messy",
        benefit: "Cause and effect & Color recognition",
        ageGroup: "12-36 months"
      }
    ]
  },
  {
    id: "spring-bloom",
    title: "Spring Bloom",
    icon: "🌱",
    description: "Celebrate new growth and muddy puddles.",
    activities: [
      {
        id: "spring-1",
        title: "Flower Petal Soup",
        instructions: [
          "Fill a large bowl with water.",
          "Provide safe flower petals (clover, dandelions) or silk flowers.",
          "Give them a ladle and smaller cups to 'serve' the soup.",
          "Add a drop of vanilla extract for a spring scent."
        ],
        supplies: ["Bowl", "Water", "Petals/Silk flowers", "Ladle"],
        safety: "Ensure plants used are non-toxic. Supervise water play.",
        messLevel: "Medium",
        benefit: "Sensory & Pouring skills",
        ageGroup: "18-36 months"
      }
    ]
  },
  {
    id: "summer-splash",
    title: "Summer Splash",
    icon: "☀️",
    description: "Stay cool with water and sun-themed fun.",
    activities: [
      {
        id: "summer-1",
        title: "Frozen Toy Rescue",
        instructions: [
          "Freeze small plastic toys in a large container of water overnight.",
          "Place the giant ice block in a bin outside or in the tub.",
          "Give the toddler warm water and a spray bottle to 'rescue' the toys.",
          "Use a small wooden hammer for older toddlers."
        ],
        supplies: ["Plastic toys", "Large container", "Spray bottle", "Warm water"],
        safety: "Supervise use of tools. Watch for small parts as they break free.",
        messLevel: "Messy",
        benefit: "Problem solving & Patience",
        ageGroup: "2-3 years"
      }
    ]
  }
];
