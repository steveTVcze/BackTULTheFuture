import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import { PazourekModel } from './PazourekModel'; 
import { PryskyriceModel } from './PryskyriceModel'; 
import { OhenModel } from './OhenModel';
import { KremenModel } from './KremenModel';
import { ServerModel } from './ServerModel';

function DynamicModel({ type }: { type: string | undefined }) {
  switch (type) {
    case 'pazourek': 
      return <PazourekModel position={[0, 0, 0]} scale={1.0} />;
    case 'pryskyrice': 
      return <PryskyriceModel position={[0, 0, 0]} scale={1.5} />;
    case 'ohen': 
      return <OhenModel position={[0, 0, 0]} scale={1.5} />;
    case 'kremen': 
      return <KremenModel position={[0, 0, 0]} scale={10.5} />;
    case 'server': 
      return <ServerModel position={[0, 0, 0]} scale={1.5} />;
    default:
      return (
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="red" wireframe />
        </mesh>
      );
  }
}

const GAME_STEPS = [
  {
    id: 1,
    title: "1. Kde to jsi?",
    story: "Záblesk z modré obrazovky smrti, hrozná rána a teď... ležíš v bahně. Kolem tebe kapradiny velikosti paneláku. Systém je v offline režimu, ale databázové jádro běží.",
    hint: "-- Zkus zjistit z dostupné struktury, jak se nazývá prostor kolem tebe. Tvoje identita v systému je Hráč číslo 1.",
    schemaImage: "./images/schema_db_prvni.jpg",
    audioFile: "./audio/1.mp3",
    options: [
      { query: "SELECT Nazev FROM Lokace JOIN Hrac ON Lokace.ID_Lokace = Hrac.ID_Hrac;", isCorrect: false, explanation: "❌ SQL Error: Sloupec 'Lokace.ID_Hrac' neexistuje v klauzuli ON." },
      { query: "SELECT L.Nazev FROM Lokace L JOIN Hrac H ON L.ID_Lokace = H.ID_Lokace WHERE H.ID_Hrac = 1;", isCorrect: true, explanation: "✔️ Dotaz úspěšný. Zjištěny aktuální souřadnice:", tableData: [{ Nazev: "TUL Džungle" }] },
      { query: "SELECT Nazev FROM Lokace, Hrac WHERE ID_Hrac = 1;", isCorrect: false, explanation: "❌ Logická chyba: Chybí JOIN podmínka (kartézský součin). Nevíš, kde jsi!", tableData: [{ Nazev: "TUL Džungle" }, { Nazev: "Temná jeskyně" }, { Nazev: "Sopečný kráter" }] }
    ],
    expectedSql: /SELECT.*Nazev.*FROM.*Lokace/i,
    bgImage: "./images/step1_jungle.png",
    has3D: false
  },
  {
    id: 2,
    title: "2. Průzkum",
    story: "Dinosauří řev v dálce ti zrychlil tep. Obvykle si tví předchůdci nechávali zašifrované vzkazy vázané na konkrétní místa. Možná tu něco je.",
    hint: "-- Prohledej systémové záznamy a zjisti, co si někdo zapsal k tvým současným souřadnicím (lokace 1). Zajímají tě jen textové údaje.",
    schemaImage: "./images/schema_db_druhy.jpg",
    audioFile: "./audio/2.mp3",
    options: [
      { query: "SELECT ID_poznamky FROM Poznamky_k_lokaci WHERE ID_lokace = 1;", isCorrect: false, explanation: "❌ Zjistil jsi jen ID záznamu, ale k přežití potřebuješ číst samotný text!", tableData: [{ ID_poznamky: 1 }] },
      { query: "SELECT Text FROM Lokace WHERE ID_lokace = 1;", isCorrect: false, explanation: "❌ SQL Error: Neznámý sloupec 'Text' v tabulce 'Lokace'." },
      { query: "SELECT Text FROM Poznamky_k_lokaci WHERE ID_lokace = 1;", isCorrect: true, explanation: "✔️ Přečetl jsi starý záznam v systému:", tableData: [{ Text: "Kdo najde pazourek, přežije noc." }] }
    ],
    expectedSql: /SELECT.*Text.*FROM.*Poznamky/i,
    bgImage: "./images/step2_jungle_detail.png",
    has3D: false
  },
  {
    id: 3, 
    title: "3. Co to tam leží?",
    story: "Vyskočila na tebe hláška, že v této lokaci se nachází fyzický objekt. Než ho sebereš, musíš zjistit jeho systémové ID a název.",
    hint: "-- Zjisti, jaké předměty leží v tvé aktuální lokaci (ID_Lokace = 1). Musíš propojit tabulku Predmet_Lokace s číselníkem Predmet.",
    schemaImage: "./images/schema_db_treti.jpg", 
    audioFile: "./audio/3.mp3",
    options: [
      { query: "SELECT * FROM Predmet_Lokace WHERE ID_Lokace = 1;", isCorrect: false, explanation: "❌ Zjistil jsi jen ID předmětu, ale nevíš jeho název! Musíš použít JOIN na tabulku Predmet.", tableData: [{ ID_Predmet: 1, ID_Lokace: 1 }] },
      { query: "SELECT P.Nazev FROM Predmet P WHERE ID_Lokace = 1;", isCorrect: false, explanation: "❌ SQL Error: Sloupec 'ID_Lokace' neexistuje v tabulce Predmet." },
      { query: "SELECT P.ID_Predmet, P.Nazev FROM Predmet P JOIN Predmet_Lokace PL ON P.ID_Predmet = PL.ID_Predmet WHERE PL.ID_Lokace = 1;", isCorrect: true, explanation: "✔️ Výborně! Odhalil jsi objekt:", tableData: [{ ID_Predmet: 1, Nazev: "Pazourek" }] }
    ],
    expectedSql: /JOIN.*Predmet_Lokace/i,
    bgImage: "./images/step2_jungle_detail.png",
    has3D: false
  },
  {
    id: 4,
    title: "4. Nález pazourku",
    story: "Na zemi se blýská ostrý šutr. Vypadá jako pazourek. Není to sice mechanická klávesnice, ale do kapsy se vejde a bude se hodit.",
    hint: "-- Tento fyzický objekt (ID 1) si musíš zapsat jako nový záznam do svých osobních věcí (jsi hráč 1, bereš 1 kus).",
    schemaImage: "./images/schema_db_ctvrty_actually.jpg",
    audioFile: "./audio/4.mp3",
    options: [
      { query: "INSERT INTO Inventar (ID_Predmet, Mnozstvi, ID_Hrac) VALUES (1, 1, 2);", isCorrect: false, explanation: "❌ SQL Error: Porušení cizího klíče. Hráč s ID 2 v systému neexistuje!" },
      { query: "UPDATE Inventar SET ID_Predmet = 1 WHERE ID_Hrac = 1;", isCorrect: false, explanation: "❌ Aktualizace selhala. Nemůžeš 'updatovat' předmět, který v inventáři ještě nemáš zapsaný.", rowsAffected: 0 },
      { query: "INSERT INTO Inventar (ID_Hrac, Mnozstvi, ID_Predmet) VALUES (1, 1, 1);", isCorrect: true, explanation: "✔️ Předmět úspěšně sebrán ze země a zapsán.", rowsAffected: 1 }
    ],
    expectedSql: /INSERT.*INTO.*Inventar.*VALUES.*1.*1.*1/i,
    bgImage: "./images/step3_flint.png",
    has3D: true,
    modelType: "pazourek", 
    newItem: { icon: "🪨", name: "Pazourek" }
  },
  {
    id: 5,
    title: "5. Skautské dovednosti",
    story: "Z hodin fyziky na TULce víš, že v noci teplota klesne. Potřebuješ teplo. Jádro naštěstí obsahuje prehistorickou kuchařku přežití.",
    hint: "-- Zobraz si veškeré dostupné informace o tom, jak sestavit přesně 'Vyrobit ohen'.",
    schemaImage: "./images/schema_db_paty.jpg",
    audioFile: "./audio/5.mp3",
    options: [
      { query: "SELECT Predmet1, Predmet2 FROM Recept WHERE ID_Recept = 'Vyrobit ohen';", isCorrect: false, explanation: "❌ SQL Error: Typový nesoulad. Očekáván datový typ INT, ale dostal jsi VARCHAR." },
      { query: "SELECT * FROM Recept WHERE Nazev_receptu = 'Vyrobit ohen';", isCorrect: true, explanation: "✔️ Systém vrátil plán pro craftění:", tableData: [{ ID_Recept: 1, Nazev_receptu: "Vyrobit ohen", Predmet1: 1, Predmet2: 18, Vysledek: 26 }] },
      { query: "SELECT * FROM Predmet WHERE Nazev = 'Vyrobit ohen';", isCorrect: false, explanation: "❌ Logická chyba: Hledáš recepty v tabulce pro předměty.", tableData: [] }
    ],
    expectedSql: /SELECT.*FROM.*Recept.*Vyrobit ohen/i,
    bgImage: "./images/step4_crafting_ui.png",
    has3D: false
  },
  {
    id: 6,
    title: "6. Pryskyřice",
    story: "Kámen máš. Teď to chce něco hořlavého. Na kmeni obří praborovice vidíš zářivou, lepkavou smůlu. Ideální materiál!",
    hint: "-- Musíš udělat dvě věci: Změnit svou pozici k borovici (Lokace 12) a následně přidat jeden kus suroviny s ID 18 k sobě.",
    schemaImage: "./images/schema_db_paty.jpg",
    audioFile: "./audio/6.mp3",
    options: [
      { query: "INSERT INTO Inventar (ID_Hrac, Mnozstvi, ID_Predmet) VALUES (1, 1, 18);", isCorrect: false, explanation: "❌ Systém zamítl příkaz. Jsi moc daleko. Musíš se k borovici nejdřív přesunout pomocí UPDATE." },
      { query: "UPDATE Hrac SET ID_Lokace = 18; INSERT INTO Inventar (ID_Hrac, Mnozstvi, ID_Predmet) VALUES (1, 1, 12);", isCorrect: false, explanation: "❌ Kritická chyba: Prohodil jsi ID lokace a předmětu. Šel jsi na špatné místo a snažíš se sebrat vzduch." },
      { query: "UPDATE Hrac SET ID_Lokace = 12; INSERT INTO Inventar (ID_Hrac, Mnozstvi, ID_Predmet) VALUES (1, 1, 18);", isCorrect: true, explanation: "✔️ Přesun a zápis proběhl úspěšně.", rowsAffected: 2 }
    ],
    expectedSql: /INSERT.*INTO.*Inventar.*18/i,
    bgImage: "./images/step5_resin_tree.png",
    has3D: true,
    modelType: "pryskyrice", 
    newItem: { icon: "💧", name: "Pryskyřice" }
  },
  {
    id: 7,
    title: "7. Hledání úkrytu",
    story: "Začíná se stmívat a teplota rychle padá. Zůstat venku znamená game over. Potřebuješ najít nějakou díru ve skále.",
    hint: "-- Přepiš svůj aktuální stav na místo, jehož jméno v sobě kdekoli ukrývá slovo 'Jeskyne'.",
    schemaImage: "./images/schema_db_paty.jpg",
    audioFile: "./audio/7.mp3",
    options: [
      { query: "SELECT ID_Lokace FROM Lokace WHERE Nazev = 'Jeskyne';", isCorrect: false, explanation: "❌ Sice jsi zjistil ID lokace, ale tvá postava se reálně nikam nepřesunula! Musíš updatovat tabulku Hrac.", tableData: [{ ID_Lokace: 15 }] },
      { query: "UPDATE Hrac SET ID_Lokace = '%Jeskyne%';", isCorrect: false, explanation: "❌ SQL Error: Neplatná syntaxe vstupu pro typ INT: '%Jeskyne%'." },
      { query: "UPDATE Hrac SET ID_Lokace = (SELECT ID_Lokace FROM Lokace WHERE Nazev LIKE '%Jeskyne%');", isCorrect: true, explanation: "✔️ Tvá poloha byla úspěšně změněna do bezpečí.", rowsAffected: 1 }
    ],
    expectedSql: /UPDATE.*Hrac.*SET.*ID_Lokace/i,
    bgImage: "./images/step6_cave_entrance.png",
    has3D: false
  },
  // KROK 8
  {
    id: 8,
    title: "8. Budiž oheň",
    story: "Jsi v relativním bezpečí. Srdce ti buší, když mlátíš kamenem o kámen těsně nad pryskyřicí. Jiskra přeskakuje...",
    hint: "-- Využij to, co ses naučil z kuchařky, a ulož si do vybavení finální produkt (předmět 26).",
    schemaImage: "./images/schema_db_paty.jpg",
    audioFile: "./audio/8.mp3",
    options: [
      { query: "INSERT INTO Inventar (ID_Hrac, Mnozstvi, ID_Predmet) VALUES (1, 1, 26);", isCorrect: true, explanation: "✔️ Oheň úspěšně zapálen! Přežiješ noc.", rowsAffected: 1 },
      { query: "UPDATE Inventar SET Mnozstvi = 1 WHERE ID_Predmet = 26 AND ID_Hrac = 1;", isCorrect: false, explanation: "❌ Nic se nestalo. Snažíš se změnit množství ohně, který v inventáři ještě nemáš.", rowsAffected: 0 },
      { query: "INSERT INTO Inventar VALUES (1, 26);", isCorrect: false, explanation: "❌ SQL Error: Počet dodaných hodnot (2) neodpovídá počtu sloupců (4) v tabulce." }
    ],
    expectedSql: /INSERT.*INTO.*Inventar.*26/i,
    bgImage: "./images/step7_cave_fire.png",
    has3D: true, 
    newItem: { icon: "🔥", name: "Oheň" },
    modelType: "ohen", 
    removeItem: "Pazourek"
  },
  {
    id: 9,
    title: "9. Zákon zachování dat",
    story: "Oheň plápolá! Systém ale hlásí datovou nekonzistenci. Pazourek se úderem rozpadl na prach a pryskyřice shořela. Musíš tyhle suroviny (ID 1 a 18) odstranit ze svého inventáře, jinak ti spadne databáze.",
    hint: "-- Vymaž z tabulky Inventar záznamy o předmětech 1 a 18 pro Hráče 1.",
    schemaImage: "./images/schema_db_paty.jpg",
    audioFile: "./audio/9.mp3",
    options: [
      { query: "UPDATE Inventar SET Mnozstvi = 0 WHERE ID_Hrac = 1;", isCorrect: false, explanation: "❌ KATASTROFA: Nastavil jsi množství VŠECH svých věcí na nulu! I ten oheň ti právě zhasl.", rowsAffected: 3 },
      { query: "DELETE FROM Inventar WHERE ID_Predmet = 1 OR ID_Predmet = 18;", isCorrect: false, explanation: "❌ Nebezpečný dotaz. Smazal bys tyto předměty z inventáře VŠEM HRÁČŮM na serveru, nejen sobě (chybí ID_Hrac = 1).", rowsAffected: 5 },
      { query: "DELETE FROM Inventar WHERE ID_Hrac = 1 AND ID_Predmet IN (1, 18);", isCorrect: true, explanation: "✔️ Nekonzistence odstraněna. Inventář je čistý.", rowsAffected: 2 }
    ],
    expectedSql: /DELETE.*FROM.*Inventar/i,
    bgImage: "./images/step7_cave_fire.png",
    has3D: false
  },
  {
    id: 10,
    title: "10. Zpět k IT",
    story: "Hřeješ se u ohně a vrací se ti plné vědomí. Jsi ajťák! Abys opravil systém a vrátil se v čase, musíš postavit server z prehistorických surovin. Křemík je základ.",
    hint: "-- Tady ve stěně něco je! Vydoluj krystal s ID 4 a bezpečně ho ulož k sobě.",
    schemaImage: "./images/schema_db_paty.jpg",
    audioFile: "./audio/10.mp3",
    options: [
      { query: "INSERT INTO Inventar (ID_Hrac, ID_Predmet, Mnozstvi) VALUES (4, 1, 1);", isCorrect: false, explanation: "❌ SQL Error: Porušení cizího klíče. Vložil jsi data ve špatném pořadí, Hráč ID 4 neexistuje." },
      { query: "INSERT INTO Predmet (ID_Hrac, Mnozstvi, ID_Predmet) VALUES (1, 1, 4);", isCorrect: false, explanation: "❌ Tabulka 'Predmet' slouží jako systémový číselník. Svoje věci musíš dávat do 'Inventar'." },
      { query: "INSERT INTO Inventar (ID_Hrac, Mnozstvi, ID_Predmet) VALUES (1, 1, 4);", isCorrect: true, explanation: "✔️ Křemen vydolován a přidán do tvého inventáře.", rowsAffected: 1 }
    ],
    expectedSql: /INSERT.*INTO.*Inventar.*4/i,
    bgImage: "./images/step8_silicon.png",
    has3D: true, 
    modelType: "kremen", 
    newItem: { icon: "💎", name: "Křemen" }
  },
  {
    id: 11,
    title: "11. Audit součástek",
    story: "Před stavbou Serveru I (recept ID 13) si musíš udělat revizi. Potřebuješ vědět, zda máš v inventáři potřebné suroviny a jak se jmenují.",
    hint: "-- Vypiš si Název předmětů, které máš v Inventáři (JOIN Predmet a Inventar). To už na pohled zjistíš, co držíš v ruce.",
    schemaImage: "./images/schema_db_paty.jpg",
    audioFile: "./audio/11.mp3",
    options: [
      { query: "SELECT * FROM Inventar WHERE ID_Hrac = 1;", isCorrect: false, explanation: "❌ Vidíš jen IDčka (ID 4, ID 26). Ty jako člověk potřebuješ znát jejich jména (JOIN Predmet)!", tableData: [{ ID_Inventar: 4, Mnozstvi: 1, ID_Hrac: 1, ID_Predmet: 4 }] },
      { query: "SELECT P.Nazev, I.Mnozstvi FROM Predmet P JOIN Inventar I ON P.ID_Predmet = I.ID_Predmet WHERE I.ID_Hrac = 1;", isCorrect: true, explanation: "✔️ Výpis inventáře dokončen. Máš Křemen i Oheň. Jde se stavět!", tableData: [{ Nazev: "Ohen", Mnozstvi: 1 }, { Nazev: "Kremen", Mnozstvi: 1 }] },
      { query: "SELECT Nazev FROM Predmet WHERE ID_Hrac = 1;", isCorrect: false, explanation: "❌ SQL Error: Sloupec 'ID_Hrac' neexistuje v tabulce Predmet." }
    ],
    expectedSql: /JOIN.*Inventar/i,
    bgImage: "./images/step8_silicon.png",
    has3D: false
  },
  {
    id: 12,
    title: "12. Montáž Serveru",
    story: "Křemíkový procesor na kamenné desce, liány místo kabelů. Sestrojil jsi prehistorický superpočítač: Server I.",
    hint: "-- Finální craftění. Zaregistruj do systému zbrusu nový superpočítač (ID 13) pod svým jménem.",
    schemaImage: "./images/schema_db_paty.jpg",
    audioFile: "./audio/12.mp3",
    options: [
      { query: "UPDATE Inventar SET ID_Predmet = 13 WHERE ID_Hrac = 1;", isCorrect: false, explanation: "❌ KATASTROFA: Tímhle updatem bez ID_Predmet jsi přepsal ÚPLNĚ VŠECHNY svoje předměty na servery!", rowsAffected: 5 },
      { query: "INSERT INTO Inventar (ID_Hrac, Mnozstvi, ID_Predmet) VALUES (1, 1, 13);", isCorrect: true, explanation: "✔️ Prehistorický server I běží. Sestavení dokončeno.", rowsAffected: 1 },
      { query: "INSERT INTO Hrac (ID_Predmet) VALUES (13);", isCorrect: false, explanation: "❌ SQL Error: Neznámý sloupec 'ID_Predmet' v tabulce 'Hrac'." }
    ],
    expectedSql: /INSERT.*INTO.*Inventar.*13/i,
    bgImage: "./images/step14_server.jpg",
    has3D: true,
    modelType: "server", 
    newItem: { icon: "🖥️", name: "Server I" }
  },
  {
    id: 13,
    title: "13. Návrat do budoucnosti",
    story: "Zázrakem se ti podařilo nabootovat systém. Nastal čas opravit tvou poškozenou historii a otevřít portál zpět do civilizace!",
    hint: "-- Přepiš časový údaj u svého prvního a jediného vstupního záznamu (ID 1) na správný rok (2025).",
    schemaImage: "./images/schema_cely.jpg",
    audioFile: "./audio/13.mp3",
    options: [
      { query: "INSERT INTO Dochazka (ID_Dochazka, Rok) VALUES (1, 2025);", isCorrect: false, explanation: "❌ SQL Error: Duplicate entry '1' for key 'PRIMARY'. Tento záznam tam už je, musíš ho updatovat." },
      { query: "UPDATE Dochazka SET Rok = 2025;", isCorrect: false, explanation: "❌ KATASTROFA! Změnil jsi rok ÚPLNĚ VŠEM záznamům v tabulce. Chybí klauzule WHERE.", rowsAffected: 154 },
      { query: "UPDATE Dochazka SET Rok = 2025 WHERE ID_Dochazka = 1;", isCorrect: true, explanation: "✔️ Časová osa opravena. Spouštím portál...", rowsAffected: 1 }
    ],
    expectedSql: /UPDATE.*Dochazka.*SET.*Rok.*2025/i,
    bgImage: "./images/step27_portal.jpg",
    has3D: false
  }
];


export function GameWorld2D() {
  const [stepIndex, setStepIndex] = useState(0);
  const [maxUnlockedStep, setMaxUnlockedStep] = useState(0); 
  const [sqlInput, setSqlInput] = useState('');
  const [inventory, setInventory] = useState([{ icon: "🗒️", name: "Rozbitá docházka" }]);
  
  const [consoleFeedback, setConsoleFeedback] = useState<any>(null);
  
  const [showSchema, setShowSchema] = useState(false);
  const [showOptionsHint, setShowOptionsHint] = useState(false); 
  const [isMuted, setIsMuted] = useState(false);
  const [mistakes, setMistakes] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const typingRef = useRef<any>(null); 

  const currentStep = GAME_STEPS[stepIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (!isMuted && currentStep.audioFile) {
      audioRef.current = new Audio(currentStep.audioFile);
      audioRef.current.volume = 0.8;
      audioRef.current.play().catch(err => console.warn("Autoplay zablokován prohlížečem.", err));
    }
    return () => { if (audioRef.current) audioRef.current.pause(); };
  }, [stepIndex, isMuted, currentStep.audioFile]);

  const handleOptionClick = (optQuery: string) => {
    if (typingRef.current) clearInterval(typingRef.current);
    setSqlInput('');
    let index = 0;
    typingRef.current = setInterval(() => {
      setSqlInput(optQuery.slice(0, index + 1));
      index++;
      if (index >= optQuery.length) clearInterval(typingRef.current);
    }, 25); 
  };

  const handleManualTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (typingRef.current) clearInterval(typingRef.current);
    setSqlInput(e.target.value);
  };

  const handleExecute = () => {
    if (stepIndex < maxUnlockedStep) {
      setConsoleFeedback({ explanation: "⚠️ Tento krok už jsi vyřešil! Pokračuj šipkou vpřed." });
      return;
    }

    const normalizeSql = (sql: string) => sql.replace(/\s+/g, ' ').replace(/;$/, '').trim().toLowerCase();
    const normalizedInput = normalizeSql(sqlInput);

    let matchedOption = currentStep.options?.find(o => normalizeSql(o.query) === normalizedInput);
    let isSuccess = false;
    let feedbackData = null;

    if (!matchedOption && currentStep.expectedSql?.test(sqlInput)) {
       matchedOption = { 
           query: sqlInput, 
           isCorrect: true, 
           explanation: "✔️ Očekávaný dotaz byl úspěšně rozpoznán (Regex shoda).",
           tableData: (currentStep.options?.find(o => o.isCorrect) as any)?.tableData 
       };
    }

    if (matchedOption) {
      isSuccess = matchedOption.isCorrect;
      feedbackData = matchedOption;
    } else {
      setConsoleFeedback({ explanation: "❌ Neplatný příkaz. Zkontroluj syntaxi nebo zkus využít tlačítko 🆘 možností." });
      setMistakes(prev => prev + 1);
      return;
    }

    setConsoleFeedback(feedbackData);

    if (!isSuccess) {
      setMistakes(prev => prev + 1);
      return;
    }
    if (currentStep.newItem) {
      setInventory(prev => {
         if(!prev.some(i => i.name === currentStep.newItem?.name)) return [...prev, currentStep.newItem!];
         return prev;
      });
    }
    if (currentStep.removeItem) {
      setInventory(prev => prev.filter(item => item.name !== currentStep.removeItem));
    }

    setTimeout(() => {
      if (stepIndex < GAME_STEPS.length - 1) {
        const nextStep = stepIndex + 1;
        setStepIndex(nextStep);
        setMaxUnlockedStep(Math.max(maxUnlockedStep, nextStep));
        
        setSqlInput('');
        setConsoleFeedback(null);
        setShowOptionsHint(false); 
        if (typingRef.current) clearInterval(typingRef.current);
      } else {
        setConsoleFeedback({ explanation: "🎉 HRA DOKONČENA! Časoprostor je opraven." });
      }
    }, 3500); 
  };

  const goToPrev = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
      setConsoleFeedback(null);
      setSqlInput('');
      setShowOptionsHint(false);
      if (typingRef.current) clearInterval(typingRef.current);
    }
  };

  const goToNext = () => {
    if (stepIndex < maxUnlockedStep) {
      setStepIndex(stepIndex + 1);
      setConsoleFeedback(null);
      setSqlInput('');
      setShowOptionsHint(false);
      if (typingRef.current) clearInterval(typingRef.current);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#050a0f', color: '#fff', padding: '20px', gap: '20px', boxSizing: 'border-box', overflow: 'hidden' }}>
      
      {showSchema && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
          <h2 style={{ color: '#00ff88', marginBottom: '15px' }}>Odemčená část Schématu</h2>
          <div style={{ width: '60%', height: '50%', border: '2px solid #1a3622', backgroundColor: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', padding: '10px' }}>
             <img src={currentStep.schemaImage} alt="ER Schema Part" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling!.removeAttribute('style'); }} />
             <span style={{ color: '#666', display: 'none' }}>[ Chybí obrázek: {currentStep.schemaImage} ]</span>
          </div>
          <button onClick={() => setShowSchema(false)} style={{ marginTop: '20px', padding: '10px 30px', background: '#e52e71', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Zavřít nápovědu</button>
        </div>
      )}

      <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto', paddingRight: '5px' }}>
        
        <div className="prehistory-panel" style={{ background: '#0a1014', padding: '15px', borderRadius: '12px', border: '1px solid #1a3622', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
             <h2 style={{ fontSize: '1.2rem', color: '#00ff88', margin: 0 }}>{currentStep.title}</h2>
             <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={goToPrev} disabled={stepIndex === 0} style={{ background: '#112215', color: stepIndex === 0 ? '#444' : '#0f0', border: '1px solid #1a3622', borderRadius: '4px', cursor: stepIndex === 0 ? 'not-allowed' : 'pointer', padding: '5px 10px' }}>◀</button>
                <button onClick={goToNext} disabled={stepIndex >= maxUnlockedStep} style={{ background: '#112215', color: stepIndex >= maxUnlockedStep ? '#444' : '#0f0', border: '1px solid #1a3622', borderRadius: '4px', cursor: stepIndex >= maxUnlockedStep ? 'not-allowed' : 'pointer', padding: '5px 10px' }}>▶</button>
             </div>
          </div>
          <p style={{ lineHeight: '1.5', color: '#ccc', margin: 0 }}>{currentStep.story}</p>
        </div>

        <div className="prehistory-panel console" style={{ background: '#0a1014', padding: '15px', borderRadius: '12px', border: '1px solid #1a3622', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '1.1rem', color: '#00ff88', margin: 0 }}>SQL Konzole</h2>
            {currentStep.options && stepIndex === maxUnlockedStep && !showOptionsHint && (
              <button onClick={() => setShowOptionsHint(true)} style={{ background: 'transparent', border: '1px solid #ff8a00', color: '#ff8a00', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>🆘 Zobrazit možnosti</button>
            )}
          </div>
          <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '10px', margin: 0 }}>{currentStep.hint}</p>
          
          {currentStep.options && showOptionsHint && stepIndex === maxUnlockedStep && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '10px' }}>
              {currentStep.options.map((opt, i) => (
                <button key={i} onClick={() => handleOptionClick(opt.query)} style={{ background: '#0d151a', border: '1px solid #1a3622', color: '#bbb', padding: '6px', borderRadius: '4px', textAlign: 'left', fontFamily: 'monospace', fontSize: '0.75rem', cursor: 'pointer' }}>
                  {opt.query}
                </button>
              ))}
            </div>
          )}
          
          <textarea
            value={sqlInput}
            onChange={handleManualTyping}
            disabled={stepIndex < maxUnlockedStep}
            placeholder={stepIndex < maxUnlockedStep ? "Tento krok už je vyřešený." : "-- Napiš SQL dotaz sem..."}
            spellCheck="false"
            style={{ minHeight: '60px', width: '100%', boxSizing: 'border-box', backgroundColor: '#050505', color: '#00ff88', padding: '10px', border: '1px solid #1a3622', borderRadius: '8px', fontFamily: 'monospace', fontSize: '14px', resize: 'none', outline: 'none' }}
          />
          
          <button 
            type="button" 
            onClick={handleExecute} 
            disabled={stepIndex < maxUnlockedStep}
            style={{ marginTop: '10px', padding: '12px', width: '100%', cursor: stepIndex < maxUnlockedStep ? 'not-allowed' : 'pointer', background: stepIndex < maxUnlockedStep ? '#333' : 'linear-gradient(90deg, #ff8a00, #e52e71)', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 'bold', textTransform: 'uppercase', opacity: stepIndex < maxUnlockedStep ? 0.5 : 1 }}
          >
            {stepIndex < maxUnlockedStep ? "VYŘEŠENO" : "Spustit"}
          </button>
          
          {consoleFeedback && (
            <div style={{ 
              marginTop: '10px', 
              background: '#020202', 
              padding: '12px', 
              borderRadius: '6px', 
              border: `1px solid ${consoleFeedback.explanation.includes('❌') ? '#ff4444' : '#00ff88'}`,
              maxHeight: '250px',
              overflowY: 'auto',
              overflowX: 'auto'
            }}>
              <p style={{ color: consoleFeedback.explanation.includes('❌') ? '#ff4444' : '#00ff88', margin: '0 0 10px 0', fontSize: '0.9rem', fontWeight: 'bold' }}>
                {consoleFeedback.explanation}
              </p>
              
              {consoleFeedback.tableData && consoleFeedback.tableData.length > 0 && (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', color: '#ccc', fontFamily: 'monospace' }}>
                  <thead>
                    <tr style={{ background: '#111', borderBottom: '1px solid #333' }}>
                      {Object.keys(consoleFeedback.tableData[0]).map(key => (
                        <th key={key} style={{ padding: '6px', textAlign: 'left', border: '1px solid #222' }}>{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {consoleFeedback.tableData.map((row: any, i: number) => (
                      <tr key={i}>
                        {Object.values(row).map((val: any, j: number) => (
                          <td key={j} style={{ padding: '6px', border: '1px solid #222' }}>{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {consoleFeedback.rowsAffected !== undefined && (
                <p style={{ margin: '10px 0 0 0', fontSize: '0.8rem', color: '#888', fontFamily: 'monospace' }}>
                  Query OK, {consoleFeedback.rowsAffected} row(s) affected.
                </p>
              )}
            </div>
          )}

        </div>

        <div className="prehistory-panel inventory" style={{ background: '#0a1014', padding: '15px', borderRadius: '12px', border: '1px solid #1a3622', flexShrink: 0 }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '10px', color: '#00ff88', marginTop: 0 }}>Inventář</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {inventory.map((item, index) => (
              <li key={index} style={{ padding: '8px 12px', border: '1px solid #1a3622', display: 'flex', gap: '8px', alignItems: 'center', background: '#0d151a', borderRadius: '6px' }}>
                <span style={{ fontSize: '1.2rem' }}>{item.icon}</span> 
                <span style={{ color: '#fff', fontSize: '0.85rem' }}>{item.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div 
        style={{ 
          flex: '1', 
          backgroundImage: `url(${currentStep.bgImage})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          borderRadius: '16px',
          border: '2px solid #1a3622',
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          padding: '20px',
          boxShadow: 'inset 0 0 100px rgba(0,0,0,0.8)'
        }}
      >
        <h1 style={{ position: 'absolute', top: '20px', left: '20px', margin: 0, fontSize: '1.2rem', textShadow: '2px 2px 4px black', zIndex: 5 }}>
          LOKACE: TUL DŽUNGLE | ROK: -6 291 456
        </h1>

        {mistakes > 0 && (
          <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 5, background: 'rgba(255,0,0,0.2)', border: '1px solid #ff4444', padding: '5px 10px', borderRadius: '6px', color: '#ff4444', fontWeight: 'bold', backdropFilter: 'blur(4px)', textShadow: '1px 1px 2px black' }}>
            ❌ Chybných pokusů: {mistakes}
          </div>
        )}
        
        <div style={{ position: 'absolute', top: '55px', left: '20px', display: 'flex', gap: '10px', zIndex: 5 }}>
          <button 
            onClick={() => setShowSchema(true)}
            style={{ background: 'rgba(0, 255, 136, 0.2)', border: '1px solid #00ff88', color: '#00ff88', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', backdropFilter: 'blur(4px)' }}
          >
            🗺️ Zobrazit DB Schéma
          </button>
          
          <button 
            onClick={() => setIsMuted(!isMuted)} 
            style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid #fff', color: '#fff', padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', backdropFilter: 'blur(4px)' }}
          >
            {isMuted ? '🔇 Zvuk VYP' : '🔊 Zvuk ZAP'}
          </button>
        </div>

        {currentStep.has3D && (
          <div style={{ 
            width: '280px', 
            height: '280px', 
            backgroundColor: 'rgba(0, 20, 10, 0.4)', 
            border: '2px dashed #0f0', 
            borderRadius: '12px',
            backdropFilter: 'blur(4px)',
            overflow: 'hidden',
            zIndex: 10
          }}>
            <Canvas shadows camera={{ position: [0, 0, 3], fov: 50 }}>
              <Stage environment="city" intensity={0.5} adjustCamera={true}>
                <DynamicModel type={currentStep.modelType} />
              </Stage>
              <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={2} />
            </Canvas>
          </div>
        )}
      </div>

    </div>
  );
}