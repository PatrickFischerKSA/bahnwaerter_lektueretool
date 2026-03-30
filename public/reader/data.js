const novellenVideo =
  "https://www.dropbox.com/scl/fi/p6x7yinweipp2smhssj9d/Was-ist-eine-Novelle-I-Merkmale-I-musstewissen-Deutsch.mp4?rlkey=s19dres7makh2qsd0jozem6eg&st=65q6vfth&dl=0";
const naturalismusVideo =
  "https://www.dropbox.com/scl/fi/59luvdyevihbrquiqp9n5/Naturalismus-einfach-erkl-rt-Literaturepoche-1880-1890-Themen-Sprache-Vertreter-erkl-rt.mp4?rlkey=819ml1gkx5g6pj7ix49h5xmyq&st=tii9zfg7&dl=0";
const perspektivenVideo =
  "https://www.dropbox.com/scl/fi/826udxui7t3vbb3jkm9gr/Erz-hlperspektiven-I-musstewissen-I-Deutsch.mp4?rlkey=oxkdtjnawgraap9xwskmzt0uj&st=6hhbhke9&dl=0";

function asRaw(url) {
  return url.replace("dl=0", "raw=1");
}

export const theoryResources = [
  {
    id: "novelle",
    title: "Novellentheorie",
    shortTitle: "Novelle",
    sourceTitle: "Was ist eine Novelle? | musstewissen Deutsch",
    openUrl: novellenVideo,
    embedUrl: asRaw(novellenVideo),
    summary:
      "Nutze diese Linse, um Bahnwärter Thiel als verdichtete Prosaerzählung mit zentralem Konflikt, Wendepunkt und folgenreichem Ausnahmeereignis zu lesen.",
    keyIdeas: ["unerhörte Begebenheit", "Wendepunkt", "Verdichtung", "Leitmotiv", "strenge Konzentration"],
    questions: [
      "Welches Ereignis sprengt die Alltagsordnung und macht den Text zur Novelle statt zur bloßen Milieuschilderung?",
      "Wo verengt der Text das Geschehen auf einen Konfliktkern, der fast zwangsläufig auf die Katastrophe zuläuft?",
      "Welche Dinge oder Motive kehren wieder und bündeln den Sinn des Textes?"
    ],
    transferPrompts: [
      "Zeige, wie die gewählte Passage auf einen Wendepunkt oder dessen Vorbereitung zuläuft.",
      "Prüfe, ob ein Motiv oder Gegenstand die Passage mit dem Gesamttext verbindet.",
      "Erkläre, wie stark die Szene auf den Kernkonflikt konzentriert bleibt."
    ],
    writingFrame:
      "Als Novelle wirkt die Passage, weil sie ein folgenschweres Ereignis vorbereitet oder zuspitzt. Sichtbar wird das an ..."
  },
  {
    id: "naturalismus",
    title: "Naturalismus",
    shortTitle: "Naturalismus",
    sourceTitle: "Naturalismus einfach erklärt | Literaturepoche 1880-1890",
    openUrl: naturalismusVideo,
    embedUrl: asRaw(naturalismusVideo),
    summary:
      "Mit dieser Linse untersuchst du, wie Hauptmann Arbeit, Körper, Milieu, soziale Härte und psychischen Druck ungeschönt und detailnah darstellt.",
    keyIdeas: ["Milieu", "Determinierung", "Arbeit und Körper", "ungeschönte Wirklichkeit", "soziale Härte"],
    questions: [
      "Wie zeigt der Text Menschen als geprägt durch Umgebung, Arbeit, soziale Lage oder körperliche Belastung?",
      "Wo wird Wirklichkeit nicht beschönigt, sondern in ihrer Härte oder Grobheit gezeigt?",
      "Welche sprachlichen Details lassen die Szene beobachtet statt romantisiert wirken?"
    ],
    transferPrompts: [
      "Suche nach Beobachtungen, die Arbeit, Körper oder soziale Lage sichtbar machen.",
      "Prüfe, ob die Passage Figuren eher erklärt als moralisch idealisiert.",
      "Erkläre, wie äußere Bedingungen inneres Verhalten mitprägen."
    ],
    writingFrame:
      "Naturalistisch wirkt die Passage, weil sie die Figur als Produkt von Milieu, Arbeit und Belastung zeigt. Das erkennt man an ..."
  },
  {
    id: "perspektive",
    title: "Erzählperspektiven",
    shortTitle: "Perspektive",
    sourceTitle: "Erzählperspektiven | musstewissen Deutsch",
    openUrl: perspektivenVideo,
    embedUrl: asRaw(perspektivenVideo),
    summary:
      "Diese Linse hilft dir zu prüfen, wie nah der Erzähler an Thiels Wahrnehmung bleibt und wie sich Distanz, Einblick und Deutung im Verlauf verschieben.",
    keyIdeas: ["personale Nähe", "Erzählerdistanz", "Innenwahrnehmung", "Fokussierung", "Lenkung der Deutung"],
    questions: [
      "Wie viel weiß der Erzähler mehr als Thiel, und wo bleibt er eng an seiner Wahrnehmung?",
      "Wann wirkt die Darstellung eher beobachtend, wann eher miterlebend?",
      "Wie beeinflusst die Perspektive, ob wir Mitleid, Distanz oder Unsicherheit empfinden?"
    ],
    transferPrompts: [
      "Achte darauf, ob die Passage äußerlich beschreibt oder Thiels Innenwelt spürbar macht.",
      "Erkläre, wie Perspektive und Wahrnehmungsnähe die Wirkung der Szene steuern.",
      "Prüfe, ob die Erzählinstanz Sicherheit schafft oder Verunsicherung erzeugt."
    ],
    writingFrame:
      "Die Passage wirkt so stark, weil die Erzählperspektive den Blick auf Thiel lenkt: Der Erzähler ..."
  }
];

export const readerModules = [
  {
    id: "auftakt",
    title: "Auftakt und soziale Ordnung",
    lens: "Beruf, Milieu, Figurenanlage",
    briefing:
      "Lies die ersten Seiten als präzise Einführung in Figur, Beruf und soziale Lage. Achte darauf, wie knapp und konzentriert der Text seine Konfliktbahn eröffnet.",
    task:
      "Zeige, wie der Text Thiel von Beginn an zugleich als Funktionsträger, Körper und gefährdete Figur anlegt.",
    relatedTheoryIds: ["naturalismus", "perspektive", "novelle"],
    entries: [
      {
        id: "auftakt-1",
        title: "Sachlicher Einstieg in die Figur",
        pageHint: "S. 7",
        pageNumber: 7,
        passageLabel: "Berufsrolle und erste Distanz",
        context:
          "Der Text setzt ohne Pathos ein und verankert Thiel zunächst in einer sozialen und beruflichen Funktion. Gerade diese Sachlichkeit macht die spätere Eskalation umso auffälliger.",
        signalWords: ["Bahnwärter", "Dienst", "Pflicht", "Mann"],
        prompts: [
          "Welche Informationen über Beruf und Lebenslage werden besonders früh gesetzt?",
          "Wie wirkt der nüchterne Einstieg auf dein Bild von Thiel?",
          "Warum passt diese knappe Einführung zur Form einer Novelle?"
        ],
        writingFrame:
          "Der Einstieg wirkt sachlich, weil der Erzähler zuerst ... hervorhebt. Dadurch erscheint Thiel zunächst als ...",
        relatedTheoryIds: ["perspektive", "naturalismus", "novelle"]
      },
      {
        id: "auftakt-2",
        title: "Körper und Arbeit",
        pageHint: "S. 7",
        pageNumber: 7,
        passageLabel: "Arbeit formt die Figur",
        context:
          "Thiel erscheint nicht nur psychologisch, sondern körperlich und arbeitsweltlich bestimmt. Der Text verknüpft Person und Dienst fast unauflösbar miteinander.",
        signalWords: ["Arbeit", "Körper", "Pfosten", "Gleise"],
        prompts: [
          "Wie wird Thiels Beruf nicht nur genannt, sondern körperlich spürbar gemacht?",
          "Welche Details machen ihn zu einer Figur des Naturalismus?",
          "Welche Spannung entsteht zwischen äußerer Ordnung und innerer Verletzlichkeit?"
        ],
        writingFrame:
          "Die Passage zeigt Thiel als vom Beruf geprägten Menschen. Sichtbar wird das besonders an ...",
        relatedTheoryIds: ["naturalismus"]
      },
      {
        id: "auftakt-3",
        title: "Zweite Ehe als knappe Vorgeschichte",
        pageHint: "S. 8",
        pageNumber: 8,
        passageLabel: "Biografie in Verdichtung",
        context:
          "Der Erzähler liefert Vorgeschichte knapp, aber funktional: Tod, zweite Ehe und neue Familienkonstellation erscheinen nicht ausführlich ausgeschmückt, sondern konfliktgerichtet.",
        signalWords: ["zweite Ehe", "Minna", "Lene", "Witwer"],
        prompts: [
          "Wie komprimiert der Text Vorgeschichte zu konfliktentscheidenden Informationen?",
          "Welche Gegensätze zwischen Minna und Lene werden schon vorbereitet?",
          "Wie deutet diese Verdichtung auf eine novellentypische Konzentration hin?"
        ],
        writingFrame:
          "Die Vorgeschichte ist stark verdichtet. Statt auszuerzählen, setzt der Text vor allem ..., weil ...",
        relatedTheoryIds: ["novelle", "perspektive"]
      },
      {
        id: "auftakt-4",
        title: "Familienkonstellation als Konfliktkeim",
        pageHint: "S. 8",
        pageNumber: 8,
        passageLabel: "Tobias zwischen zwei Ordnungen",
        context:
          "Tobias steht früh zwischen vergangener Bindung an Minna und aktueller Macht Lenes. Damit wird das spätere Zentrum der Katastrophe schon unscheinbar vorbereitet.",
        signalWords: ["Tobias", "Kind", "Familie", "Ordnung"],
        prompts: [
          "Welche Rolle spielt Tobias schon im Anfang als stiller Konfliktträger?",
          "Wie lenkt der Erzähler den Blick auf Beziehungen statt auf Handlung?",
          "Warum ist diese Konstellation für den späteren Wendepunkt wichtig?"
        ],
        writingFrame:
          "Schon früh wirkt Tobias wie ein stilles Zentrum des Konflikts, weil ...",
        relatedTheoryIds: ["novelle", "perspektive"]
      }
    ]
  },
  {
    id: "kapelle",
    title: "Minnas Nachleben im Wärterhaus",
    lens: "Raum, Ritual, Erinnerung",
    briefing:
      "Arbeite an den Seiten, auf denen das Wärterhäuschen zu einem inneren Erinnerungsraum wird. Untersuche, wie Gegenstände, Frömmigkeit und Vision ineinandergreifen.",
    task:
      "Zeige, wie der Text aus einem funktionalen Arbeitsort einen seelischen Schwellenraum macht.",
    relatedTheoryIds: ["perspektive", "novelle"],
    entries: [
      {
        id: "kapelle-1",
        title: "Das Wärterhäuschen als Erinnerungsraum",
        pageHint: "S. 9",
        pageNumber: 9,
        passageLabel: "Raum und Minnas Andenken",
        context:
          "Thiel trennt seinen Alltag von einem inneren Raum ab, der ganz Minna gehört. Der Ort ist nicht mehr nur funktional, sondern emotional aufgeladen und fast sakral umgedeutet.",
        signalWords: ["Photographie", "Gesangbuch", "Bibel", "Kapelle"],
        prompts: [
          "Wie machen konkrete Dinge Minnas Abwesenheit paradoxerweise anwesend?",
          "Warum ist das Wärterhäuschen mehr als ein Arbeitsplatz?",
          "Wie bereitet dieser Raum spätere Visionen vor?"
        ],
        writingFrame:
          "Die Gegenstände sind keine bloßen Requisiten, sondern verdichten Erinnerung, weil ...",
        relatedTheoryIds: ["novelle", "perspektive"]
      },
      {
        id: "kapelle-2",
        title: "Abgrenzung gegen Lene",
        pageHint: "S. 9",
        pageNumber: 9,
        passageLabel: "Geheiligtes Land",
        context:
          "Lene bleibt aus diesem inneren Raum ausgeschlossen. So werden Erinnerung und Gegenwart, Minna und Lene, Schutz und Bedrohung bereits räumlich voneinander getrennt.",
        signalWords: ["geheiligtes Land", "ausschließlich", "gewidmet", "Tote"],
        prompts: [
          "Wie erzeugt der Raum eine scharfe symbolische Grenze?",
          "Welche Wirkung hat es, dass Lene innerlich ausgeschlossen bleibt?",
          "Wie wird hier die spätere Spaltung der Figur vorbereitet?"
        ],
        writingFrame:
          "Die räumliche Grenze ist wichtig, weil sie nicht nur Personen trennt, sondern auch ...",
        relatedTheoryIds: ["novelle", "perspektive"]
      },
      {
        id: "kapelle-3",
        title: "Nacht, Lesen, Vision",
        pageHint: "S. 10",
        pageNumber: 10,
        passageLabel: "Ekstase im Ritual",
        context:
          "In seinen nächtlichen Ritualen kippt Thiel aus der Routine in eine Grenzerfahrung. Lesen, Singen und Beten schlagen in Vision und Übersteigerung um.",
        signalWords: ["Ekstase", "Gesichte", "Mitternacht", "Tote"],
        prompts: [
          "Wie entwickelt sich das religiöse Ritual in Richtung Vision?",
          "Welche Wörter markieren den Übergang von Ordnung zu Entgrenzung?",
          "Wie beeinflusst die Erzählperspektive, ob wir diese Wahrnehmung ernst nehmen oder problematisieren?"
        ],
        writingFrame:
          "Die Szene kippt von religiöser Ordnung in psychische Entgrenzung. Das erkennt man daran, dass ...",
        relatedTheoryIds: ["perspektive"]
      },
      {
        id: "kapelle-4",
        title: "Minnas Gegenwart als innere Macht",
        pageHint: "S. 10",
        pageNumber: 10,
        passageLabel: "Erinnerung wird Handlungskraft",
        context:
          "Minnas Bild bleibt nicht bloß Erinnerung, sondern steuert Thiels Empfinden und Urteile. Der Text macht Vergangenes zu einer aktiven Kraft in der Gegenwart.",
        signalWords: ["Andacht", "Minnas Bild", "Sehnsucht", "Treue"],
        prompts: [
          "Wie wird aus Trauer eine handlungsleitende innere Autorität?",
          "Wodurch gewinnt Minna fast eine zweite Präsenz im Text?",
          "Warum ist diese Verdichtung für die Gesamtdeutung wichtig?"
        ],
        writingFrame:
          "Minnas Erinnerung wirkt handlungswirksam, weil sie Thiels Blick auf ... bestimmt.",
        relatedTheoryIds: ["novelle", "perspektive"]
      }
    ]
  },
  {
    id: "lene",
    title: "Lene und die zweite Familienordnung",
    lens: "Macht, Alltag, Abhängigkeit",
    briefing:
      "Untersuche, wie Lene nicht nur charakterisiert, sondern über Körperlichkeit, Sprache und alltägliche Macht gezeichnet wird.",
    task:
      "Arbeite heraus, wie die zweite Ehe als neue, härtere Ordnung sichtbar wird und Thiels Passivität mit vorbereitet.",
    relatedTheoryIds: ["naturalismus", "perspektive"],
    entries: [
      {
        id: "lene-1",
        title: "Lene als Kontrastfigur",
        pageHint: "S. 11",
        pageNumber: 11,
        passageLabel: "Härte statt Innerlichkeit",
        context:
          "Lene tritt als Gegenfigur zu Minna auf: nicht vergeistigt, sondern praktisch, robust und handgreiflich. Der Erzähler markiert diesen Kontrast früh und deutlich.",
        signalWords: ["kräftig", "hart", "praktisch", "Gegenfigur"],
        prompts: [
          "Welche Merkmale machen Lene zur Gegenfigur zu Minna?",
          "Wie verhindert der Text eine romantische Idealisierung?",
          "Was sagt ihre Darstellung über Geschlechter- und Machtordnung aus?"
        ],
        writingFrame:
          "Lene wird als Kontrastfigur aufgebaut, indem der Text vor allem ... betont.",
        relatedTheoryIds: ["naturalismus"]
      },
      {
        id: "lene-2",
        title: "Tobias in der zweiten Ehe",
        pageHint: "S. 12",
        pageNumber: 12,
        passageLabel: "Kind im Machtgefüge",
        context:
          "Tobias steht in einer Familie, die formal geordnet, emotional aber fragil ist. Seine Position macht die verborgene Härte der neuen Ordnung sichtbar.",
        signalWords: ["Tobias", "Stiefmutter", "Ordnung", "Abstand"],
        prompts: [
          "Wie zeigt die Passage Tobias' Unsicherheit im Familiengefüge?",
          "Welche Rolle spielt Lene im Alltag des Kindes?",
          "Wie wird aus einer Familienbeschreibung bereits ein Konfliktaufbau?"
        ],
        writingFrame:
          "Tobias wirkt verletzlich, weil die Passage ihn zwischen ... und ... stellt.",
        relatedTheoryIds: ["novelle", "perspektive"]
      },
      {
        id: "lene-3",
        title: "Thiels Abhängigkeit",
        pageHint: "S. 13",
        pageNumber: 13,
        passageLabel: "Passivität im Alltag",
        context:
          "Schon bevor offene Gewalt sichtbar wird, zeigt der Text Thiel als abhängig und gehemmt. Seine Schwäche entsteht nicht plötzlich, sondern ist in den Alltagsbeziehungen angelegt.",
        signalWords: ["abhängig", "gehemmt", "nachgeben", "Alltag"],
        prompts: [
          "Welche Details lassen Thiels Passivität konkret werden?",
          "Wie erklärt der Text diese Schwäche sozial und psychologisch?",
          "Warum ist diese Passivität für die Schuldfrage zentral?"
        ],
        writingFrame:
          "Thiels Schwäche wird vorbereitet, weil er im Alltag immer wieder ...",
        relatedTheoryIds: ["naturalismus", "perspektive"]
      },
      {
        id: "lene-4",
        title: "Haushalt als Machtordnung",
        pageHint: "S. 14-15",
        pageNumber: 14,
        passageLabel: "Alltägliche Herrschaft",
        context:
          "Nicht große Szenen, sondern tägliche Abläufe zeigen, wer im Haus bestimmt. Gerade diese Gewöhnlichkeit macht die Härte der Verhältnisse eindringlich.",
        signalWords: ["Haushalt", "bestimmen", "Arbeit", "Gewohnheit"],
        prompts: [
          "Wie wird Macht in alltäglichen Handlungen sichtbar?",
          "Welche naturalistischen Züge hat diese Darstellung von Alltag?",
          "Warum wirkt das Bedrohliche gerade deshalb, weil es gewöhnlich erscheint?"
        ],
        writingFrame:
          "Die Passage zeigt Herrschaft nicht spektakulär, sondern alltäglich. Das wird deutlich durch ...",
        relatedTheoryIds: ["naturalismus"]
      }
    ]
  },
  {
    id: "milieu",
    title: "Arbeit, Landschaft und Milieu",
    lens: "Raum, Körper, Determination",
    briefing:
      "Lies die mittleren Seiten als Milieustudie: Schienen, Wald, Wetter und Dienst ordnen Wahrnehmung und Handlung mit.",
    task:
      "Zeige, wie Umgebung und Arbeit nicht Kulisse bleiben, sondern Verhalten und Stimmung mitbestimmen.",
    relatedTheoryIds: ["naturalismus", "perspektive"],
    entries: [
      {
        id: "milieu-1",
        title: "Der Posten an den Gleisen",
        pageHint: "S. 16",
        pageNumber: 16,
        passageLabel: "Arbeitsraum und Technik",
        context:
          "Die Gleise, der Posten und der geregelte Dienst strukturieren Thiels Leben. Technik steht dabei für Ordnung, aber auch für drohende Unbarmherzigkeit.",
        signalWords: ["Gleise", "Posten", "Dienst", "Technik"],
        prompts: [
          "Wie verbindet der Text Arbeitsort und Lebensform?",
          "Welche Wirkung hat die genaue Darstellung der Bahnwelt?",
          "Warum ist diese technische Ordnung für die spätere Katastrophe wichtig?"
        ],
        writingFrame:
          "Der Arbeitsraum ist bedeutsam, weil er nicht neutral bleibt, sondern ...",
        relatedTheoryIds: ["naturalismus", "novelle"]
      },
      {
        id: "milieu-2",
        title: "Sommerhitze und Überlastung",
        pageHint: "S. 18",
        pageNumber: 18,
        passageLabel: "Körper unter Druck",
        context:
          "Hitze, Müdigkeit und körperliche Belastung verdichten die Lage. Der Text macht psychischen Druck nicht abstrakt, sondern über Körperzustände erfahrbar.",
        signalWords: ["Hitze", "Schweiß", "Müdigkeit", "Druck"],
        prompts: [
          "Welche körperlichen Signale verdichten die Szene?",
          "Wie zeigt sich darin naturalistische Darstellung?",
          "Warum verstärkt die physische Überlastung den inneren Konflikt?"
        ],
        writingFrame:
          "Die körperliche Belastung ist wichtig, weil sie den inneren Konflikt über ... spürbar macht.",
        relatedTheoryIds: ["naturalismus"]
      },
      {
        id: "milieu-3",
        title: "Naturraum ohne Idylle",
        pageHint: "S. 19",
        pageNumber: 19,
        passageLabel: "Wald, Feld und Unruhe",
        context:
          "Natur erscheint nicht als harmonischer Rückzugsort, sondern als dichter Erfahrungsraum voller Schwüle, Geräusche und Spannung.",
        signalWords: ["Wald", "Feld", "Schwüle", "Geräusch"],
        prompts: [
          "Wie vermeidet der Text idyllische Naturdarstellung?",
          "Welche Wahrnehmungsdetails machen die Umgebung nervös oder bedrängend?",
          "Wie unterstützt der Raum die innere Unruhe der Figur?"
        ],
        writingFrame:
          "Die Natur wirkt hier nicht beruhigend, sondern ..., weil ...",
        relatedTheoryIds: ["naturalismus", "perspektive"]
      },
      {
        id: "milieu-4",
        title: "Isolation und Pflichtroutine",
        pageHint: "S. 20",
        pageNumber: 20,
        passageLabel: "Einsamkeit im Dienst",
        context:
          "Thiel ist in seine Routine eingebunden und zugleich isoliert. Gerade diese Mischung aus Ordnung und Einsamkeit macht ihn anfällig für innere Übersteigerung.",
        signalWords: ["Routine", "Einsamkeit", "Pflicht", "still"],
        prompts: [
          "Wie entsteht aus Routine zugleich Sicherheit und Gefährdung?",
          "Welche Rolle spielt Einsamkeit für Thiels Innenwelt?",
          "Wie trägt die Passage zur Gesamtspannung der Novelle bei?"
        ],
        writingFrame:
          "Die Routine schützt Thiel nicht, sondern verstärkt seine Isolation, weil ...",
        relatedTheoryIds: ["perspektive", "novelle"]
      }
    ]
  },
  {
    id: "gewalt",
    title: "Gewalt gegen Tobias",
    lens: "Beobachtung, Schuld, Passivität",
    briefing:
      "Arbeite eng an den Szenen, in denen Lenes Härte und Thiels Untätigkeit sichtbar werden. Hier liegt ein moralisches Zentrum des Textes.",
    task:
      "Zeige, wie der Text Schuld nicht nur benennt, sondern über Beobachtungen, Zögern und Wiederholung sichtbar macht.",
    relatedTheoryIds: ["naturalismus", "perspektive", "novelle"],
    entries: [
      {
        id: "gewalt-1",
        title: "Die Belauschungsszene",
        pageHint: "S. 21",
        pageNumber: 21,
        passageLabel: "Lene gegen Tobias",
        context:
          "Thiel hört Lenes Brutalität gegenüber Tobias, reagiert aber nicht mit entschlossener Gegenwehr. Die Szene zeigt nicht nur Mitgefühl, sondern auch lähmende Ohnmacht.",
        signalWords: ["herzloser Schuft", "zittern", "es ließ nach", "kaum"],
        prompts: [
          "Wie baut der Text zuerst Erregung auf und nimmt sie dann sofort wieder zurück?",
          "Was sagt dieses Zögern über Thiels Schuld?",
          "Wie beeinflusst die Perspektive unser Urteil über ihn?"
        ],
        writingFrame:
          "Die Szene ist so wichtig, weil Thiels Wut zwar aufsteigt, aber sofort wieder ...",
        relatedTheoryIds: ["perspektive", "novelle"]
      },
      {
        id: "gewalt-2",
        title: "Spuren der Misshandlung",
        pageHint: "S. 22",
        pageNumber: 22,
        passageLabel: "Körperliche Zeichen",
        context:
          "Kleine, konkrete Spuren am Körper des Kindes machen Lenes Gewalt sichtbar. Gerade diese Details verleihen dem Text seine schmerzhafte Präzision.",
        signalWords: ["Fingerspuren", "blau", "klein", "Körper"],
        prompts: [
          "Wie arbeitet der Text mit kleinen Beobachtungen statt mit großen Anklagen?",
          "Warum ist gerade die Körperlichkeit der Beschreibung so eindringlich?",
          "Was macht diese Stelle typisch naturalistisch?"
        ],
        writingFrame:
          "Die Misshandlung wird nicht abstrakt behauptet, sondern konkret sichtbar durch ...",
        relatedTheoryIds: ["naturalismus"]
      },
      {
        id: "gewalt-3",
        title: "Ökonomische und emotionale Abhängigkeit",
        pageHint: "S. 23",
        pageNumber: 23,
        passageLabel: "Gefangen im Alltag",
        context:
          "Thiels Untätigkeit erscheint nicht nur als persönliches Versagen, sondern als Verstrickung in Abhängigkeit, Gewohnheit und Schwäche.",
        signalWords: ["abhängig", "schwach", "Gewohnheit", "nachgeben"],
        prompts: [
          "Wie erklärt der Text Passivität ohne sie zu entschuldigen?",
          "Welche Rolle spielen soziale und psychische Bindungen?",
          "Wie verschiebt sich hier dein Bild von Schuld?"
        ],
        writingFrame:
          "Thiels Untätigkeit wirkt komplex, weil der Text sie zugleich als ... und als ... zeigt.",
        relatedTheoryIds: ["naturalismus", "perspektive"]
      },
      {
        id: "gewalt-4",
        title: "Versagen des Vaters",
        pageHint: "S. 24",
        pageNumber: 24,
        passageLabel: "Schuld durch Nicht-Handeln",
        context:
          "Das Zentrum der Schuld liegt nicht allein in Lenes Handeln, sondern auch in Thiels Ausweichen. Die Novelle macht moralisches Versagen als Unterlassung sichtbar.",
        signalWords: ["Vater", "Schuld", "unterlassen", "Tobias"],
        prompts: [
          "Wie zeigt der Text, dass Nicht-Handeln selbst schuldig macht?",
          "Warum wird Tobias dadurch zur tragischen Mitte der Novelle?",
          "Wie eng führt diese Szene schon auf das spätere Ende zu?"
        ],
        writingFrame:
          "Die Passage macht Unterlassung schuldig, weil Thiel trotz ... nicht ...",
        relatedTheoryIds: ["novelle", "perspektive"]
      }
    ]
  },
  {
    id: "spaltung",
    title: "Vorzeichen und innere Spaltung",
    lens: "Wahrnehmung, Druck, Entgrenzung",
    briefing:
      "Ab hier verdichtet sich die Novelle. Achte auf Signale, die Thiels Wahrnehmung instabil machen und den Unfall vorbereiten.",
    task:
      "Arbeite heraus, wie der Text Übergänge von Kontrolle zu Wahrnehmungsstörung vorbereitet.",
    relatedTheoryIds: ["perspektive", "novelle", "naturalismus"],
    entries: [
      {
        id: "spaltung-1",
        title: "Innere Unruhe als Dauerzustand",
        pageHint: "S. 25",
        pageNumber: 25,
        passageLabel: "Kein stabiler Alltag mehr",
        context:
          "Der Alltag hält Thiel nicht mehr zusammen. Nervosität und innere Spannung sickern in seine Routine ein und verändern seine Wahrnehmung.",
        signalWords: ["Unruhe", "nervös", "angespannt", "still"],
        prompts: [
          "Welche Wörter zeigen, dass die frühere Ordnung brüchig wird?",
          "Wie wirkt die Unruhe eher schleichend als dramatisch?",
          "Warum ist gerade diese langsame Steigerung novellentypisch wirkungsvoll?"
        ],
        writingFrame:
          "Die Passage zeigt keine plötzliche Explosion, sondern eine schleichende Instabilität, weil ...",
        relatedTheoryIds: ["novelle", "perspektive"]
      },
      {
        id: "spaltung-2",
        title: "Minnas Bild gegen Lene",
        pageHint: "S. 27",
        pageNumber: 27,
        passageLabel: "Innere Gegensätze werden schärfer",
        context:
          "Minna und Lene stehen nun nicht nur biografisch, sondern als gegensätzliche innere Mächte gegeneinander. Thiels Denken polarisiert sich zunehmend.",
        signalWords: ["Minna", "Lene", "Gegensatz", "innerlich"],
        prompts: [
          "Wie werden Minna und Lene zu inneren Gegenpolen?",
          "Welche Wirkung hat diese Zuspitzung auf Thiels Wahrnehmung?",
          "Warum trägt sie zur Unerbittlichkeit des Schlusses bei?"
        ],
        writingFrame:
          "Der innere Konflikt schärft sich, weil die Figuren nicht mehr nur Personen sind, sondern ...",
        relatedTheoryIds: ["perspektive", "novelle"]
      },
      {
        id: "spaltung-3",
        title: "Außendruck und Innenwelt",
        pageHint: "S. 29",
        pageNumber: 29,
        passageLabel: "Belastung wird Wahrnehmung",
        context:
          "Äußere Belastungen schlagen in innere Bilder und Angst um. Die Novelle zeigt damit, wie Milieu und Psyche nicht trennbar bleiben.",
        signalWords: ["Belastung", "Angst", "Druck", "Bilder"],
        prompts: [
          "Wie greifen äußere Umstände und innere Wahrnehmung ineinander?",
          "Welche naturalistische Lesart ist hier möglich?",
          "Wie nah bleibt der Erzähler an Thiels Erleben?"
        ],
        writingFrame:
          "Die Szene verbindet äußeren Druck mit innerer Wahrnehmung, indem ...",
        relatedTheoryIds: ["naturalismus", "perspektive"]
      },
      {
        id: "spaltung-4",
        title: "Schwelle zur Katastrophe",
        pageHint: "S. 30-31",
        pageNumber: 30,
        passageLabel: "Steigerung vor dem Umbruch",
        context:
          "Kurz vor der eigentlichen Katastrophe häufen sich Signale der Überforderung. Die Spannung entsteht dabei weniger durch Handlung als durch Verdichtung von Zeichen.",
        signalWords: ["Vorahnung", "Schwelle", "Spannung", "Zeichen"],
        prompts: [
          "Welche kleinen Zeichen lassen dich eine Katastrophe erwarten?",
          "Wie erzeugt der Text Spannung ohne spektakuläre Aktion?",
          "Worin liegt hier der novellentypische Wendepunkt in Vorbereitung?"
        ],
        writingFrame:
          "Die Passage wirkt spannungsvoll, obwohl wenig geschieht, weil ...",
        relatedTheoryIds: ["novelle", "perspektive"]
      }
    ]
  },
  {
    id: "ausflug",
    title: "Familienausflug und Risikoraum",
    lens: "Szenenbau, Exposition der Gefahr",
    briefing:
      "Lies die Wege zur Unfallszene als präzise Katastrophenvorbereitung. Achte auf Konstellation, Raum und kleine Warnsignale.",
    task:
      "Untersuche, wie der Text den Unfall nicht zufällig wirken lässt, sondern Schritt für Schritt vorbereitet.",
    relatedTheoryIds: ["novelle", "naturalismus", "perspektive"],
    entries: [
      {
        id: "ausflug-1",
        title: "Aufbruch in den Arbeitsraum",
        pageHint: "S. 32",
        pageNumber: 32,
        passageLabel: "Familie im Gefahrenraum",
        context:
          "Mit dem Ausflug gerät die Familie in den Raum, der zuvor vor allem Thiels Berufsraum war. Dadurch verschränken sich Privatkonflikt und Bahnbetrieb unmittelbar.",
        signalWords: ["Aufbruch", "Familie", "Posten", "Raum"],
        prompts: [
          "Warum ist der Ortswechsel für die Dramaturgie so wichtig?",
          "Wie überlagern sich nun Familien- und Arbeitskonflikt?",
          "Was macht diese Szene zu einer Vorbereitung des Wendepunkts?"
        ],
        writingFrame:
          "Der Ortswechsel ist entscheidend, weil er erstmals ... direkt zusammenführt.",
        relatedTheoryIds: ["novelle", "naturalismus"]
      },
      {
        id: "ausflug-2",
        title: "Tobias im offenen Risiko",
        pageHint: "S. 33",
        pageNumber: 33,
        passageLabel: "Verletzbarkeit des Kindes",
        context:
          "Tobias' Gefährdung wird nicht erst im Unfall sichtbar. Schon die Konstellation der Szene lässt erkennen, wie ungeschützt das Kind ist.",
        signalWords: ["Kind", "offen", "ungeschützt", "Nähe"],
        prompts: [
          "Welche Hinweise machen Tobias schon hier besonders verletzlich?",
          "Wie steigert diese Konstellation die Spannung?",
          "Warum ist gerade die Unspektakularität der Hinweise so wirkungsvoll?"
        ],
        writingFrame:
          "Tobias wirkt schon vor dem Unfall gefährdet, weil ...",
        relatedTheoryIds: ["novelle", "perspektive"]
      },
      {
        id: "ausflug-3",
        title: "Gestörte Routine",
        pageHint: "S. 34",
        pageNumber: 34,
        passageLabel: "Pflicht unter Ablenkung",
        context:
          "Die Anwesenheit der Familie verändert Thiels gewohnte Arbeitsordnung. Gerade kleine Störungen der Routine erhöhen die Gefahr.",
        signalWords: ["Routine", "Ablenkung", "Pflicht", "Störung"],
        prompts: [
          "Wie zeigt die Szene, dass Routine nur unter stabilen Bedingungen trägt?",
          "Welche Rolle spielt Ablenkung für den weiteren Verlauf?",
          "Wie arbeiten hier äußere Störung und innere Unruhe zusammen?"
        ],
        writingFrame:
          "Die Routine trägt nicht mehr, weil ... und ... gleichzeitig auf Thiel einwirken.",
        relatedTheoryIds: ["naturalismus", "perspektive"]
      },
      {
        id: "ausflug-4",
        title: "Die letzten Warnzeichen",
        pageHint: "S. 35",
        pageNumber: 35,
        passageLabel: "Gefahr wird greifbar",
        context:
          "Vor dem Unfall verdichtet der Text räumliche, psychische und technische Spannung. Die Katastrophe rückt nahe, ohne schon ausgesprochen zu sein.",
        signalWords: ["Warnung", "Nähe", "Spannung", "Bahn"],
        prompts: [
          "Welche Signale lassen die Katastrophe fast körperlich spürbar werden?",
          "Wie führt der Erzähler die Szene auf einen Kulminationspunkt zu?",
          "Welche Wirkung hat die noch zurückgehaltene Explosion?"
        ],
        writingFrame:
          "Die Spannung entsteht vor allem dadurch, dass der Text ... häuft, ohne ... sofort aufzulösen.",
        relatedTheoryIds: ["novelle", "perspektive"]
      }
    ]
  },
  {
    id: "traum",
    title: "Erscheinung, Unfall und Wahrnehmungsverlust",
    lens: "Vision, Technik, Katastrophe",
    briefing:
      "Arbeite direkt im Unfallscharnier der Novelle. Hier verschmelzen Innenwelt, Technik und tödliche Realität.",
    task:
      "Erkläre, wie der Text die Unfallszene zugleich psychologisch, erzähltechnisch und symbolisch auflädt.",
    relatedTheoryIds: ["perspektive", "novelle", "naturalismus"],
    entries: [
      {
        id: "traum-1",
        title: "Minnas Erscheinung auf den Schienen",
        pageHint: "S. 36",
        pageNumber: 36,
        passageLabel: "Minnas Erscheinung",
        context:
          "Kurz vor der Katastrophe erscheint Minna in Thiels Wahrnehmung auf den Gleisen. Die Erscheinung bleibt körperlich beschädigt, blass und zugleich zwingend real.",
        signalWords: ["verstorbene Frau", "schlaff", "blutig", "bleich"],
        prompts: [
          "Wie macht der Text die Erscheinung zugleich geisterhaft und körperlich konkret?",
          "Welche Perspektivsignale lassen offen, wie verlässlich die Wahrnehmung ist?",
          "Welche Funktion hat Minna gerade an diesem Punkt der Novelle?"
        ],
        writingFrame:
          "Die Erscheinung wirkt doppeldeutig, weil sie gleichzeitig ... und ... erscheint.",
        relatedTheoryIds: ["perspektive", "novelle"]
      },
      {
        id: "traum-2",
        title: "Traum und Wirklichkeit verschmelzen",
        pageHint: "S. 36-37",
        pageNumber: 36,
        passageLabel: "Instabile Wirklichkeit",
        context:
          "Nach dem Erwachen bleibt die Grenze zwischen Bild und Wirklichkeit instabil. Dadurch verliert Thiel im entscheidenden Moment seine Beobachtungssicherheit.",
        signalWords: ["verschmolzen", "Wirklichkeit", "Grauen", "Angst"],
        prompts: [
          "Wie zeigt der Text, dass Wahrnehmung und Realität nicht mehr sauber getrennt sind?",
          "Warum ist diese Verschmelzung mehr als bloße Vorahnung?",
          "Wie lenkt die Erzählweise dein Mit-Erleben?"
        ],
        writingFrame:
          "Die Szene ist entscheidend, weil Wirklichkeit nicht mehr fest erscheint, sondern ...",
        relatedTheoryIds: ["perspektive"]
      },
      {
        id: "traum-3",
        title: "Der heranrasende Zug",
        pageHint: "S. 37",
        pageNumber: 37,
        passageLabel: "Technik trifft auf Überforderung",
        context:
          "Der Zug ist nicht nur äußere Gefahr, sondern trifft auf eine Figur, deren Wahrnehmung bereits destabilisiert ist. So verbindet der Text Technik mit psychischer Überforderung.",
        signalWords: ["rasender Zug", "Stehen bringen", "Grauen", "Angst"],
        prompts: [
          "Wie wirken Technik und menschliche Überforderung hier zusammen?",
          "Welche naturalistische Lesart ergibt sich aus dieser Verknüpfung?",
          "Warum ist gerade die Unaufhaltsamkeit des Zuges so bedeutend?"
        ],
        writingFrame:
          "Die Technik erscheint hier nicht neutral, sondern ..., weil ...",
        relatedTheoryIds: ["naturalismus", "novelle"]
      },
      {
        id: "traum-4",
        title: "Tobias' Tod als Wendepunkt",
        pageHint: "S. 37",
        pageNumber: 37,
        passageLabel: "Katastrophe und irreversibler Bruch",
        context:
          "Mit Tobias' Tod kippt die Novelle unwiderruflich in den Schlussbereich. Das zentrale Ausnahmeereignis ist nun eingetreten und lässt keine Rückkehr in den Alltag mehr zu.",
        signalWords: ["Tod", "Bruch", "Schock", "irreversibel"],
        prompts: [
          "Warum ist dieser Moment der eigentliche Wendepunkt des Textes?",
          "Wie verändert sich damit die Schuld- und Deutungsfrage?",
          "Welche Motive laufen in diesem Augenblick zusammen?"
        ],
        writingFrame:
          "Tobias' Tod ist der Wendepunkt, weil von hier an ... nicht mehr möglich ist.",
        relatedTheoryIds: ["novelle", "perspektive"]
      }
    ]
  },
  {
    id: "schluss",
    title: "Zusammenbruch und Gesamtdeutung",
    lens: "Wahnsinn, Konsequenz, Deutung",
    briefing:
      "Lies den Schluss nicht nur als Schock, sondern als Konsequenz einer langen inneren und sozialen Vorgeschichte.",
    task:
      "Formuliere auf der Basis einzelner Beobachtungen eine belastbare Gesamtdeutung des Schlusses.",
    relatedTheoryIds: ["novelle", "perspektive", "naturalismus"],
    entries: [
      {
        id: "schluss-1",
        title: "Nach Tobias' Tod",
        pageHint: "S. 38",
        pageNumber: 38,
        passageLabel: "Schock und Erstarrung",
        context:
          "Nach Tobias' Tod bricht Thiels fragile Selbstkontrolle zusammen. Innere Leere, körperliche Starre und Schock machen den Übergang in den Schluss sichtbar.",
        signalWords: ["nicht sprechen", "erstarrt", "leblos", "Zusammenbruch"],
        prompts: [
          "Wie macht der Text Schock körperlich sichtbar?",
          "Welche Wirkung hat das Verstummen der Figur?",
          "Wie bereitet dieser Zustand die folgende Eskalation vor?"
        ],
        writingFrame:
          "Der Schock wird körperlich greifbar, weil Thiel nicht nur ..., sondern auch ...",
        relatedTheoryIds: ["perspektive", "naturalismus"]
      },
      {
        id: "schluss-2",
        title: "Gewalt als entgrenzter Endpunkt",
        pageHint: "S. 39",
        pageNumber: 39,
        passageLabel: "Tat und Eskalation",
        context:
          "Die Gewalttat gegen Lene und das Kind erscheint nicht als isolierter Affekt, sondern als Endpunkt einer lange vorbereiteten inneren Spaltung aus Schuld, Wahn und Verdrängung.",
        signalWords: ["Wahnsinn", "Tat", "Kind", "Schuld"],
        prompts: [
          "Warum ist der Schluss zugleich Schock und Konsequenz?",
          "Welche früheren Signale laufen in der Tat zusammen?",
          "Wie verändert der Text hier dein Urteil über Thiel?"
        ],
        writingFrame:
          "Die Tat wirkt vorbereitet, weil der Text schon zuvor ... und ... aufgebaut hat.",
        relatedTheoryIds: ["novelle", "perspektive"]
      },
      {
        id: "schluss-3",
        title: "Anstalt und Nachbild",
        pageHint: "S. 40",
        pageNumber: 40,
        passageLabel: "Restbild der zerstörten Figur",
        context:
          "Im Endbild bleibt von Thiels frühere Ordnung nichts übrig. Die Figur wird als zerstörter Rest sichtbar, nicht als heroischer Täter.",
        signalWords: ["Anstalt", "zerstört", "Rest", "Endbild"],
        prompts: [
          "Wie entzieht das Endbild jeder Heroisierung den Boden?",
          "Welche Wirkung hat die knappe Darstellung des Endzustands?",
          "Was sagt dieses Ende über Mensch und Milieu?"
        ],
        writingFrame:
          "Das Endbild ist so wirkungsvoll, weil es Thiel nicht erhöht, sondern als ... zeigt.",
        relatedTheoryIds: ["naturalismus", "novelle"]
      },
      {
        id: "schluss-4",
        title: "Titel und Gesamtdeutung",
        pageHint: "S. 40 / Gesamttext",
        pageNumber: 40,
        passageLabel: "Warum heißt der Text Bahnwärter Thiel?",
        context:
          "Der Titel lenkt den Blick auf die Figur in ihrer sozialen Rolle, nicht bloß auf die spätere Tat. Arbeit, Ordnung und Zusammenbruch werden so von Anfang an zusammen gelesen.",
        signalWords: ["Bahnwärter", "Rolle", "Ordnung", "Zusammenbruch"],
        prompts: [
          "Warum trägt der Text den Namen der Berufsrolle und nicht den des Verbrechens?",
          "Welche Gesamtdeutung entsteht, wenn man Titel, Milieu und Katastrophe zusammen liest?",
          "Inwiefern verbindet der Titel soziale Rolle und tragisches Schicksal?"
        ],
        writingFrame:
          "Der Titel ist programmatisch, weil er den Blick von Anfang an auf ... richtet.",
        relatedTheoryIds: ["novelle", "naturalismus"]
      }
    ]
  }
];

export const lessonSets = [
  {
    id: "lesson-auftakt",
    title: "Lektion 1 · Auftakt und Minnas Raum",
    summary:
      "Berufsrolle, familiäre Ausgangslage und Minnas Nachleben im Wärterhäuschen. Geeignet als Einstieg oder erste textnahe SEB-Arbeit.",
    moduleIds: ["auftakt", "kapelle"],
    reviewFocus: "Arbeite mit Wendepunkt-Vorbereitung, Raumsemantik und erster Figurenanlage.",
    sebPrompt:
      "Bearbeite zwei Passagen aus Auftakt und Minnas Raum. Sichere mindestens zwei Wortsignale und verbinde deine Beobachtungen mit Novellentheorie oder Erzählperspektive."
  },
  {
    id: "lesson-lene",
    title: "Lektion 2 · Lene, Alltag und Milieu",
    summary:
      "Lene als Gegenfigur, Haushaltsmacht, Arbeitswelt und naturalistische Milieudarstellung.",
    moduleIds: ["lene", "milieu"],
    reviewFocus: "Achte auf Körper, Alltag, soziale Härte und ungeschönte Wirklichkeitsdarstellung.",
    sebPrompt:
      "Zeige an zwei Stellen, wie der Text Lene, Arbeit und Milieu zusammenbindet. Nutze die Theorie-Linse Naturalismus."
  },
  {
    id: "lesson-gewalt",
    title: "Lektion 3 · Gewalt, Schuld und innere Spaltung",
    summary:
      "Tobias' Gefährdung, moralische Passivität und die zunehmende Zersetzung von Thiels Wahrnehmung.",
    moduleIds: ["gewalt", "spaltung"],
    reviewFocus: "Verbinde Schuldfrage, Unterlassung und Wahrnehmungsinstabilität präzise mit dem Wortlaut.",
    sebPrompt:
      "Untersuche an zwei Passagen, wie Schuld durch Nicht-Handeln sichtbar wird und wie der Text die innere Spaltung vorbereitet."
  },
  {
    id: "lesson-unfall",
    title: "Lektion 4 · Ausflug, Risiko und Unfall",
    summary:
      "Familienszene, Risikoraum, Technik und Katastrophe als zentraler Wendepunkt der Novelle.",
    moduleIds: ["ausflug", "traum"],
    reviewFocus: "Achte auf Szenenbau, Wendepunkt, Wahrnehmungsverlust und die Rolle der Technik.",
    sebPrompt:
      "Arbeite den Wendepunkt der Novelle heraus und zeige, wie Technik, Perspektive und Überforderung in der Unfallszene zusammenwirken."
  },
  {
    id: "lesson-schluss",
    title: "Lektion 5 · Schluss und Gesamtdeutung",
    summary:
      "Zusammenbruch, Tat, Endbild und titelbezogene Gesamtdeutung.",
    moduleIds: ["schluss"],
    reviewFocus: "Begründe aus dem Wortlaut, warum der Schluss Schock und Konsequenz zugleich ist.",
    sebPrompt:
      "Formuliere eine belastbare Gesamtdeutung des Schlusses und stütze sie mit mindestens zwei Beobachtungen am Wortlaut."
  },
  {
    id: "lesson-novellentheorie",
    title: "Lektion 6 · Novellentheorie als Leseschlüssel",
    summary:
      "Die Einheit bündelt zentrale Passagen unter der Frage, wie Bahnwärter Thiel als Novelle mit Verdichtung, Motivführung und unerhörter Begebenheit gebaut ist.",
    moduleIds: ["auftakt", "kapelle", "ausflug", "schluss"],
    reviewFocus: "Arbeite mit Wendepunkt, Verdichtung, Motivik und folgenreicher Ausnahmebegebenheit.",
    sebPrompt:
      "Prüfe an mehreren Passagen, wie der Text den Konflikt verdichtet, Motive wiederkehren lässt und auf die unerhörte Begebenheit im Schluss zuläuft. Nutze gezielt die Theorie-Linse Novelle."
  },
  {
    id: "lesson-naturalismus-perspektive",
    title: "Lektion 7 · Naturalismus und Erzählperspektive",
    summary:
      "Diese Lektion verbindet Milieuanalyse und Perspektivarbeit: Wie machen Arbeit, Körper, soziale Härte und Wahrnehmungsnähe Thiels Krise lesbar?",
    moduleIds: ["auftakt", "lene", "milieu", "spaltung"],
    reviewFocus: "Verbinde Milieu, Körper, soziale Determinierung und Wahrnehmungslenkung sauber mit dem Wortlaut.",
    sebPrompt:
      "Untersuche an ausgewählten Passagen, wie Naturalismus und Erzählperspektive zusammenwirken: Zeige erst die äußeren Bedingungen, dann die gelenkte Wahrnehmung und sichere beides mit präzisen Textsignalen."
  }
];

export const starterPrompt = {
  title: "Arbeitsauftrag",
  items: [
    "Arbeite den Text entlang des gesamten Lernpfads Seite für Seite im eingebetteten PDF durch.",
    "Sichere erst Wortlaut und Signalwörter, bevor du deutest.",
    "Nutze zu jeder Passage mindestens eine Theorie-Linse: Novelle, Naturalismus oder Erzählperspektive.",
    "Halte am Ende deiner Notiz fest, wie du sie nach Feedback oder neuer Lektüre schärfen würdest."
  ]
};

export const pdfSource = "/reader/assets/bahnwaerter-thiel.pdf";
