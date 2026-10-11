require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const db = require("./index");
const { getEmbedding } = require("../matching/embed");

const posts = [
  {
    title: "The Behavior of Red Foxes",
    content: "Red foxes are highly adaptable mammals known for their cunning intelligence. They are omnivores found across the Northern Hemisphere. The red fox has distinctive orange-red fur, a white underbelly, and a bushy tail. They are solitary hunters that prey on rabbits, birds, and small rodents."
  },
  {
    title: "Gray Wolves: Apex Predators",
    content: "The gray wolf is the largest wild member of the dog family. Wolves are social animals that live and hunt in packs. They communicate through howling and are known for their role in maintaining healthy ecosystems by controlling prey populations."
  },
  {
    title: "Man's Best Friend: Dogs",
    content: "Domestic dogs have been companions to humans for thousands of years. They come in hundreds of breeds, from tiny chihuahuas to massive Great Danes. Dogs are highly intelligent and trainable, making them ideal as pets, working animals, and service animals."
  },
  {
    title: "Brown Bears in the Wild",
    content: "Brown bears are one of the largest land predators on Earth. They are omnivores that eat berries, fish, and small mammals. Brown bears hibernate during winter months and are known for their massive size and strength. Grizzly bears are a subspecies of brown bear."
  },
  {
    title: "Deer: Graceful Forest Animals",
    content: "Deer are hoofed mammals found in forests and grasslands worldwide. Male deer grow antlers which they shed annually. Species include white-tailed deer, red deer, fallow deer, and reindeer. They are herbivores and important prey animals in many ecosystems."
  },
  {
    title: "Fox Cubs: Early Life of Red Foxes",
    content: "Red fox cubs are born blind and helpless in underground dens. The mother fox nurses them for several weeks before they begin exploring outside. Fox families are tight-knit, with both parents helping raise the young. Cubs develop their distinctive orange fur as they mature."
  },
  {
    title: "Wolf Pack Dynamics",
    content: "Wolf packs are family units led by an alpha pair. Pack sizes range from 2 to 15 wolves. They cooperate to hunt large prey like elk and bison. Young wolves called pups are raised communally by the whole pack."
  },
  {
    title: "Dog Breeds and Their Origins",
    content: "Different dog breeds were developed for specific purposes. Retrievers were bred for hunting, border collies for herding, and huskies for sled pulling. Today most dogs are kept as companions. The domestic dog descended from ancient wolves thousands of years ago."
  },
  {
    title: "Bear Hibernation and Survival",
    content: "Bears spend winter in a state of torpor, living off fat reserves built up during autumn. During hibernation their heart rate drops dramatically. Female bears give birth during hibernation. When they emerge in spring they are hungry and immediately begin foraging."
  },
  {
    title: "Antlers and Deer Behavior",
    content: "Male deer grow and shed antlers every year. Antlers are used for combat during mating season. The size of antlers indicates the health and age of a deer. Deer are crepuscular, most active at dawn and dusk, and communicate through scent markings."
  }
];

async function seedPosts() {
  const existing = db.prepare("SELECT COUNT(*) as count FROM posts").get();
  if (existing.count > 0) {
    console.log("Posts already seeded, skipping.");
    return;
  }

  console.log("Seeding posts and generating embeddings...");

  for (const post of posts) {
    const id = uuidv4();
    db.prepare("INSERT INTO posts (id, title, content) VALUES (?, ?, ?)")
      .run(id, post.title, post.content);

    const embedding = await getEmbedding(post.title + " " + post.content);
    const vectorId = uuidv4();
    db.prepare("INSERT INTO post_vectors (id, post_id, embedding) VALUES (?, ?, ?)")
      .run(vectorId, id, JSON.stringify(embedding));

    console.log(`✓ Seeded: "${post.title}"`);
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log("Done seeding posts.");
}

seedPosts().catch(console.error);