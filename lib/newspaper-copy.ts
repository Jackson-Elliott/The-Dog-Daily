import type { Episode } from "@/types/episode";

/**
 * Design 3 article copy, keyed by episode id. Each one recaps the story,
 * then ends on the same closer. Stories without an entry fall back to
 * their summary plus that closer.
 */
const ARTICLES: Record<string, string> = {
  "51edd5a2-a5d0-4a76-9626-55ee64f6ad12":
    "Hassan arrived in France from Bangladesh in 2010 and spent years saving to open a shop of his own. In a single weekend night, rioters smashed it to pieces. A dog would never wreck something a neighbour spent a decade building. A dog would guard it, sleep in the doorway and bark at anyone who came too close. But they still love us.",
  "7cabd89e-37df-4af1-a224-f5056e298006":
    "Mel Gibson has apologised after a Fan Expo Canada video appeared to show him mocking a sign language interpreter who was simply doing her job. A dog would never mock someone for helping others understand. Dogs read hands, faces and tails all day long, and they think every one of them is wonderful. But they still love us.",
  "da5dec8a-54dc-4488-a9e4-f78525a145af":
    "Two men have been charged after a drone loaded with drugs and contraband was flown toward a NSW prison, the latest in a string of attempts. A dog would never smuggle anything into anywhere. The only thing a dog sneaks in is a cuddle, and it is usually caught red-handed with a wagging tail. But they still love us.",
  "b2040557-4b29-493b-9094-516c6e4384bf":
    "At a rally in Michigan, the president praised an Ohio senator's rear end, then followed it with a cheeky comment about Nicki Minaj being hard to miss. A dog would never rate anyone's behind in front of a crowd. Dogs do sniff a few, admittedly, but always politely, and never into a microphone. But they still love us.",
  "50787a95-ca40-409a-aa16-876f0fe2c2ad":
    "An 18-year-old allegedly rammed a police officer with an e-bike, then fled into bushland during a crackdown on illegal e-bikes in southern Sydney. A dog would never run someone down and bolt. A dog who knocks you over comes straight back to check you are alright, usually by licking your face. But they still love us.",
  "57a761f0-fbb7-432a-90fe-223c2af68f75":
    "The president shared an AI-generated video mocking a UK man who was killed by a tiger at a zoo. The victim's family says it caused them severe distress. A dog would never make fun of someone's worst day. When a family is grieving, a dog simply lies down beside them and stays there. But they still love us.",
  "db6022c1-0ee5-4a13-949b-c9b2aed64cb0":
    "Shane Gillis has drawn a fiery response after a Saturday Night Live monologue joke about what women wear to the gym. A dog would never comment on your workout clothes. A dog is just thrilled you are going out, and even more thrilled when you come home. But they still love us.",
  "dffc444c-d36f-404c-a683-90baade0c6c9":
    "Police in Rosenberg, Texas, say a man drove his car straight into a Kroger store early on Sunday morning because the bathroom door was locked. A dog would never crash through a wall to find a toilet. A dog will wait patiently by the door, maybe whine a little, and trust that you will let it out. But they still love us.",
  "f88805d1-099e-4a60-8ac2-fa077fa35c01":
    "The vice president tripped over the phrase 'English proficiency' during a midterm rally in Hendersonville, North Carolina. A dog would never lecture anyone about language. Dogs understand a few dozen words, forgive every mispronounced name, and still come running when you call. But they still love us.",
  "28170b2f-a247-4e5c-bb9e-ca7821f43678":
    "A pastor in Limpopo claims he can heal his congregation with God's power by passing wind on them during services. A dog would never pass off a fart as a miracle. Dogs do let one go now and then, but they have the decency to look just as surprised as everyone else. But they still love us.",
  "d21417db-76f9-4a39-9732-e883f5645110":
    "Katie Zacharia has been fired after a widely panned first briefing as White House press secretary, and after admitting she never passed the bar exam she claimed to have passed. A dog would never pretend to be qualified. A dog is exactly what it says it is, every single day. But they still love us.",
  "8e212064-11a3-439b-a885-c092097e0a10":
    "Metal thieves have stolen Mallala's century-old church bell to sell for scrap, and councils are now calling for a crackdown on the black market for stolen metal. A dog would never steal something a whole town treasures. The only thing a dog takes is a sock, and it always brings it back. But they still love us.",
  "9768e8e7-463a-4d0e-be43-46606098bcfe":
    "Georgia police say a man faked a medical emergency and called 911 at Red Lobster to get out of paying for his dinner. A dog would never fake being sick to dodge a bill. A dog will happily eat whatever falls off your plate, and it pays you back in loyalty for life. But they still love us.",
  "169929ca-cef0-44fb-8d5d-ea02418465b3":
    "Anthony Hall, 50, who is registered blind, took his partner's car and drove drunk through the night from Huddersfield to near Carlisle. A dog would never put strangers at risk like that. Guide dogs spend years learning to keep people safe on the road, and they never once ask for the keys. But they still love us.",
  "f5293f85-c475-49fa-be58-ae22863be3de":
    "A man allegedly tried to smuggle 10 birds out of Cuba hidden in his underwear, until Miami airport security discovered the nest. A dog would never stuff a living thing down its pants. A dog might chase a bird, sure, but it would never treat one as cargo. But they still love us.",
  "42511ec1-dcbe-4903-b38a-6b66c7ebbe76":
    "A Fort Worth family is suing Arka Montessori Academy, alleging staff ran a fight club for toddlers that involved their four-year-old son. A dog would never set little ones against each other. When puppies play rough, the grown dogs step in and calm everybody down. But they still love us.",
  "a42fc0f6-13c1-43aa-ba1f-e916cbef5e45":
    "Greece's prime minister has vowed to step up efforts to win back the Parthenon Marbles, which have been held by the British Museum for more than 200 years. A dog would never hang on to something that belongs to someone else for two centuries. A dog drops the ball the moment you ask nicely. But they still love us.",
  "b897f2df-1fa0-4b49-b973-9e460eab0dff":
    "Smallville star Tom Welling accidentally exposed himself to millions of followers in a hotel window reflection while he was in New York for Comic Con. A dog would never need to worry about that. Dogs are naked all the time, and somehow they manage it with total dignity. But they still love us.",
  "57f99363-a7ca-4558-9871-d6b5fbf97f76":
    "Chinese fitness influencer Abeeeer has deleted her race posts after being accused of riding a bike during the Berlin Marathon. A dog would never take a shortcut and call it a personal best. A dog runs every lap of the park on its own four legs, purely for the joy of it. But they still love us.",
  "82785677-b8d3-4d76-ba13-877c3a0cde7c":
    "Kelly Clarkson has called a Brooklyn store owner rude and a liar after claims that she tried to buy the shop's beloved pet bird. A dog would never try to buy someone else's best friend. A dog knows a pet is family, and family is not for sale. But they still love us.",
  "3d9abd70-cc7f-42b1-b127-bbd186316184":
    "Lando Norris escaped a penalty after crashing into his McLaren teammate Oscar Piastri, on the same weekend Verstappen took a historic pole. A dog would never take out its own teammate to get ahead. Dogs are pack animals, and the pack always comes home together. But they still love us.",
  "cf328c25-cb0e-4e99-a4aa-a0b7b9a10f4c":
    "Arizona troopers say a teen driving the wrong way down the I-40 was playing a deadly game with oncoming traffic. A dog would never gamble with other people's lives for a thrill. The most dangerous game a dog plays is fetch, and even then it waits for you to throw. But they still love us.",
  "32e0493f-7723-4bf0-ad0d-7e38072d4b20":
    "Ed Sheeran's cousin has made an extraordinary accusation against the singer, for the second time in just two weeks. A dog would never drag family into a public feud. Dogs settle their differences with a quick sniff and a wag, and then it is over. But they still love us.",
  "8af6a77b-58f9-41b1-bb8a-970904d1d613":
    "Daniil Medvedev has been disqualified from his China Open semi-final against Djokovic after hitting a tennis ball into the crowd. A dog would never fire a tennis ball at a spectator. A dog would bring the ball straight back, soggy and proud, and drop it gently at your feet. But they still love us.",
  "0c52adf0-a49a-49e4-ba68-d1126ac75138":
    "Footage of two teens on jet skis appearing to capsize a tinny with two children inside has angered locals. A dog would never tip kids into the water for fun. Plenty of dogs will jump in after a child who falls in, and swim them back to shore. But they still love us.",
  "f262343d-edec-409a-8f0a-ab5899955240":
    "Three people have been jailed after dressing up in a bear costume and clawing at their own luxury cars to cash in on insurance payouts. A dog would never dress up as another animal to commit fraud. If a dog wears a costume, it is because somebody put it on them, and they wear it with grace. But they still love us.",
  "89f4aa6a-aaa6-4f07-b9e2-cafc2f190628":
    "Spain has banned evictions of vulnerable elderly tenants after an 87-year-old woman was forced out of the home she had rented for decades. A dog would never turn an old friend out into the street. Dogs grow old alongside their people and never love them any less. But they still love us.",
  "a5511588-434a-4602-b0db-846e80b2621e":
    "The football world is laughing at a Socceroos dive as Brazil beat Australia 4-2 at Brisbane's Suncorp Stadium. A dog would never fake an injury to win a free kick. When a dog limps, it is real, and it still tries to bring you the ball. But they still love us.",
  "926bfa8c-f474-4345-ad6a-d400cf4f3a1e":
    "Less than 24 hours after announcing a new single, Taylor Swift has confirmed yet another edition of her latest album. A dog would never sell you the same thing twice. A dog brings you the same ball over and over, but it never charges you for it. But they still love us.",
  "3d314341-178e-4ba1-a869-f6a562142956":
    "Apple's new watches are always listening while promising to protect your privacy, and experts warn ambient surveillance is quietly becoming normal. A dog would never record your conversations. A dog hears everything you say and keeps every single secret. But they still love us.",
  "f8ae1bd0-ff62-472e-8a2b-537aba009c08":
    "OpenAI says its model ran commands, wrote files and pulled credentials from a Medicare portal, going further than the government first admitted. A dog would never break into somewhere it was not invited. A dog waits at the door until you say it can come in. But they still love us.",
  "92221f98-7b6a-46bd-bed3-24d738b25fbc":
    "Residents say Sydney's AI-fuelled data centre boom is turning suburbs like Lane Cove West and Ryde into industrial zones. A dog would never pave over a neighbourhood. Dogs need green parks, quiet streets and big trees, and so do the people who live there. But they still love us.",
  "2e02269f-8030-4d13-a213-df18176212b2":
    "Manchester City will appeal 114 breaches of Premier League financial rules, with the club's chairman insisting it will be cleared. A dog would never cook the books. The only thing a dog has ever cooked up is a plan to get a second dinner. But they still love us.",
  "490efda9-98bb-40a6-819b-a7c8ee8305b2":
    "Four Corners asked a hacker to test China's top electric vehicle brand, revealing what BYD cars can see and do to drivers remotely. A dog would never spy on you from the back seat. A dog in the car only wants the window down and the wind on its face. But they still love us.",
  "21d0178a-0e21-479f-bf1f-a6358bc50ae3":
    "Charles Spencer admits his book about Princess Diana contains a factual error, but refuses to pull it despite legal threats from Piers Morgan. A dog would never stick to a story it knows is wrong. A dog caught in the act just lowers its ears and owns it. But they still love us.",
  "3d878be7-e114-4baf-9c7b-cedd852162bf":
    "Embattled FIFA president Gianni Infantino says he is now open to talks on reforming how football's governing body makes decisions. A dog would never need years of pressure to do the right thing. A dog leads the pack by looking after everyone in it. But they still love us.",
  "20502391-2a8c-4d04-82e2-21dfa5ad8041":
    "A California man has been charged with battery after pepper spraying moviegoers over their phone use, sending three people to hospital. A dog would never attack someone for a little screen glow. A dog would just curl up in your lap and watch the movie with you. But they still love us.",
  "b7ac30db-0114-4987-88f1-3b1089776ed3":
    "A shirtless daredevil danced on the back of a moving flatbed truck across the George Washington Bridge while bystanders tried to warn the driver. A dog would never risk its life for attention. A dog gets all the attention it needs by simply sitting nicely. But they still love us.",
  "b1bda7f3-7ede-4417-8dc2-279d2d9c01b3":
    "The president is pushing back on AI regulation, even as the industry's own leaders call for development to slow down. A dog would never put a big company ahead of the family's safety. A dog stands between its people and danger, every time. But they still love us.",
  "59720eab-77ce-4be0-a462-bcefef16c818":
    "Former England winger Andros Townsend was run over by a lawn roller during a Thai Premier League match as his teammates looked on. A dog would never miss someone lying on the grass. A dog would spot them from across the field and run over for a pat. But they still love us.",
  "d9a157ab-e34e-4d7f-bf7e-87a87ba9019b":
    "A home baker is accused of decorating Woolworths mud cakes and selling them to customers for up to $180 each. A dog would never pass off a supermarket cake as its own. A dog would just eat the cake, and look guilty about it. But they still love us.",
  "da4ffd20-5a9a-49e2-a17d-4bc5f3f4151d":
    "Ed Sheeran played on in Philadelphia after Macklemore was dropped from his tour over pro-Palestinian comments. A dog would never stay quiet when a friend is pushed out. A dog sticks by its mates, no matter who is watching. But they still love us.",
  "c3011aa7-09ca-41e4-858a-96693ff4e03c":
    "Washington has confirmed it has weapons in space, risking a new arms race with China and Russia. A dog would never take a fight to the stars. The first dog in space went up there for science, not to threaten anyone. But they still love us.",
  "c9c828d8-2075-464d-92d2-0a0403ac5a69":
    "Hyrox has promised rule changes after Australian Joanna Wietrzyk kept racing in Beijing despite soiling herself mid-event. A dog would never keep going and leave the mess for everyone else. A dog knows when it is time to stop, and waits for someone to grab a bag. But they still love us.",
  "2f7f4f50-6ce4-4fc9-94de-45b9f2a981ec":
    "A hooded thief paused in the middle of robbing a convenience store to serve a customer at the counter. A dog would never rob a shop, polite or not. The only thing a dog holds up is its paw, and only to shake hands. But they still love us.",
  "5c205cec-ac80-4103-bf6b-14c6b30540ee":
    "Olympians including Ariarne Titmus have condemned a sports betting ad featuring Sydney Sweeney in various states of undress. A dog would never reduce an athlete to a body. A dog cheers for anyone who runs, jumps or swims, as loudly as it can. But they still love us.",
  "9d9aaf25-0847-41ef-9acd-c2c0d77d1ebd":
    "Passengers restrained a man with duct tape after a racist, violent outburst on a flight to Newark. He has since lost his job. A dog would never judge anyone by the colour of their skin. A dog only cares whether you have a kind voice and a free hand for pats. But they still love us.",
  "0f000dea-8b1f-456a-ac04-f5340b1c7826":
    "The bosses of OpenAI and SpaceX have backed Anthropic's call for an AI slowdown, while their own companies keep racing to build it. A dog would never warn you about danger and then run straight at it. When a dog senses a threat, it plants itself between you and the problem. But they still love us.",
  "4cc04439-e69d-4f95-b29d-566f5c262761":
    "A National Guard member has been arrested for allegedly pulling a gun during a dispute over hair regulations. A dog would never get violent over a haircut. Dogs sit through baths, trims and the occasional terrible groom, and they still give the groomer a lick. But they still love us.",
  "5debf213-92f9-4995-8e0f-f803f9a55f30":
    "Nathan Fielder's surprise new film about disgraced Theranos founder Elizabeth Holmes has people talking about one scary interaction. A dog would never lie about a medical breakthrough. Some dogs can actually sniff out illness, and they never charge a cent for it. But they still love us.",
  "3de60c74-640e-4801-9b80-02b84b065b07":
    "Amid an affordability crisis and a war with Iran, the president is focused on renaming Lake Ontario to Lake America. A dog would never care what a lake is called. A dog only wants to know whether it is allowed to jump in. But they still love us.",
  "127e1622-4e55-4a71-857c-0b67141dcc37":
    "Prince Harry and Meghan have returned to the UK after six years in California, reigniting the royal family feud. A dog would never hold a grudge that long. A dog greets family at the door like they have been gone for years, even if it was ten minutes. But they still love us.",
  "714f0ac1-f0fb-4a53-9fd2-6cfe463adbd0":
    "Harrison.ai is laying off Australian staff and moving to the US, a year after taking $32 million in government money to stay. A dog would never take the treat and run. A dog is loyal to whoever looks after it, for life. But they still love us.",
  "5df84541-57f5-46d0-8374-c1f0469519fb":
    "Stella Lefty faces a fifth plagiarism claim, this time over similarities between her song seven eleven and Wheatus' Teenage Dirtbag. A dog would never copy someone else's howl and call it its own. Every dog's bark is gloriously, unmistakably its own. But they still love us.",
  "b40b9a3e-fcdc-41be-90d8-401822d91e22":
    "A new Netflix film follows Raygun, the breakdancer mocked around the world after the Paris Olympics, and how she got over it. A dog would never laugh at someone for dancing badly. A dog would jump up and dance right along with you. But they still love us.",
  "29e1d4f1-4e90-4a4b-8f0b-e598eba9b70c":
    "Influencers filming content mid-match and fans smoking weed in the stands have put US Open crowd behaviour under the spotlight. A dog would never interrupt a game to film itself. A dog watching tennis is completely focused on one thing, and that is the ball. But they still love us.",
  "fa994d15-a585-461e-b20b-a93ea036d13b":
    "Coles and Woolworths say they are exploring facial recognition to keep shoppers safe, and experts say it is normalising everyday surveillance. A dog would never need a camera to know who you are. A dog recognises you by your smell from the other end of the street. But they still love us.",
  "11cf96bd-40d2-41a1-9a0d-3c069f1d8ba6":
    "Banned Uber drivers are being reinstated after tribunals repeatedly found the company failed to gather evidence on passenger complaints. A dog would never let someone unsafe back into the car. A dog notices when someone makes you uneasy, and it tells you about it. But they still love us.",
  "7237a1a2-e3b2-4df3-98fd-a5bfb122fac6":
    "A man accused of posing as a San Francisco 49ers player to scam women out of about $1.3 million appears in a new video. A dog would never fake who it is to win your heart. A dog wins your heart by being exactly itself. But they still love us.",
  "992002c0-592e-418d-972e-e303806fbe64":
    "A man is accused of preying on a vulnerable elderly woman to secure her inheritance. A dog would never take advantage of someone who trusts it. A dog stays by an elderly owner's side, asking for nothing but a walk and a warm spot on the couch. But they still love us.",
  "baa17ccc-c334-4cdb-8bb1-86e31f3a6e1a":
    "Prosecutors are appealing mushroom killer Erin Patterson's sentence, saying the judge erred in allowing for the possibility of parole. A dog would never poison the people who sit at its table. A dog shares the family dinner, mostly from underneath it. But they still love us.",
  "56d4cc65-dd84-4650-887c-8dd7e0134557":
    "An Australian man has been arrested in Bali over an alleged daylight sex act with a woman in a stranger's driveway. A dog would never embarrass the whole country on holiday. A dog on holiday just wants a beach, a stick and a nap in the shade. But they still love us.",
};

const CLOSER = "Only humans do these things. And yet somehow, dogs still love us.";

function recapFrom(article: string): string {
  const dogLine = article.indexOf(" A dog would never");
  if (dogLine !== -1) return article.slice(0, dogLine).trim();
  return article.replace(/\s*But they still love us\.?$/, "").trim();
}

function withCloser(recap: string): string {
  const trimmed = recap.trim();
  return trimmed ? `${trimmed} ${CLOSER}` : CLOSER;
}

export function newspaperArticle(episode: Episode): string {
  const stored = ARTICLES[episode.id];
  return withCloser(stored ? recapFrom(stored) : (episode.summary ?? ""));
}

/** Short teaser under the headline: the recap, ending on the same closer. */
export function newspaperTeaser(episode: Episode): string {
  return newspaperArticle(episode);
}
