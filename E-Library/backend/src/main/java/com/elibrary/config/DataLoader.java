package com.elibrary.config;

import com.elibrary.model.Book;
import com.elibrary.repository.BookRepository;
import com.elibrary.repository.ActivityLogRepository;
import com.elibrary.repository.ReadingProgressRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;

// @Component - Disabled to prevent startup data initialization issues
public class DataLoader implements CommandLineRunner {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private ReadingProgressRepository readingProgressRepository;

    @Override
    public void run(String... args) throws Exception {
        // DataLoader disabled - use schema.sql for data initialization instead
        // // Clear all related records first (respect foreign key constraints)
        // readingProgressRepository.deleteAll();
        // activityLogRepository.deleteAll();
        // bookRepository.deleteAll();
        // 
        // // Then load fresh data
        // loadData();
    }

    private void loadData() {
        // Fiction Books
        createBook("The Great Gatsby", "F. Scott Fitzgerald",
            "A classic novel about the American Dream set in the Jazz Age.", 180,
            "978-0743273565", 1925, "Fiction",
            "https://covers.openlibrary.org/b/id/7725670-M.jpg",
            "The Great Gatsby by F. Scott Fitzgerald\n\nChapter 1: The Narrator Arrives\n\nIn my younger and more vulnerable years my father gave me advice that I've been turning over in my mind ever since. \"Whenever you feel like criticizing anyone,\" he told me, \"just remember that all the people in this world haven't had the advantages that you've had.\"\n\nHe didn't say any more, but we've always been unusually communicative in a reserved way, and I understood that he meant a great deal more than that. In consequence, I'm inclined to reserve all judgments, a habit that has opened up many curious natures to me and also made me the victim of not a few veteran bores. The abnormal mind is quick to detect and attach itself to this quality when it appears in a normal person, and so it came about that in College I was unjustly accused of being a politician, because I was privy to the secret griefs of wild, throbbing spenders and to the violent scenes of great women.\n\nMost of the confidences were unsought and given me with that particular unaffected flattery that the very rich reserve for the very young. The world, I learned, contains a moral emptiness that cannot be filled by even the greatest wealth. I had no prejudice against wealth—I merely wanted to understand it, the golden dreams that drove men to achieve it, the terrible choices it demanded.\n\nSo I decided to move to West Egg and rent a small house beside the mansion of a man I knew only by reputation. It was summer, 1922, and the era of jazz was in full bloom. The gardens of the great estates bloomed with nervous energy.",
            "https://www.planetebook.com/free-ebooks/the-great-gatsby.pdf");

        createBook("To Kill a Mockingbird", "Harper Lee",
            "A gripping tale of racial injustice and childhood innocence.", 281,
            "978-0061120084", 1960, "Fiction",
            "https://covers.openlibrary.org/b/id/7725656-M.jpg",
            "To Kill a Mockingbird by Harper Lee\n\nChapter 1: The Finch Family\n\nWhen he was nearly thirteen, my brother Jem got his arm badly broken at the elbow. When it healed, and Jem's fears of never being able to play football were assuaged, he was seldom self-conscious about his injury. His left arm was somewhat shorter than his right; when he stood or walked, the back of his hand was at right angles to his body, his thumb parallel to his thigh.\n\nI maintain that the Ewells started it all, but Jem, who was four years my senior, said it started long before that. He said it began the sum mer Dill came to us, when Dill first gave us the idea of making Boo Radley come out. I said if he wanted to take a broad view of the thing, it really began with Andrew Jackson. If General Jackson hadn't run the Creek Nation up the creek, Simon Finch would never have paddled up the Alabama, and where would we be then?\n\nWe were sitting on Miss Rachel's front steps one summer evening after supper when Dill came to us, his eyes wide with plans. We had not seen Dill for a year, and he had grown considerably. He said he had come to stay for the summer, and that he was going to study law. Jem asked how he was going to study law without a book, and Dill had it all figured out.\n\n\"We're going to make Boo Radley come out,\" he announced. \"We're going to drive him crazy.\"\n\nJem was the first to see the possibilities of these words and began to think of plans. I was content to follow wherever Jem led, as I always did.",
            "To%20Kill%20a%20Mockingbird%20-%201960.pdf");

        createBook("1984", "George Orwell",
            "A dystopian novel about totalitarianism and surveillance.", 328,
            "978-0451524935", 1949, "Dystopian",
            "https://covers.openlibrary.org/b/id/7725720-M.jpg",
            "1984 by George Orwell\n\nBook One: Chapter 1 - The Totalitarian State\n\nIt was a bright cold day in April, and the clocks were striking thirteen. Winston Smith, his chin nuzzled into his breast in an effort to escape the vile wind, slipped quickly through the glass doors of Victory Mansions, though not quickly enough to prevent a swirl of gritty dust from entering along with him.\n\nThe hallway smelt of boiled cabbage and old rag mats. At one end of it a coloured poster, too large for indoor display, had been tacked to the wall. It depicted simply an enormous face, more than a metre wide: the face of a man of about forty-five, with a heavy black moustache and ruggedly handsome features. Winston made for the stairs. It was no use trying the lift. Even at the best of times it was seldom working, and at present the electric current was cut off during daylight hours. It was part of the economy drive in preparation for Hate Week.\n\nWinston's flat was on the seventh floor. As he climbed the staircase, he could see through each landing window the landscape of London stretching out in all directions. Vast pyramidal structures of glittering white concrete rose up in every direction, soaring away into the misty sky. These were the government buildings.",
            "https://archive.org/download/1984_20170117/1984.pdf");

        createBook("Pride and Prejudice", "Jane Austen",
            "A romantic novel about manners, marriage, and social status.", 432,
            "978-0141439518", 1813, "Romance",
            "https://covers.openlibrary.org/b/id/7725632-M.jpg",
            "Pride and Prejudice by Jane Austen\n\nVolume I: Chapter 1 - The Bennet Family\n\nIt is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife. However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered as the rightful property of some one or other of their daughters.\n\n\"My dear Mr. Bennet,\" said his lady to him one day, \"have you heard that Netherfield Park is let at last?\" Mr. Bennet replied that he had not.\n\n\"But it is,\" returned she; \"for Mrs. Long has just been here, and she told me all about it.\" Mr. Bennet made no answer.\n\n\"Do not you want to know who has taken it?\" cried his wife impatiently.\n\n\"You want to tell me, and I have no objection to hearing it.\"\n\nThis was invitation enough. \"Why, my dear, you must know, Mrs. Long says that Netherfield is taken by a young man of large fortune from the north of England; that he came down on Monday in a chaise and four to see the place, and was so much delighted with it that he fell in with Mr. Morris immediately.\"\n\n\"What is his name?\" \"Bingley.\" \"Is he married or single?\" \"Oh! Single, my dear, to be sure!\"\n\nMrs. Bennet clapped her hands in delight at the prospect of so advantageous an arrangement for her eldest daughter.",
            "http://localhost:8080/api/files/Pride-and-Prejudice-Jane-Austen.txt");

        createBook("The Catcher in the Rye", "J.D. Salinger",
            "A story of adolescence and alienation in post-war America.", 295,
            "978-0316769174", 1951, "Fiction",
            "https://covers.openlibrary.org/b/id/7725709-M.jpg",
            "The Catcher in the Rye by J.D. Salinger\n\nChapter 1: The Beginning\n\nIf you really want to hear about it, the first thing you'll probably want to know is where I was born, and what my lousy childhood was like, and how my parents were occupied and all before they had me, and all that David Copperfield kind of crap, but I don't feel like going into it, if you want to know the truth. It really does bore me, if you want to know the truth.\n\nIn the first place, that stuff bores me, and in the second place, my parents will have about two hemorrhages apiece if I tell anything pretty personal about them. They're quite touchy about anything like that, especially my father. It kills me, it really does.\n\nBut I'll tell you what I did after I got kicked out. I got some money, and I've got this madman stuff I do sometimes. It really does kill me. What I'll probably do is, I'll just tell you about this madman stuff I'm always doing, and then get the hell out of here and go live in some cabin somewhere. It would be nice, it really would.\n\nI really would. That's all I do, and that's all I think about. That's the only thing that stops me from going absolutely mad sometimes.",
            "https://archive.org/download/the-catcher-in-the-rye/The%20Catcher%20in%20the%20Rye.pdf");

        createBook("Brave New World", "Aldous Huxley",
            "A futuristic novel exploring happiness, technology, and freedom.", 288,
            "978-0060869274", 1932, "Dystopian",
            "https://covers.openlibrary.org/b/id/7725735-M.jpg",
            "Brave New World by Aldous Huxley\n\nPart I: A New Society\n\nA squat grey building of only thirty-four stories. Over the main entrance the words CENTRAL LONDON HATCHERY AND CONDITIONING CENTRE, and, in a shield, the World State's motto, COMMUNITY, IDENTITY, STABILITY.\n\nThe enormous room on the ground floor faced towards the north. Cold for all the summer beyond the panes, for all the tropical heat of the room itself, a harsh thin light glared through the windows, hungrily seeking some draped silhouette, some draped nude. January or March it might be; two years in the London years of stability it might be; but the cold, impotent sunlight, naked and glittering through the windows, was harsh and thin and merciless.\n\nInside the conditioning theatre, the light had been filtered through screens of glass that were as invisible as air. The pale, oval body of the Tropical Resident stretched out on the operating table, inert, unconscious, while above it hung the great delicate apparatus of the conditioning machine. The Tropical Resident's eyes were closed; his mouth hung slightly open; he was utterly still and peaceful-looking, as a man in deep and dreamless sleep. The air in the theatre was warm and humid and laden with the subtle scent of something that suggested both roses and over-ripe fruit.",
            "https://archive.org/download/BraveNewWorld/Brave%20New%20World.pdf");

        createBook("Jane Eyre", "Charlotte Brontë",
            "A gothic romance about independence and love.", 507,
            "978-0141441146", 1847, "Romance",
            "https://covers.openlibrary.org/b/id/7725689-M.jpg",
            "Jane Eyre by Charlotte Brontë\n\nVolume I: Chapter 1 - Childhood\n\nThere was no possibility of taking a walk that day. We had been wandering, indeed, in the leafless shrubbery an hour in the morning; but since dinner (Mrs. Reed, when there was no company, dined early) the cold winter wind had brought with it clouds so sombre, and a rain so penetrating, that further out-door exercise was now out of the question.\n\nI was glad of it: I never liked long walks, especially on chilly afternoons: dreadful to me was the drenched condition of the nates of my dress and the chilled condition of my extremities; but as Mrs. Reed would have it that they were beneficial, and that a child conceived in this manner would be benefited thereby, I was left to myself and to confuse myself with miserable thoughts.\n\nI was a discord in Gateshead Hall; I was like nobody there. My uncle Reed had been dead nine years: it was in his house that my cousin John Reed now held the sceptre of rule, because he was the male, and because he was older than his sisters, and because the servants feared him. He bullied and punished me; not two or three times in the week, not once or twice in the day, but continually. My pulse stopped, and my heart stood still; my stretched arm was paralysed.",
            "http://localhost:8080/api/files/Jane-Eyre-Charlotte-Bronte.txt");

        createBook("Wuthering Heights", "Emily Brontë",
            "A dark tale of passion and revenge on the Yorkshire moors.", 352,
            "978-0141439556", 1847, "Romance",
            "https://covers.openlibrary.org/b/id/7725705-M.jpg",
            "Wuthering Heights by Emily Brontë\n\nChapter 1: Lockwood's First Visit\n\nI have just returned from a visit to my landlord—the solitary neighbour that I shall be troubled with. This is certainly a beautiful country! In all England, I do not believe that I could have fixed on a situation so completely removed from the stir of society. A perfect misanthropist's heaven: and Mr. Heathcliff and I are such a suitable pair to divide the desolation between us.\n\nVarious circumstances kept me in ignorance of the events which had taken place during my stay in the metropolis. When I was invited by my new landlord to call upon him, I little suspected the strange history that belonged to the house, nor could I have imagined the violent nature of the man who claimed it. My curiosity was aroused, however, by the peculiar melancholy that seemed to pervade the establishment.\n\nWuthering Heights is the name of Mr. Heathcliff's dwelling. 'Wuthering' being a significant provincial adjective, descriptive of the atmospheric tumults to which its station is exposed in stormy weather. Pure, bracing ventilation they must have up there at all times, indeed: one may guess the power of the north wind blowing over the edge, by the excessive slant of a few stunted firs at the end of the house; and by a range of gaunt thorns all stretching their limbs one way, as if craving alms of the sun.",
            "http://localhost:8080/api/files/Wuthering-Heights-Emily-Bronte.txt");

        // Mystery & Thriller Books
        createBook("The Girl on the Train", "Paula Hawkins",
            "A psychological thriller about a woman entangled in a murder investigation.", 423,
            "978-1594634025", 2015, "Thriller",
            "https://covers.openlibrary.org/b/id/8272502-M.jpg",
            "The Girl on the Train by Paula Hawkins\n\nMONDAY, JULY 13\n\nMORNING\n\nThe screech of the brakes jolts me awake. For a moment, I don't know where I am. I'm not at home. The room is small, the light greyish. I can hear the rumble of traffic from the main road, and the screech of the brakes again, and then I remember: I'm on the 8:04 from Ashbury to London Waterloo. I'm on the train.\n\nI've been commuting to London for years, though I don't work in London anymore. Not for a year. I travel back and forth every day, but not for any good reason. I do it because I think it's better than using the car, and also because I feel like I'm still involved in something. As if I'm still part of that world, even though I've been pushed to the edge of it.\n\nI'm a drinker. I know that. I'm a drunk, not a drinker. There's a distinction, or so I've been told. I drink because I'm a drunk, and I drink because I'm sad, and I drink because I'm lonely, and I drink because it makes the world seem less lonely. Tonight, though, I drank because I was afraid. Tonight, I drank because something terrible happened on my train.",
            "https://archive.org/download/TheGirlOnTheTrain/The%20Girl%20On%20The%20Train.pdf");

        createBook("Gone Girl", "Gillian Flynn",
            "A gripping psychological thriller about a missing wife.", 422,
            "978-0553418564", 2012, "Thriller",
            "https://covers.openlibrary.org/b/id/8420550-M.jpg",
            extractPdfContent(),
            "http://localhost:8080/api/files/15-05-2021-082725Gone-Girl-Gillian-Flynn.pdf");

        createBook("The Da Vinci Code", "Dan Brown",
            "A mystery thriller involving art, history, and religious conspiracy.", 487,
            "978-0307474275", 2003, "Mystery",
            "https://covers.openlibrary.org/b/id/8254194-M.jpg",
            "The Da Vinci Code by Dan Brown\n\nPROLOGUE\n\nThe Louvre Museum, Paris, 11:46 P.M.\n\nMuseum curator Jacques Saunière staggered through the vaulted archway of the museum's main gallery. Behind him, he could hear the footsteps of his pursuer echoing against the polished floor. Jacques' heart pounded as he moved deeper into the labyrinth of the Louvre's endless corridors.\n\nThe footsteps grew closer. Saunière's aged legs burned as he ran past the Coronation of Napoleon and Marie Antoinette. He knew these halls better than any man alive, and yet tonight, their endless passageways seemed to conspire against him, each corridor leading him deeper into his own demise.\n\nHis pursuer was getting closer. In moments, Saunière knew, his entire life's work—a lifetime of secrets—would come to an end. He pulled a heavy wooden panel from the wall and shoved it behind him, but it did little to slow his pursuer. The footsteps continued, relentless and terrifying.",
            "https://archive.org/download/TheDaVinciCode/The%20Da%20Vinci%20Code.pdf");

        createBook("The Midnight Library", "Matt Haig",
            "A woman explores alternate versions of her life in a magical library.", 304,
            "978-0525559474", 2020, "Fiction",
            "https://covers.openlibrary.org/b/id/10484149-M.jpg",
            "The Midnight Library by Matt Haig\n\nChapter 1: The Midnight Library\n\nNora Seed had always wondered which version of her life was the real one. There were certain key moments that defined her life, moments where she could have gone left instead of right, said yes instead of no, chosen one path over another. In each instance, she had chosen the path that led to unhappiness.\n\nAt thirty-five, Nora was alone, unemployed, and had just been fired from her job as a cello teacher. Her last meaningful relationship had ended a year ago. She lived in a flat above a funeral home, and she had no friends to speak of. She had once dreamed of being a professional cellist, but she had given up on that dream at nineteen.\n\nNora stood on the edge of the platform at King's Cross Station, watching the trains come and go. She thought about all the choices she had made, all the times she had said no when she should have said yes, all the times she had been afraid when she should have been brave.\n\nThen everything went black.\n\nWhen she opened her eyes again, she found herself in a vast library. The shelves stretched infinitely in all directions, lit by a soft, ethereal glow. A woman in a tweed jacket stood behind a desk, looking at her knowingly.",
            "https://archive.org/download/TheMidnightLibrary/The%20Midnight%20Library.pdf");

        // Science Fiction Books
        createBook("Dune", "Frank Herbert",
            "An epic science fiction novel about politics and ecology on a desert planet.", 688,
            "978-0441172717", 1965, "Science Fiction",
            "https://covers.openlibrary.org/b/id/7725679-M.jpg",
            "Dune by Frank Herbert\n\nBOOK 1: DUNE\n\nIn the week before their departure to Arrakis, when all the final scurrying about had reached a nearly unbearable frenzy, an old woman came to visit Paul in his father's estate.\n\nShe was a Bene Gesserit, an adept of that mysterious and ancient organization that served emperors and kings throughout the known universe. Gaius Helen Mohiam was her name, and she had come to decide whether young Paul Atreides was to be tested by an ancient device known as a Gom Jabbar—a test of human awareness and control.\n\nLet me tell you of Arrakis, that desert planet where the most valuable substance in the universe flows beneath the sand. The spice, as it is known, extends life, expands consciousness, and makes space travel possible. Without the spice, the great ships of the Spacing Guild cannot navigate the folds of space.\n\nArrakis, also known as Dune, is a planet of extremes. Vast oceans of sand stretch across its surface, dunes towering like mountains in the wind. The temperature during the day can exceed one hundred and thirty degrees, and at night it plummets below freezing. Few worlds are more hostile to human life, yet mankind has learned to survive here, even to thrive.\n\nYet beneath the surface, there is another world, a world of intrigue and hidden dangers, of political machinations and spiritual significance.",
            "https://archive.org/download/Dune/Dune%20-%20Frank%20Herbert.pdf");

        createBook("Foundation", "Isaac Asimov",
            "A classic about the fall and rise of galactic civilizations.", 255,
            "978-0553293368", 1951, "Science Fiction",
            "https://covers.openlibrary.org/b/id/7725688-M.jpg",
            "Foundation by Isaac Asimov\n\nPART I: THE PSYCHOHISTORIANS\n\nHardin's Collection\n\nThe four of us gathered in the small office were the only ones in the Foundation to know the truth about the Four Kingdoms and the impending fall of the Galactic Empire. We alone understood the terrible urgency that faced the human race.\n\nHardin walked to the window and gazed out at the sprawling complex of the Foundation below us. In the distance, the great spires of Terminus City rose against the dusky sky. It was a young city, and in ten years it had transformed a barren wasteland into the most advanced scientific center in the Galaxy. Yet this accomplishment paled in the face of what was coming.\n\n\"Gentlemen,\" Hardin said, turning back to face us, \"the man we're talking about, Hari Seldon, made predictions about the future of the human race. These predictions were made based on mathematical formulas of psychohistory—equations that could predict the actions of masses of humanity with the same accuracy that physical laws predict the motion of gases.\"\n\nHe paused to let this sink in.\n\n\"Seldon predicted that the Galactic Empire would fall in five hundred years, and that there was only one way to preserve human knowledge and culture through the dark ages that would follow.\"\n\nI felt a chill run down my spine. The fall of the Empire. The end of civilization as we knew it.",
            "https://archive.org/download/FoundationByIsaacAsimov/Foundation%20By%20Isaac%20Asimov.pdf");

        createBook("Neuromancer", "William Gibson",
            "A cyberpunk novel about cyberspace and virtual reality.", 271,
            "978-0441569595", 1984, "Science Fiction",
            "https://covers.openlibrary.org/b/id/7725722-M.jpg",
            "Neuromancer by William Gibson\n\nPART 1: CHIBA CITY\n\nThe sky above the port was the color of television, tuned to a dead channel.\n\nCase was in the coffin when he died. It was a coffin-sized hole in the fabric of cyberspace, the kind of place where console cowboys went to make their final runs before they burned out completely. He had been burned by the Yakuza for theft, his nervous system carved up by mycotoxins, his ability to enter cyberspace destroyed.\n\nNow, in a coffin hotel in Chiba City, he lay in the dark, listening to the hum of machines and the distant sound of the city outside. The coffin was small, barely larger than a casket, with walls of gray plastic that seemed to close in on him in the darkness. He had paid for three weeks, and he had no intention of leaving.\n\nMollly found him there on the fifth day, jacked in but present enough to meet her eyes. She was a girl, or young woman, with invasive surgical modifications that marked her as military-grade combat cyborg. Her fingers were razors, her eyes were mirror-implants, and her reflexes were augmented far beyond human norms.\n\n\"Dixie sent me,\" she said, and Case knew that he was about to be drawn into something far larger and far more dangerous than he could have imagined.",
            "https://archive.org/download/Neuromancer/Neuromancer%20-%20William%20Gibson.pdf");

        createBook("The Martian", "Andy Weir",
            "A gripping survival story of an astronaut stranded on Mars.", 369,
            "978-0553418026", 2011, "Science Fiction",
            "https://covers.openlibrary.org/b/id/8307852-M.jpg",
            "The Martian by Andy Weir\n\nLOG ENTRY, SOL 1\n\nI'm pretty much f***ed.\n\nThat's my considered opinion. F***ed.\n\nThanks a lot, dust storm. Not only did you kill Akira, you led the rest of the crew to think I'm dead, and you trashed the MAV. You really did a number on me.\n\nWell, let me see what I've got here. In the Hab, I have:\n\nStay tuned as I figure out how to apply 70s Brady Bunch TV to modern science. Nobody's been stranded on Mars in the whole of human history. Nobody. So I'm the first person to be in a pretty dire situation that nobody knows about.\n\nThe lessons I learned in survival training might be useful. Keep calm. Think. Don't do anything without considering the full consequences. Ration supplies. Work the problem.\n\nSo here I am, stranded on Mars. The crew thinks I'm dead. NASA thinks I'm dead. I'm pretty much on my own here. My only hope is to figure out how to survive until rescue is even possible, if rescue is even possible at all.\n\nLet me start with what I know. I have the Hab, which provides atmosphere, warmth, light, and water. I have the rover, which is broken but might be fixable. I have food for four people for four years, which means I have food for one person for sixteen years. If I can make it to the supply probe...",
            "https://archive.org/download/TheMartian/The%20Martian%20-%20Andy%20Weir.pdf");

        // Fantasy Books
        createBook("The Hobbit", "J.R.R. Tolkien",
            "A fantasy adventure about a hobbit's unexpected journey.", 310,
            "978-0547928216", 1937, "Fantasy",
            "https://covers.openlibrary.org/b/id/7725639-M.jpg",
            "The Hobbit by J.R.R. Tolkien\n\nChapter 1: An Unexpected Party\n\nIn a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, filled with the ends of worms and oozy smells, nor yet a dry, bare, sandy hole with nothing in it to sit down on or to eat: it was a hobbit-hole, and that means comfort.\n\nIt had a perfectly round door painted green with a bright yellow brass knob in the exact middle. The door opened on a tube-shaped hall like a tunnel: a very comfortable tunnel without smoke, with panelled walls and floors of polished stone with rugs laid on them. This tunnel wound like a passage, and as you went along it you found a succession of round doors on either side—first one on the left, then one on the right, then another on the left, and so on.\n\nThe hobbit's name was Baggins. Bilbo Baggins. He was a hobbit of good family too, in that he was a bachelor and had no intention of changing that state. He lived in comfort and considerable style in his hobbit-hole, which was called Bag End, in the Shire, which was a pleasant and sunny land.\n\nNow, Bilbo had achieved a certain fame in his locality, but he was thought rather queer by the more respectable hobbits. What adventures could there possibly be in the Shire, after all? But Bilbo was not quite like other hobbits, though he was loath to admit it.",
            "http://localhost:8080/api/files/The-Hobbit-JRR-Tolkien.txt");

        createBook("Harry Potter and the Sorcerer's Stone", "J.K. Rowling",
            "The beginning of a magical journey at Hogwarts.", 309,
            "978-0439136598", 1997, "Fantasy",
            "https://covers.openlibrary.org/b/id/8264346-M.jpg",
            "Harry Potter and the Sorcerer's Stone by J.K. Rowling\n\nCHAPTER ONE: THE BOY WHO LIVED\n\nMr. and Mrs. Dursley, of number four, Privet Drive, were proud to say that they were perfectly normal, thank you very much. They were the last people you'd expect to be involved in anything strange or mysterious, because they just didn't hold with such nonsense.\n\nMr. Dursley was the director of a firm called Grunnings, which made drills. He was a big, beefy man with hardly any neck, although he did have a very large mustache. Mrs. Dursley was thin and blonde and had nearly twice the usual amount of neck, which came in very useful as she spent so much of her time craning over garden fences, spying on the neighbors.\n\nThe Dursleys had a small son called Dudley and in their opinion there was no finer boy anywhere. The Dursleys were the sort of people that the worst thing they believed could happen to anyone was if someone found out about the Potters. Mrs. Potter had been Mrs. Dursley's sister, but they hadn't spoken in years; in fact, Mrs. Dursley pretended she didn't have a sister, because her sister and her good-for-nothing husband were as unmagical as they came.\n\nHaving a magical child had been a shock. Having the child left on their doorstep was worse. But having to raise the boy was the nightmare that had plagued the Dursleys for ten years.",
            "https://archive.org/download/HarryPotterAndThePhilosophersStone/Harry%20Potter%20and%20the%20Philosopher%27s%20Stone.pdf");

        createBook("The Chronicles of Narnia", "C.S. Lewis",
            "A series of fantasy adventures in the magical land of Narnia.", 768,
            "978-0066715196", 1950, "Fantasy",
            "https://covers.openlibrary.org/b/id/7725701-M.jpg",
            "The Chronicles of Narnia by C.S. Lewis\n\nTHE LION, THE WITCH AND THE WARDROBE\n\nBook One: Chapter 1: Lucy Looks into a Wardrobe\n\nOnce there were four children whose names were Peter, Susan, Edmund and Lucy. This story is about something that happened to them when they were sent away from London during the war because of the air-raids. They were sent to the house of an old Professor who lived in the heart of the country, ten miles from the nearest railway station and two miles from the nearest post office. He had no wife and lived in a very large house with a housekeeper called Mrs. Macready and three servants.\n\nTheir names were Peter, Susan, Edmund and Lucy. Peter was the oldest. Susan was a year younger. Edmund was gratified to be the youngest boy, but Lucy was the youngest of all.\n\nOn the first morning, when Lucy woke up in her new room, she looked about her with a feeling of delight. Everything seemed new and interesting. Her window gave her a view of the mountains. The air smelled of pines and fresh streams.\n\nAfter breakfast, the four children were shown around the house by Mrs. Macready, the housekeeper. It was a very large house, with passages and doors. There were more than a hundred rooms, she said, though Mrs. Macready did not know how many, and only a few of them were ever used.",
            "https://archive.org/download/TheChroniclesOfNarnia/The%20Lion%2C%20the%20Witch%20and%20the%20Wardrobe.pdf");

        createBook("A Game of Thrones", "George R.R. Martin",
            "An epic fantasy with political intrigue and compelling characters.", 694,
            "978-0553103540", 1996, "Fantasy",
            "https://covers.openlibrary.org/b/id/8236265-M.jpg",
            "A Game of Thrones by George R.R. Martin\n\nPROLOGUE\n\nThe world of ice and fire stretches across continents. In the frozen lands of the North, the Wall stands as the last line of defense against the dark forces beyond. In the great castles of the South, noble families vie for control of the Iron Throne. And across the Narrow Sea, in the lands of Essos, dragons are being born from stone in ways that should be impossible.\n\nBran Stark, a young boy of fourteen winters, climbs the walls of Winterfell. His father is Eddard Stark, the Warden of the North, and Bran is his second son. Above him, the gray stone of the castle rises like mountains. Below him, the yard where men-at-arms practice their sword skills.\n\nBran does not feel the cold as others do. The Stark blood runs thick in him, and the North is in his blood. He climbs with a grace born of practice, ascending higher and higher until the world below becomes small and distant.\n\nThen he sees them. Knights on the road approaching the castle. Their banners bear the golden lion of House Lannister. Even from this height, Bran can sense that something is changing, that the peaceful days of his youth are coming to an end.",
            "https://archive.org/download/AGameOfThrones/A%20Game%20of%20Thrones.pdf");

        // Non-Fiction & Biography Books
        createBook("Sapiens", "Yuval Noah Harari",
            "A compelling history of humankind from the Stone Age to present.", 443,
            "978-0062316095", 2014, "Non-Fiction",
            "https://covers.openlibrary.org/b/id/10108892-M.jpg",
            "Sapiens by Yuval Noah Harari\n\nIntroduction: The Strangest Animal\n\n100,000 years ago, the world was home to at least six different species of humans. Yet today, there is only one: us. Homo sapiens has ruled the world for the last 70,000 years, but why? How did one species of ape from Africa come to dominate the entire planet?\n\nThe answer lies in our unique ability to imagine things that don't exist. A chimpanzee cannot believe in God. A dog cannot sign a contract. But humans can. We can imagine fictional realities, and more importantly, we can believe in them collectively.\n\nWhen the Cognitive Revolution occurred, roughly 70,000 years ago, something changed in the human brain. Suddenly, Homo sapiens developed the ability to think about abstract concepts. We began to tell stories. We began to imagine things that never existed.\n\nThis ability—to create and believe in shared fictions—is what gave humans the power to cooperate in large numbers. No other animal can do this. A lion cannot convince a thousand other lions to follow a shared idea. But humans can. And that is what has made us the rulers of the world.\n\nFrom the Agricultural Revolution to the Scientific Revolution, from the Industrial Age to the Information Age, humans have transformed the world through our collective beliefs and our shared stories.",
            "https://archive.org/download/Sapiens/Sapiens%20-%20Yuval%20Noah%20Harari.pdf");

        createBook("Thinking, Fast and Slow", "Daniel Kahneman",
            "An exploration of human psychology and decision-making.", 499,
            "978-0374533555", 2011, "Non-Fiction",
            "https://covers.openlibrary.org/b/id/8255370-M.jpg",
            "Thinking, Fast and Slow by Daniel Kahneman\n\nPart I: Two Systems\n\nChapter 1: The Two Systems\n\nOur minds have two different systems for thinking. System 1 operates automatically and quickly, with little effort. System 2 allocates attention to effortful mental activities that require concentration.\n\nWhen you read the sentence \"A tall man with a loud voice\", you immediately form an image. You don't have to think about it. It happens automatically. This is System 1 at work.\n\nBut when you try to solve a complex math problem, you have to engage System 2. You have to concentrate. You have to work through the problem step by step.\n\nMost of our thinking is System 1 thinking. It's fast, automatic, and often accurate. But it's also prone to errors. System 1 is lazy. It makes quick judgments based on limited information. It relies on heuristics—mental shortcuts that usually work but sometimes lead us astray.\n\nSystem 2 is slower, but more accurate. It handles complex problems that require careful thought. But System 2 is lazy too. It requires energy, and our brains are designed to conserve energy. So we default to System 1 as much as possible.\n\nThis is the fundamental insight of behavioral economics: humans are not rational agents. We are creatures of habit and emotion, and our thinking is shaped by mental biases that we are largely unaware of.",
            "https://archive.org/download/ThinkingFastAndSlow/Thinking%2C%20Fast%20and%20Slow.pdf");

        createBook("Educated", "Tara Westover",
            "A memoir about a girl raised by survivalists who escapes to pursue education.", 352,
            "978-0399590652", 2018, "Biography",
            "https://covers.openlibrary.org/b/id/9506648-M.jpg",
            "Educated by Tara Westover\n\nPart One: Baptism\n\nEverything I know about my family, I had to learn from reading it on the internet. I did not grow up in a house. I grew up on a mountain in Idaho, in the middle of nowhere, in a house that my father had built with his own hands. My father, Gene Westover, was a survivalist and a religious fundamentalist who believed that the end times were near, and that the government was the enemy.\n\nWe were not allowed to go to school. My father believed that the public school system was indoctrinating us in the ways of Satan. Instead, my mother taught us at home, using only information that had been approved by my father. We had no contact with the outside world. No television, no radio, no newspapers. We didn't even know that other people existed outside our mountain.\n\nMy father spent his days building a fortress to protect us from the government. My brothers and I spent our days helping him, gathering supplies, preparing for the apocalypse. We were poor, we were isolated, and we were terrified.\n\nBut somewhere inside me, there was a spark. A desire to know more, to see more, to become more than my father wanted me to be. That spark would eventually set me free.",
            "https://archive.org/download/Educated/Educated%20-%20Tara%20Westover.pdf");

        createBook("Atomic Habits", "James Clear",
            "A guide to building good habits and breaking bad ones.", 320,
            "978-0735211299", 2018, "Self-Help",
            "https://covers.openlibrary.org/b/id/9498251-M.jpg",
            "Atomic Habits by James Clear\n\nIntroduction: The Surprising Power of Tiny Changes\n\nThe story of British Cycling begins with a man named Dave Brailsford. In 2003, Brailsford was hired as the director of the British National Cycling Team. At that time, the team had not won a gold medal at the Tour de France in more than one hundred years.\n\nBreailsford had a radical idea. Instead of trying to make dramatic changes all at once, he decided to improve every element of the team's performance by just one percent. He called this philosophy \"the aggregate effect of marginal gains.\"\n\nHe started with the obvious: improving the bikes, improving nutrition, improving the way the athletes slept. But then he went further. He changed the type of pillow the riders used. He found the most comfortable saddle. He experimented with different fabrics for shorts to reduce friction.\n\nMost of these improvements seemed trivial. Nobody expected them to make a real difference. But Brailsford believed that small changes could add up to large results.\n\nSeven years later, in 2010, British cyclists had won the Tour de France. They continued to dominate the race for several years after that. The team had gone from being the worst performing nation in cycling to being one of the best in the world.\n\nThis is the power of atomic habits. Small changes, made consistently over time, can lead to remarkable results.",
            "https://archive.org/download/AtomicHabits/Atomic%20Habits%20-%20James%20Clear.pdf");

        createBook("The 7 Habits of Highly Effective People", "Stephen Covey",
            "A classic guide to personal and professional effectiveness.", 372,
            "978-0743269519", 1989, "Self-Help",
            "https://covers.openlibrary.org/b/id/7725694-M.jpg",
            "The 7 Habits of Highly Effective People by Stephen Covey\n\nPREFACE: An Introduction to Principle-Based Living\n\nThis is a book about personal fulfillment and business success. It presents a proven system for improving your life in every area: career, relationships, family, finances, personal development, and spiritual well-being.\n\nThe 7 Habits are not quick fixes. They are not magic pills that will solve all your problems overnight. Rather, they are fundamental principles of human effectiveness, based on the natural laws of human nature.\n\nThroughout history, the most successful and fulfilled people have operated from a set of core principles. These principles are universal. They transcend culture, geography, gender, and socioeconomic background.\n\nThe 7 Habits are:\n\n1. Be Proactive\n2. Begin with the End in Mind\n3. Put First Things First\n4. Think Win/Win\n5. Seek First to Understand, Then to Be Understood\n6. Synergize\n7. Sharpen the Saw\n\nThese habits are not tricks or techniques. They are powerful principles that, when practiced consistently, will transform your life. They are based on the timeless wisdom found in all great traditions and cultures.\n\nAs you read this book, you will learn how to apply these habits to your daily life. You will discover how to become more effective at work, more fulfilled at home, and more at peace with yourself.",
            "https://archive.org/download/The7HabitsOfHighlyEffectivePeople/The%207%20Habits%20of%20Highly%20Effective%20People.pdf");

        System.out.println("✅ Successfully loaded 25 sample books with real content into the database!");
    }

    private String extractPdfContent() {
        try {
            // Try multiple possible PDF paths
            String[] possiblePaths = {
                "E-Library/pdf/",
                "../pdf/",
                "../../pdf/",
                "c:\\Users\\user\\OneDrive - Sri Lanka Institute of Information Technology\\Documents\\AI\\E-Library\\pdf\\"
            };
            
            File pdfFolder = null;
            for (String path : possiblePaths) {
                File folder = new File(path);
                if (folder.exists()) {
                    pdfFolder = folder;
                    System.out.println("✅ Found PDF folder at: " + folder.getAbsolutePath());
                    break;
                }
            }
            
            if (pdfFolder == null) {
                System.out.println("⚠️ PDF folder not found in any of the expected locations");
                return "PDF file not found. Using placeholder content.";
            }
            
            // Find Gone Girl PDF file
            File[] pdfFiles = pdfFolder.listFiles((dir, name) -> 
                name.toLowerCase().contains("gone") && name.toLowerCase().contains("girl") && name.endsWith(".pdf"));
            
            if (pdfFiles == null || pdfFiles.length == 0) {
                System.out.println("⚠️ Gone Girl PDF not found in: " + pdfFolder.getAbsolutePath());
                return "Gone Girl PDF file not found. Using placeholder content.";
            }
            
            File pdfFile = pdfFiles[0];
            System.out.println("📖 Loading PDF: " + pdfFile.getAbsolutePath());
            
            try (PDDocument document = PDDocument.load(pdfFile)) {
                PDFTextStripper stripper = new PDFTextStripper();
                String text = stripper.getText(document);
                System.out.println("✅ Successfully loaded Gone Girl PDF - " + text.length() + " characters extracted");
                return text;
            }
            
        } catch (Exception e) {
            System.out.println("❌ Error loading PDF: " + e.getMessage());
            e.printStackTrace();
            return "Error loading PDF file. Using placeholder content.";
        }
    }

    /**
     * Resolve a candidate pdf reference (filename or URL) into a public API URL
     * only if the underlying file exists in one of the expected PDF folders.
     * Returns null if the file could not be found.
     */
    private String resolvePdfUrl(String candidate) {
        if (candidate == null) return null;

        // If it's already an absolute HTTP URL, return as-is
        if (candidate.startsWith("http://") || candidate.startsWith("https://")) {
            return candidate;
        }

        // Extract filename from candidate
        String filename = new File(candidate).getName();
        if (filename == null || filename.isBlank()) return null;

        String[] possiblePaths = {
            "E-Library" + File.separator + "pdf" + File.separator,
            System.getProperty("user.dir") + File.separator + "pdf" + File.separator,
            System.getProperty("user.dir") + File.separator + ".." + File.separator + "pdf" + File.separator,
            "c:\\Users\\user\\OneDrive - Sri Lanka Institute of Information Technology\\Documents\\AI\\E-Library\\pdf\\"
        };

        File found = null;
        for (String p : possiblePaths) {
            File f = new File(p + filename);
            if (f.exists() && f.isFile()) {
                found = f;
                System.out.println("✅ Found file for pdfUrl candidate at: " + f.getAbsolutePath());
                break;
            }
        }

        if (found == null) {
            System.out.println("⚠️ PDF file not found for candidate: " + candidate + " (checked " + possiblePaths.length + " locations)");
            return null;
        }

        try {
            String encoded = URLEncoder.encode(found.getName(), StandardCharsets.UTF_8.toString());
            return "http://localhost:8080/api/files/" + encoded;
        } catch (Exception e) {
            System.out.println("⚠️ Failed to encode filename: " + e.getMessage());
            return "http://localhost:8080/api/files/" + found.getName();
        }
    }

    private void createBook(String title, String author, String description, Integer pages,
                           String isbn, Integer year, String category, String coverUrl, String content) {
        createBook(title, author, description, pages, isbn, year, category, coverUrl, content, null);
    }

    private void createBook(String title, String author, String description, Integer pages,
                           String isbn, Integer year, String category, String coverUrl, String content, String pdfUrl) {
        Book book = new Book();
        book.setTitle(title);
        book.setAuthor(author);
        book.setDescription(description);
        book.setTotalPages(pages);
        book.setIsbn(isbn);
        book.setPublicationYear(year);
        book.setCategory(category);
        book.setCoverUrl(coverUrl);
        book.setContent(content);
        // Only set a pdfUrl if we can resolve it to an API-served file
        String resolved = resolvePdfUrl(pdfUrl);
        if (resolved != null) {
            book.setPdfUrl(resolved);
        } else {
            book.setPdfUrl(null);
            if (pdfUrl != null) {
                System.out.println("⚠️ Not setting pdfUrl for '" + title + "' because file was not found: " + pdfUrl);
            }
        }
        book.setCreatedAt(LocalDateTime.now());
        book.setIsDeleted(false);
        book.setIsAvailable(true);
        bookRepository.save(book);
    }
}
