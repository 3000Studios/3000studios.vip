/**
 * The 3000 Studios Press book catalog — the titles on sale in the studio's
 * own store. Metadata here is the sealed publisher metadata for each title
 * (author Jeremy Swain, imprint 3000 Studios Press). Ebooks are sold direct
 * through the studio Payhip store — every title is $9.99, EPUB + PDF.
 * The BOOKS array is written in strict JSON syntax on purpose: the site
 * meta generator (scripts/generate-site-meta.mjs) parses it verbatim to
 * build the crawlable /books content.
 */

export interface BookEntry {
  id: string;
  title: string;
  subtitle: string;
  categories: string;
  description: string;
}

export const BOOKS_STORE_URL = 'https://payhip.com/3000Studios';
export const BOOKS_PRICE = '$9.99';

/** Also published on Leanpub (same studio catalog). */
export const LEANPUB_TITLES = [
  'Grow the Channel',
  'Compounding Content',
  'The Twelve Cookies of Christmas',
];

export const BOOKS: BookEntry[] = [
  {
    "id": "P3-C01",
    "title": "The Twelve Cookies of Christmas",
    "subtitle": "Bake, Swap & Gift: A Festive Cookie Collection",
    "categories": "Primary: Cooking / Holiday · Secondary: Cooking / Courses & Dishes / Cookies",
    "description": "Every December, the same quiet negotiation happens in kitchens everywhere: you want a cookie tin that looks abundant — the kind people open slowly and remember in January — but you also have a job, a family, and a finite amount of counter space. The answer is not more cookies. It is the right cookies: exactly twelve signature Christmas cookies, each different in flavor, texture, shape, and color. Inside are complete recipes for Vanilla Bean Sugar Cut-Outs, Gingerbread, Snickerdoodles, Chocolate Crinkles, Peanut Butter Blossoms, Raspberry Thumbprints, Linzers, Classic Butter Shortbread, Mexican Wedding Cookies, Peppermint Bark Cookies, Eggnog Cookies, and Stained-Glass Window Cookies — each with exact quantities, temperatures, and timing, plus variations, baker's notes, and serving, storing, and gifting guidance. The back of the book is devoted to the social life of cookies: a complete cookie-swap hosting guide, a packaging chapter that turns a plain batch into a gift with presence, and a December baking calendar that spreads the twelve across the month — so you are never baking at midnight on December 23rd."
  },
  {
    "id": "P3-F01",
    "title": "The Ember Cartographer",
    "subtitle": "Maps Drawn in Ash, Roads That Burn Away",
    "categories": "Primary: Fiction / Fantasy / Epic · Secondary: Fiction / Fantasy / Action & Adventure",
    "description": "Sera Vahl draws roads that exist only while they burn. In the Ashen Reach — a country that has drifted apart since the Sundering, where hills wander in the night and no map stays true — an ember cartographer's inked line, once lit, becomes a road of pale fire that lasts exactly as long as the map burns. Sera has drawn three hundred and twelve roads in eleven years and has never lost a single traveler. Then an Imperial captain rides into her depot with a warrant and a requisition bearing one name: hers. The Empire's army is freezing before the Marrowgate pass, and the Emperor wants a second road — around the pass, through the Widow's Teeth, into the Vale of Cinders. It is a road no living cartographer has charted. It is also a road Sera walked once, at nine years old, holding her grandmother's hand, while it burned away behind them so that no one could follow. To draw it is to hand an army a weapon and betray the memory she has guarded all her life. To refuse is to be hunted by both sides of the war for the one map she will not draw. The Ember Cartographer is the first book of The Ashen Reach — an epic fantasy of fire, memory, and the price of a road home."
  },
  {
    "id": "P3-F02",
    "title": "The Foxglove Armistice",
    "subtitle": "A Novel of the Poison Garden Courts",
    "categories": "Primary: Fiction / Fantasy / Epic · Secondary: Fiction / Fantasy / General",
    "description": "In Veridia, every important sentence is said twice: once in words, and once in flowers — and the flowers are the version that counts, because the flowers can kill you. For ninety years the great houses of Foxglove and Aconite have kept a cold peace, conducting their diplomacy entirely through poison gardens, where every bouquet is a threat and every antidote a concession. Odile Renn, nineteen, is an apprentice poison-gardener of House Foxglove — raised wild in the physic gardens of a ruined abbey, grazing on belladonna and foxglove until her blood learned to read poison the way other people read letters. When a spring bouquet arrives that reads as war in a dead dialect — and the envoy who carried its written gloss is found murdered on the border road — Odile is the one who reads it aloud to the council, stem by stem. The house's answer is not a counter-bouquet. It is a gardener. At the armistice summit in the Glasshouse of the Borders, each house must send one gardener to certify every stem, every dish, and every cup on the table. House Foxglove sends its apprentice: young enough to be beneath insult, gifted enough to taste a composition at a dilution that would kill the tasters — and expendable enough that, when the hidden hand behind the false bouquet moves against the talks, it will move against her first. The Foxglove Armistice is a standalone fantasy of poison gardens and cold diplomacy, where a girl nobody could afford to keep must keep a peace nobody else can."
  },
  {
    "id": "P3-M02",
    "title": "The Last Train to Larkspur Hollow",
    "subtitle": "A Small-Town Mystery",
    "categories": "Primary: Fiction / Mystery & Detective / Cozy · Secondary: Fiction / Mystery & Detective / Women Sleuths",
    "description": "The 9:15 is the last train to Larkspur Hollow — and the railroad has already served notice that it will not be running much longer. On a Friday night in October it brings home six of the town's own and one stranger: Elias Crowe, carrying a brown leather document case and three days' business that will not wait past Monday, when a hearing will decide the fate of the town's land, its station, and its name on the map. By morning, Crowe is dead. Nell Vance, the station agent who logged his arrival the way she has logged every train for nineteen years, knows every passenger who stepped down onto her platform — and before the weekend is out, each of them has lied to her. The mayor. The reverend. The doctor. The grocer. Even the schoolteacher. The police have the waiting room; Nell has the logbook, the ticket stubs, and nineteen years of watching who gets on and off the 9:15. The Last Train to Larkspur Hollow is a fair-play small-town mystery: every clue planted in plain sight, a platform full of suspects, and a sleuth whose sharpest instrument is paying attention."
  },
  {
    "id": "P3-M03",
    "title": "The Collector's Marginalia",
    "subtitle": "An Antiquarian Book Mystery",
    "categories": "Primary: Fiction / Mystery & Detective / Cozy · Secondary: Fiction / Mystery & Detective / Women Sleuths",
    "description": "Elias Crowe bought other men's thoughts. For forty years the Aldergate schoolteacher collected not fine bindings but annotations — the arguments, corrections, and whole second books that dead readers wrote in the margins of the first — until his library of annotated treasures became a legend of the antiquarian trade. Now Crowe is three weeks dead, and estate-sale cataloguer Nora Quinn has six weeks to catalogue the collection entire before it goes under the hammer. Then the margins begin to speak out of turn: in Crowe's own unmistakable late hand, in ink too fresh for a man three weeks in his grave, Nora finds annotations that do not argue with their authors but prophesy — a death, named and dated, beginning with one scheduled for Friday. The hand is his. The ink is new. To catalogue the library honestly, Nora must learn all three of the dead man's hands and read the margins the way their writer is writing them: as a schedule. The Collector's Marginalia is a fair-play antiquarian mystery — every clue set down in the open, in the white space of other men's books, for a sleuth whose deadliest skill is reading carefully."
  },
  {
    "id": "P3-S01",
    "title": "Hidden in Plain Sight",
    "subtitle": "Secret Rooms, Forgotten Places & the Things Hiding in Everyday Life",
    "categories": "Primary: Social Science / Popular Culture · Secondary: History / Social History",
    "description": "The world is larger than it looks. Behind the bookcase of a quiet manor there is a priest hole where a man once folded himself into darkness while soldiers searched the next room. Beneath the city there are handsome tiled stations where no train has stopped in generations. Under the reservoir there is a village that comes back, stone by stone, in drought summers. Hidden in Plain Sight is a guided tour of everything your brain edited out: secret rooms and speakeasies hidden behind florist shops, compartments and caches and clever boxes, hiding places of wartime, messages concealed inside paintings and songs, lost words and lost inventions, and the second city written over your own street in ghost signs, masons' marks, and dates carved above doorways you have never looked up to see. Drawing on widely reported history and keeping legend honestly labeled as legend, Jeremy Swain closes with the real subject of the book — attention itself — including twenty-one field-note exercises in the appendix that will train your eye to find the hidden world at street level, in your own home, on your own daily walk."
  },
  {
    "id": "P3-S04",
    "title": "Grow the Channel",
    "subtitle": "The YouTube Growth Playbook: From Zero Subscribers to a Real Audience",
    "categories": "Primary: Business & Economics / Marketing & Sales · Secondary: Computers & Technology / Internet & Social Media",
    "description": "Every channel you admire started at zero — zero subscribers, zero views, zero comments. Grow the Channel is the honest playbook for what comes next: not shortcuts, not algorithm superstition, but a repeatable system for building a real audience from a standing start. Jeremy Swain walks you through choosing a niche you can actually serve, packaging videos with titles and thumbnails that tell the truth well, earning the first thirty seconds, and treating your first ten videos as experiments instead of verdicts. You will learn retention without tricks, a consistency system that does not burn you out, Shorts as a discovery engine that feeds long-form, community and collaboration done honestly, and the few analytics numbers that actually matter — ending with monetization readiness, explained honestly, and the long game of a catalog that compounds. Includes per-chapter action checklists, a 90-day starter plan, and templates and worksheets you can use from your very first upload. No guaranteed numbers and no promised timelines — just the avoidable mistakes removed, and a system you can keep."
  },
  {
    "id": "P3-S05",
    "title": "Compounding Content",
    "subtitle": "How to Gain — and Keep — Momentum on Social Media",
    "categories": "Primary: Business & Economics / Marketing & Sales · Secondary: Business & Economics / Small Business & Entrepreneurship",
    "description": "Almost every creator knows the feeling: an hour of work on a single post, a small lift of hope at publish — and then almost nothing happens. Compounding Content argues that the problem is rarely the post; it is the absence of a system. Jeremy Swain shows how momentum on social media actually builds: each piece of work makes the next one easier to make, easier to find, and more likely to be trusted. The book starts with pillars, not posts; builds an idea-capture system so you never run out of material; teaches hooks and repeatable formats that earn attention honestly; and gives a batching production system and a posting rhythm you can sustain without burning out. Engagement loops, collaboration, and the repurposing flywheel — one idea, many lives — turn a back catalog into an engine, while a short list of honest analytics signals replaces obsession. A full chapter is devoted to stalls: the four plateaus, platform changes, breaks, and starting again. Appendices provide a 90-day momentum plan, week by week, and per-chapter action checklists. No audience, reach, or income guarantees — a system to test against your own evidence, and keep."
  }
];
