"use client";

import { useEffect, useRef } from "react";

export default function Level0Page() {
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    // Styles for printing
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        body * { visibility: hidden; }
        #level0-content, #level0-content * { visibility: visible; }
        #level0-content { position: absolute; left: 0; top: 0; width: 100%; }
        .no-print { display: none !important; }
        .dialog { break-inside: avoid; }
        table { break-inside: auto; }
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Print button */}
        <div className="no-print flex justify-end mb-4">
          <button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition flex items-center gap-2"
          >
            <span>🖨️</span> Տպել / Պահպանել որպես PDF
          </button>
        </div>

        {/* Content */}
        <div
          id="level0-content"
          ref={contentRef}
          className="bg-white p-8 rounded-2xl shadow-xl"
          style={{ fontFamily: "'Segoe UI', 'Arial', sans-serif" }}
        >
          <h1 className="text-3xl font-bold text-red-700 border-b-4 border-red-700 pb-2 mb-6">
            📘 NUR Lingo – Զրոյական Մակարդակ (Level 0)
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            <strong>Բացարձակ սկսնակների համար</strong> – այբուբեն, հիմնական արտահայտություններ, թվեր, ընտանիք, գույներ, բայեր և 10 առաջին դիալոգներ:
          </p>

          {/* ===== ԱՅԲՈՒԲԵՆ ===== */}
          <h2 className="text-2xl font-bold text-blue-800 border-l-4 border-blue-800 pl-4 mt-10 mb-4">
            🔤 1. Հայերենի Այբուբենը
          </h2>
          <table className="w-full border-collapse text-sm mb-6">
            <thead>
              <tr className="bg-blue-800 text-white">
                <th className="p-2 text-left">#</th>
                <th className="p-2 text-left">Տառ</th>
                <th className="p-2 text-left">Անուն</th>
                <th className="p-2 text-left">EN</th>
                <th className="p-2 text-left">RU</th>
                <th className="p-2 text-left">Օրինակ</th>
              </tr>
            </thead>
            <tbody>
              {alphabetData.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="p-2 border">{row.id}</td>
                  <td className="p-2 border">{row.letter}</td>
                  <td className="p-2 border">{row.name}</td>
                  <td className="p-2 border">{row.en}</td>
                  <td className="p-2 border">{row.ru}</td>
                  <td className="p-2 border">{row.example}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ===== ՀԻՄՆԱԿԱՆ ԱՐՏԱՀԱՅՏՈՒԹՅՈՒՆՆԵՐ ===== */}
          <h2 className="text-2xl font-bold text-blue-800 border-l-4 border-blue-800 pl-4 mt-10 mb-4">
            💬 2. Հիմնական Արտահայտություններ
          </h2>
          <table className="w-full border-collapse text-sm mb-6">
            <thead>
              <tr className="bg-blue-800 text-white">
                <th className="p-2 text-left">Հայերեն</th>
                <th className="p-2 text-left">English</th>
                <th className="p-2 text-left">Русский</th>
              </tr>
            </thead>
            <tbody>
              {phrasesData.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="p-2 border">{row.hy}</td>
                  <td className="p-2 border">{row.en}</td>
                  <td className="p-2 border">{row.ru}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ===== ԹՎԵՐ ===== */}
          <h2 className="text-2xl font-bold text-blue-800 border-l-4 border-blue-800 pl-4 mt-10 mb-4">
            🔢 3. Թվեր 1–20
          </h2>
          <table className="w-full border-collapse text-sm mb-6">
            <thead>
              <tr className="bg-blue-800 text-white">
                <th className="p-2 text-left">#</th>
                <th className="p-2 text-left">Հայերեն</th>
                <th className="p-2 text-left">English</th>
                <th className="p-2 text-left">Русский</th>
              </tr>
            </thead>
            <tbody>
              {numbersData.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="p-2 border">{row.id}</td>
                  <td className="p-2 border">{row.hy}</td>
                  <td className="p-2 border">{row.en}</td>
                  <td className="p-2 border">{row.ru}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ===== ԸՆՏԱՆԻՔ ===== */}
          <h2 className="text-2xl font-bold text-blue-800 border-l-4 border-blue-800 pl-4 mt-10 mb-4">
            👨‍👩‍👧‍👦 4. Ընտանիք
          </h2>
          <table className="w-full border-collapse text-sm mb-6">
            <thead>
              <tr className="bg-blue-800 text-white">
                <th className="p-2 text-left">Հայերեն</th>
                <th className="p-2 text-left">English</th>
                <th className="p-2 text-left">Русский</th>
              </tr>
            </thead>
            <tbody>
              {familyData.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="p-2 border">{row.hy}</td>
                  <td className="p-2 border">{row.en}</td>
                  <td className="p-2 border">{row.ru}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="font-semibold mt-2">Օգտակար արտահայտություններ.</p>
          <table className="w-full border-collapse text-sm mb-6">
            <thead>
              <tr className="bg-blue-800 text-white">
                <th className="p-2 text-left">Հայերեն</th>
                <th className="p-2 text-left">English</th>
                <th className="p-2 text-left">Русский</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-gray-50"><td className="p-2 border">Ունե՞ս ընտանիք</td><td className="p-2 border">Do you have a family?</td><td className="p-2 border">У тебя есть семья?</td></tr>
              <tr><td className="p-2 border">Ունեմ մայր, հայր և եղբայր</td><td className="p-2 border">I have a mother, father and a brother</td><td className="p-2 border">У меня есть мама, папа и брат</td></tr>
              <tr className="bg-gray-50"><td className="p-2 border">Իմ մայրը բժշկուհի է</td><td className="p-2 border">My mother is a doctor</td><td className="p-2 border">Моя мама — врач</td></tr>
              <tr><td className="p-2 border">Իմ հայրը ինժեներ է</td><td className="p-2 border">My father is an engineer</td><td className="p-2 border">Мой папа — инженер</td></tr>
            </tbody>
          </table>

          {/* ===== ԳՈՒՅՆԵՐ ===== */}
          <h2 className="text-2xl font-bold text-blue-800 border-l-4 border-blue-800 pl-4 mt-10 mb-4">
            🎨 5. Գույներ
          </h2>
          <table className="w-full border-collapse text-sm mb-6">
            <thead>
              <tr className="bg-blue-800 text-white">
                <th className="p-2 text-left">Հայերեն</th>
                <th className="p-2 text-left">English</th>
                <th className="p-2 text-left">Русский</th>
              </tr>
            </thead>
            <tbody>
              {colorsData.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="p-2 border">{row.hy}</td>
                  <td className="p-2 border">{row.en}</td>
                  <td className="p-2 border">{row.ru}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ===== ԲԱՅԵՐ ===== */}
          <h2 className="text-2xl font-bold text-blue-800 border-l-4 border-blue-800 pl-4 mt-10 mb-4">
            ⚡ 6. Հիմնական Բայեր
          </h2>
          <table className="w-full border-collapse text-sm mb-6">
            <thead>
              <tr className="bg-blue-800 text-white">
                <th className="p-2 text-left">Հայերեն</th>
                <th className="p-2 text-left">English</th>
                <th className="p-2 text-left">Русский</th>
              </tr>
            </thead>
            <tbody>
              {verbsData.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="p-2 border">{row.hy}</td>
                  <td className="p-2 border">{row.en}</td>
                  <td className="p-2 border">{row.ru}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3 className="text-xl font-bold text-blue-700 mt-4">«Լինել» բայի խոնարհումը</h3>
          <table className="w-full border-collapse text-sm mb-6">
            <thead>
              <tr className="bg-blue-800 text-white">
                <th className="p-2 text-left">Դեմք</th>
                <th className="p-2 text-left">Հայերեն</th>
                <th className="p-2 text-left">English</th>
                <th className="p-2 text-left">Русский</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-gray-50"><td className="p-2 border">Ես</td><td className="p-2 border">ես եմ</td><td className="p-2 border">I am</td><td className="p-2 border">я есть</td></tr>
              <tr><td className="p-2 border">Դու</td><td className="p-2 border">դու ես</td><td className="p-2 border">you are</td><td className="p-2 border">ты есть</td></tr>
              <tr className="bg-gray-50"><td className="p-2 border">Նա</td><td className="p-2 border">նա է</td><td className="p-2 border">he/she/it is</td><td className="p-2 border">он/она/оно есть</td></tr>
              <tr><td className="p-2 border">Մենք</td><td className="p-2 border">մենք ենք</td><td className="p-2 border">we are</td><td className="p-2 border">мы есть</td></tr>
              <tr className="bg-gray-50"><td className="p-2 border">Դուք</td><td className="p-2 border">դուք եք</td><td className="p-2 border">you are (pl)</td><td className="p-2 border">вы есть</td></tr>
              <tr><td className="p-2 border">Նրանք</td><td className="p-2 border">նրանք են</td><td className="p-2 border">they are</td><td className="p-2 border">они есть</td></tr>
            </tbody>
          </table>
          <p className="font-semibold">Օրինակներ.</p>
          <table className="w-full border-collapse text-sm mb-6">
            <thead>
              <tr className="bg-blue-800 text-white">
                <th className="p-2 text-left">Հայերեն</th>
                <th className="p-2 text-left">English</th>
                <th className="p-2 text-left">Русский</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-gray-50"><td className="p-2 border">Ես հայ եմ</td><td className="p-2 border">I am Armenian</td><td className="p-2 border">Я армянин</td></tr>
              <tr><td className="p-2 border">Դու ուսանող ես</td><td className="p-2 border">You are a student</td><td className="p-2 border">Ты студент</td></tr>
              <tr className="bg-gray-50"><td className="p-2 border">Նա բժիշկ է</td><td className="p-2 border">He/She is a doctor</td><td className="p-2 border">Он/Она врач</td></tr>
            </tbody>
          </table>

          {/* ===== ԴԻԱԼՈԳՆԵՐ ===== */}
          <h2 className="text-2xl font-bold text-blue-800 border-l-4 border-blue-800 pl-4 mt-10 mb-4">
            💬 7. Առաջին Դիալոգներ
          </h2>
          {dialoguesData.map((dlg, idx) => (
            <div key={idx} className="bg-white border-l-4 border-red-600 p-5 mb-6 rounded-r-lg shadow-sm">
              <div className="flex gap-3 mb-2 text-sm font-semibold">
                <span className="text-red-600">🇦🇲 Հայերեն</span>
                <span className="text-blue-600">🇬🇧 English</span>
                <span className="text-green-700">🇷🇺 Русский</span>
              </div>
              <div dangerouslySetInnerHTML={{ __html: dlg.html }} />
            </div>
          ))}

          {/* ===== ՕԳՏԱԿԱՐ ԲԱՌԵՐ ===== */}
          <h2 className="text-2xl font-bold text-blue-800 border-l-4 border-blue-800 pl-4 mt-10 mb-4">
            📌 8. Օգտակար Բառեր
          </h2>
          <h3 className="text-xl font-semibold text-blue-700 mt-4">Հարցական Բառեր</h3>
          <table className="w-full border-collapse text-sm mb-4">
            <thead><tr className="bg-blue-800 text-white"><th className="p-2 text-left">Հայերեն</th><th className="p-2 text-left">English</th><th className="p-2 text-left">Русский</th></tr></thead>
            <tbody>
              <tr className="bg-gray-50"><td className="p-2 border">ինչ</td><td className="p-2 border">what</td><td className="p-2 border">что</td></tr>
              <tr><td className="p-2 border">ով</td><td className="p-2 border">who</td><td className="p-2 border">кто</td></tr>
              <tr className="bg-gray-50"><td className="p-2 border">որտեղ</td><td className="p-2 border">where</td><td className="p-2 border">где</td></tr>
              <tr><td className="p-2 border">երբ</td><td className="p-2 border">when</td><td className="p-2 border">когда</td></tr>
              <tr className="bg-gray-50"><td className="p-2 border">ինչու</td><td className="p-2 border">why</td><td className="p-2 border">почему</td></tr>
              <tr><td className="p-2 border">ինչպես</td><td className="p-2 border">how</td><td className="p-2 border">как</td></tr>
              <tr className="bg-gray-50"><td className="p-2 border">որ</td><td className="p-2 border">which</td><td className="p-2 border">который</td></tr>
              <tr><td className="p-2 border">քանի</td><td className="p-2 border">how many</td><td className="p-2 border">сколько</td></tr>
            </tbody>
          </table>
          <h3 className="text-xl font-semibold text-blue-700 mt-4">Նախդիրներ</h3>
          <table className="w-full border-collapse text-sm mb-4">
            <thead><tr className="bg-blue-800 text-white"><th className="p-2 text-left">Հայերեն</th><th className="p-2 text-left">English</th><th className="p-2 text-left">Русский</th></tr></thead>
            <tbody>
              <tr className="bg-gray-50"><td className="p-2 border">մեջ</td><td className="p-2 border">in / inside</td><td className="p-2 border">в</td></tr>
              <tr><td className="p-2 border">վրա</td><td className="p-2 border">on</td><td className="p-2 border">на</td></tr>
              <tr className="bg-gray-50"><td className="p-2 border">տակ</td><td className="p-2 border">under</td><td className="p-2 border">под</td></tr>
              <tr><td className="p-2 border">մոտ</td><td className="p-2 border">near</td><td className="p-2 border">около</td></tr>
              <tr className="bg-gray-50"><td className="p-2 border">կողքին</td><td className="p-2 border">next to</td><td className="p-2 border">рядом</td></tr>
              <tr><td className="p-2 border">դիմաց</td><td className="p-2 border">in front of</td><td className="p-2 border">перед</td></tr>
              <tr className="bg-gray-50"><td className="p-2 border">հետևում</td><td className="p-2 border">behind</td><td className="p-2 border">за</td></tr>
              <tr><td className="p-2 border">առանց</td><td className="p-2 border">without</td><td className="p-2 border">без</td></tr>
              <tr className="bg-gray-50"><td className="p-2 border">հետ</td><td className="p-2 border">with</td><td className="p-2 border">с</td></tr>
              <tr><td className="p-2 border">համար</td><td className="p-2 border">for</td><td className="p-2 border">для</td></tr>
            </tbody>
          </table>
          <h3 className="text-xl font-semibold text-blue-700 mt-4">Շաղկապներ</h3>
          <table className="w-full border-collapse text-sm mb-6">
            <thead><tr className="bg-blue-800 text-white"><th className="p-2 text-left">Հայերեն</th><th className="p-2 text-left">English</th><th className="p-2 text-left">Русский</th></tr></thead>
            <tbody>
              <tr className="bg-gray-50"><td className="p-2 border">և</td><td className="p-2 border">and</td><td className="p-2 border">и</td></tr>
              <tr><td className="p-2 border">կամ</td><td className="p-2 border">or</td><td className="p-2 border">или</td></tr>
              <tr className="bg-gray-50"><td className="p-2 border">բայց</td><td className="p-2 border">but</td><td className="p-2 border">но</td></tr>
              <tr><td className="p-2 border">որ</td><td className="p-2 border">that</td><td className="p-2 border">что</td></tr>
              <tr className="bg-gray-50"><td className="p-2 border">որովհետև</td><td className="p-2 border">because</td><td className="p-2 border">потому что</td></tr>
              <tr><td className="p-2 border">եթե</td><td className="p-2 border">if</td><td className="p-2 border">если</td></tr>
              <tr className="bg-gray-50"><td className="p-2 border">երբ</td><td className="p-2 border">when</td><td className="p-2 border">когда</td></tr>
            </tbody>
          </table>

          <div className="text-center text-gray-500 border-t pt-6 mt-8">
            <p className="font-bold text-lg">NUR Lingo – Սովորիր հայերենը հաճույքով 🇦🇲📚</p>
            <p className="text-sm">Այս նյութերը յուրացնելուց հետո անցիր <span className="font-semibold text-blue-700">World 1: First Contact</span> դասերին:</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Data ────────────────────────────────────────────────────────────

const alphabetData = [
  { id: 1, letter: 'Ա ա', name: 'Այբ', en: 'a (father)', ru: 'а', example: 'արև (sun)' },
  { id: 2, letter: 'Բ բ', name: 'Բեն', en: 'b (boy)', ru: 'б', example: 'բարև (hello)' },
  { id: 3, letter: 'Գ գ', name: 'Գիմ', en: 'g (go)', ru: 'г', example: 'գիրք (book)' },
  { id: 4, letter: 'Դ դ', name: 'Դա', en: 'd (dog)', ru: 'д', example: 'դուռ (door)' },
  { id: 5, letter: 'Ե ե', name: 'Եչ', en: 'ye (yes)', ru: 'е', example: 'երկիր (country)' },
  { id: 6, letter: 'Զ զ', name: 'Զա', en: 'z (zoo)', ru: 'з', example: 'զարդ (jewelry)' },
  { id: 7, letter: 'Է է', name: 'Է', en: 'e (egg)', ru: 'э', example: 'էջ (page)' },
  { id: 8, letter: 'Ը ը', name: 'Ըթ', en: 'ə (the)', ru: 'ə', example: 'ընկեր (friend)' },
  { id: 9, letter: 'Թ թ', name: 'Թո', en: 't (tea)', ru: 'т', example: 'թեյ (tea)' },
  { id: 10, letter: 'Ժ ժ', name: 'Ժե', en: 'zh (pleasure)', ru: 'ж', example: 'ժամ (hour)' },
  { id: 11, letter: 'Ի ի', name: 'Ինի', en: 'i (see)', ru: 'и', example: 'իմ (my)' },
  { id: 12, letter: 'Լ լ', name: 'Լյուն', en: 'l (love)', ru: 'л', example: 'լույս (light)' },
  { id: 13, letter: 'Խ խ', name: 'Խե', en: 'kh (loch)', ru: 'х', example: 'խաղ (game)' },
  { id: 14, letter: 'Ծ ծ', name: 'Ծա', en: 'ts (cats)', ru: 'ц', example: 'ծառ (tree)' },
  { id: 15, letter: 'Կ կ', name: 'Կեն', en: 'k (king)', ru: 'к', example: 'կաթ (milk)' },
  { id: 16, letter: 'Հ հ', name: 'Հո', en: 'h (house)', ru: 'h', example: 'հայ (Armenian)' },
  { id: 17, letter: 'Ձ ձ', name: 'Ձա', en: 'dz (adze)', ru: 'дз', example: 'ձուկ (fish)' },
  { id: 18, letter: 'Ղ ղ', name: 'Ղատ', en: 'gh (ghost)', ru: 'гх', example: 'ղեկ (wheel)' },
  { id: 19, letter: 'Ճ ճ', name: 'Ճե', en: 'ch (church)', ru: 'ч', example: 'ճանապարհ (road)' },
  { id: 20, letter: 'Մ մ', name: 'Մեն', en: 'm (man)', ru: 'м', example: 'մայր (mother)' },
  { id: 21, letter: 'Յ յ', name: 'Յի', en: 'y (yes)', ru: 'й', example: 'յոթ (seven)' },
  { id: 22, letter: 'Ն ն', name: 'Նու', en: 'n (no)', ru: 'н', example: 'նարինջ (orange)' },
  { id: 23, letter: 'Շ շ', name: 'Շա', en: 'sh (ship)', ru: 'ш', example: 'շուն (dog)' },
  { id: 24, letter: 'Ո ո', name: 'Ո', en: 'o (or)', ru: 'о', example: 'որդի (son)' },
  { id: 25, letter: 'Չ չ', name: 'Չա', en: 'ch (cheese)', ru: 'ч', example: 'չոր (dry)' },
  { id: 26, letter: 'Պ պ', name: 'Պե', en: 'p (pen)', ru: 'п', example: 'պանիր (cheese)' },
  { id: 27, letter: 'Ջ ջ', name: 'Ջե', en: 'j (job)', ru: 'дж', example: 'ջուր (water)' },
  { id: 28, letter: 'Ռ ռ', name: 'Ռա', en: 'r (rolled)', ru: 'р', example: 'ռուս (Russian)' },
  { id: 29, letter: 'Ս ս', name: 'Սե', en: 's (see)', ru: 'с', example: 'սեր (love)' },
  { id: 30, letter: 'Վ վ', name: 'Վև', en: 'v (van)', ru: 'в', example: 'վարդ (rose)' },
  { id: 31, letter: 'Տ տ', name: 'Տյուն', en: 't (top)', ru: 'т', example: 'տուն (house)' },
  { id: 32, letter: 'Ր ր', name: 'Րե', en: 'r (red)', ru: 'р', example: 'րոպե (minute)' },
  { id: 33, letter: 'Ց ց', name: 'Ցո', en: 'ts (cats)', ru: 'ц', example: 'ցանց (network)' },
  { id: 34, letter: 'Ու ու', name: 'Ու', en: 'u (you)', ru: 'у', example: 'ուս (shoulder)' },
  { id: 35, letter: 'Փ փ', name: 'Փյուր', en: 'p (pot)', ru: 'п', example: 'փող (street)' },
  { id: 36, letter: 'Ք ք', name: 'Քե', en: 'k (king)', ru: 'к', example: 'քույր (sister)' },
  { id: 37, letter: 'Եվ և', name: 'Եվ', en: 'ev (ever)', ru: 'ев', example: 'և (and)' },
  { id: 38, letter: 'Օ օ', name: 'Օ', en: 'o (or)', ru: 'о', example: 'օր (day)' },
  { id: 39, letter: 'Ֆ ֆ', name: 'Ֆե', en: 'f (fish)', ru: 'ф', example: 'ֆիլմ (movie)' },
];

const phrasesData = [
  { hy: 'Բարև', en: 'Hello', ru: 'Привет' },
  { hy: 'Ողջույն', en: 'Hi', ru: 'Здравствуй' },
  { hy: 'Բարի լույս', en: 'Good morning', ru: 'Доброе утро' },
  { hy: 'Բարի օր', en: 'Good day', ru: 'Добрый день' },
  { hy: 'Բարի երեկո', en: 'Good evening', ru: 'Добрый вечер' },
  { hy: 'Բարի գիշեր', en: 'Good night', ru: 'Спокойной ночи' },
  { hy: 'Ցտեսություն', en: 'Goodbye', ru: 'До свидания' },
  { hy: 'Կտեսնվենք', en: 'See you', ru: 'Увидимся' },
  { hy: 'Շնորհակալություն', en: 'Thank you', ru: 'Спасибо' },
  { hy: 'Շատ շնորհակալություն', en: 'Thank you very much', ru: 'Большое спасибо' },
  { hy: 'Խնդրեմ', en: 'Please / You\'re welcome', ru: 'Пожалуйста' },
  { hy: 'Ներեցեք', en: 'Sorry / Excuse me', ru: 'Извините' },
  { hy: 'Այո', en: 'Yes', ru: 'Да' },
  { hy: 'Ոչ', en: 'No', ru: 'Нет' },
  { hy: 'Լավ', en: 'Good / Okay', ru: 'Хорошо' },
  { hy: 'Վատ', en: 'Bad', ru: 'Плохо' },
  { hy: 'Ինչպե՞ս ես', en: 'How are you?', ru: 'Как дела?' },
  { hy: 'Շատ լավ, շնորհակալություն', en: 'Very well, thank you', ru: 'Очень хорошо, спасибо' },
  { hy: 'Ինչպե՞ս է քո անունը', en: 'What is your name?', ru: 'Как тебя зовут?' },
  { hy: 'Իմ անունը … է', en: 'My name is …', ru: 'Меня зовут …' },
  { hy: 'Որտեղի՞ց ես', en: 'Where are you from?', ru: 'Откуда ты?' },
  { hy: 'Ես …-ից եմ', en: 'I am from …', ru: 'Я из …' },
  { hy: 'Քանի՞ տարեկան ես', en: 'How old are you?', ru: 'Сколько тебе лет?' },
  { hy: 'Ես … տարեկան եմ', en: 'I am … years old', ru: 'Мне … лет' },
  { hy: 'Ուրախ եմ ծանոթանալու համար', en: 'Nice to meet you', ru: 'Приятно познакомиться' },
];

const numbersData = [
  { id: 1, hy: 'մեկ', en: 'one', ru: 'один' },
  { id: 2, hy: 'երկու', en: 'two', ru: 'два' },
  { id: 3, hy: 'երեք', en: 'three', ru: 'три' },
  { id: 4, hy: 'չորս', en: 'four', ru: 'четыре' },
  { id: 5, hy: 'հինգ', en: 'five', ru: 'пять' },
  { id: 6, hy: 'վեց', en: 'six', ru: 'шесть' },
  { id: 7, hy: 'յոթ', en: 'seven', ru: 'семь' },
  { id: 8, hy: 'ութ', en: 'eight', ru: 'восемь' },
  { id: 9, hy: 'ինը', en: 'nine', ru: 'девять' },
  { id: 10, hy: 'տասը', en: 'ten', ru: 'десять' },
  { id: 11, hy: 'տասնմեկ', en: 'eleven', ru: 'одиннадцать' },
  { id: 12, hy: 'տասներկու', en: 'twelve', ru: 'двенадцать' },
  { id: 13, hy: 'տասներեք', en: 'thirteen', ru: 'тринадцать' },
  { id: 14, hy: 'տասնչորս', en: 'fourteen', ru: 'четырнадцать' },
  { id: 15, hy: 'տասնհինգ', en: 'fifteen', ru: 'пятнадцать' },
  { id: 16, hy: 'տասնվեց', en: 'sixteen', ru: 'шестнадцать' },
  { id: 17, hy: 'տասնյոթ', en: 'seventeen', ru: 'семнадцать' },
  { id: 18, hy: 'տասնութ', en: 'eighteen', ru: 'восемнадцать' },
  { id: 19, hy: 'տասնինը', en: 'nineteen', ru: 'девятнадцать' },
  { id: 20, hy: 'քսան', en: 'twenty', ru: 'двадцать' },
];

const familyData = [
  { hy: 'ընտանիք', en: 'family', ru: 'семья' },
  { hy: 'մայր', en: 'mother', ru: 'мать' },
  { hy: 'հայր', en: 'father', ru: 'отец' },
  { hy: 'քույր', en: 'sister', ru: 'сестра' },
  { hy: 'եղբայր', en: 'brother', ru: 'брат' },
  { hy: 'տատիկ', en: 'grandmother', ru: 'бабушка' },
  { hy: 'պապիկ', en: 'grandfather', ru: 'дедушка' },
  { hy: 'որդի', en: 'son', ru: 'сын' },
  { hy: 'դուստր', en: 'daughter', ru: 'дочь' },
  { hy: 'ամուսին', en: 'husband', ru: 'муж' },
  { hy: 'կին', en: 'wife', ru: 'жена' },
  { hy: 'երեխա', en: 'child', ru: 'ребёнок' },
];

const colorsData = [
  { hy: 'կարմիր', en: 'red', ru: 'красный' },
  { hy: 'կապույտ', en: 'blue', ru: 'синий' },
  { hy: 'կանաչ', en: 'green', ru: 'зелёный' },
  { hy: 'դեղին', en: 'yellow', ru: 'жёлтый' },
  { hy: 'սև', en: 'black', ru: 'чёрный' },
  { hy: 'սպիտակ', en: 'white', ru: 'белый' },
  { hy: 'նարնջագույն', en: 'orange', ru: 'оранжевый' },
  { hy: 'վարդագույն', en: 'pink', ru: 'розовый' },
  { hy: 'մանուշակագույն', en: 'purple', ru: 'фиолетовый' },
  { hy: 'շագանակագույն', en: 'brown', ru: 'коричневый' },
  { hy: 'մոխրագույն', en: 'grey', ru: 'серый' },
];

const verbsData = [
  { hy: 'լինել', en: 'to be', ru: 'быть' },
  { hy: 'ունենալ', en: 'to have', ru: 'иметь' },
  { hy: 'գնալ', en: 'to go', ru: 'идти' },
  { hy: 'գալ', en: 'to come', ru: 'прийти' },
  { hy: 'ուտել', en: 'to eat', ru: 'есть' },
  { hy: 'խմել', en: 'to drink', ru: 'пить' },
  { hy: 'խոսել', en: 'to speak', ru: 'говорить' },
  { hy: 'հասկանալ', en: 'to understand', ru: 'понимать' },
  { hy: 'սովորել', en: 'to learn', ru: 'учить' },
  { hy: 'աշխատել', en: 'to work', ru: 'работать' },
  { hy: 'սիրել', en: 'to love', ru: 'любить' },
  { hy: 'ապրել', en: 'to live', ru: 'жить' },
];

const dialoguesData = [
  {
    html: `
      <p><strong>Նուրիկ.</strong> Բարև: Ինչպե՞ս ես:<br>
      <strong>Դուք.</strong> Բարև, լավ եմ: Իսկ դու՞:<br>
      <strong>Նուրիկ.</strong> Շատ լավ, շնորհակալություն: Իմ անունը Նուրիկ է: Իսկ քոնը՞:<br>
      <strong>Դուք.</strong> Իմ անունը … է:<br>
      <strong>Նուրիկ.</strong> Ուրախ եմ ծանոթանալու համար:<br>
      <strong>Դուք.</strong> Ես էլ:</p>
      <hr class="my-2">
      <p><strong>Nurik.</strong> Hello! How are you?<br>
      <strong>You.</strong> Hello, I'm fine. And you?<br>
      <strong>Nurik.</strong> Very well, thank you. My name is Nurik. And yours?<br>
      <strong>You.</strong> My name is …<br>
      <strong>Nurik.</strong> Nice to meet you.<br>
      <strong>You.</strong> Me too.</p>
      <hr class="my-2">
      <p><strong>Нурик.</strong> Привет! Как дела?<br>
      <strong>Вы.</strong> Привет, хорошо. А ты?<br>
      <strong>Нурик.</strong> Очень хорошо, спасибо. Меня зовут Нурик. А тебя?<br>
      <strong>Вы.</strong> Меня зовут …<br>
      <strong>Нурик.</strong> Приятно познакомиться.<br>
      <strong>Вы.</strong> Мне тоже.</p>
    `
  },
  {
    html: `
      <p><strong>Նուրիկ.</strong> Որտեղի՞ց ես:<br>
      <strong>Դուք.</strong> Ես Հայաստանից եմ: Իսկ դու՞:<br>
      <strong>Նուրիկ.</strong> Ես Ռուսաստանից եմ: Ապրում եմ Երևանում:<br>
      <strong>Դուք.</strong> Երևանը գեղեցիկ քաղաք է:<br>
      <strong>Նուրիկ.</strong> Այո, շատ գեղեցիկ է:</p>
      <hr>
      <p><strong>Nurik.</strong> Where are you from?<br>
      <strong>You.</strong> I am from Armenia. And you?<br>
      <strong>Nurik.</strong> I am from Russia. I live in Yerevan.<br>
      <strong>You.</strong> Yerevan is a beautiful city.<br>
      <strong>Nurik.</strong> Yes, it is very beautiful.</p>
      <hr>
      <p><strong>Нурик.</strong> Откуда ты?<br>
      <strong>Вы.</strong> Я из Армении. А ты?<br>
      <strong>Нурик.</strong> Я из России. Я живу в Ереване.<br>
      <strong>Вы.</strong> Ереван — красивый город.<br>
      <strong>Нурик.</strong> Да, очень красивый.</p>
    `
  },
  {
    html: `
      <p><strong>Նուրիկ.</strong> Ունե՞ս ընտանիք:<br>
      <strong>Դուք.</strong> Այո, ունեմ: Ես ունեմ մայր, հայր և եղբայր:<br>
      <strong>Նուրիկ.</strong> Ի՞նչ է քո մայրը:<br>
      <strong>Դուք.</strong> Իմ մայրը ուսուցիչ է: Իսկ հայրս բժիշկ է:<br>
      <strong>Նուրիկ.</strong> Շատ հետաքրքիր է:</p>
      <hr>
      <p><strong>Nurik.</strong> Do you have a family?<br>
      <strong>You.</strong> Yes, I do. I have a mother, father, and a brother.<br>
      <strong>Nurik.</strong> What is your mother?<br>
      <strong>You.</strong> My mother is a teacher. And my father is a doctor.<br>
      <strong>Nurik.</strong> Very interesting.</p>
      <hr>
      <p><strong>Нурик.</strong> У тебя есть семья?<br>
      <strong>Вы.</strong> Да. У меня есть мама, папа и брат.<br>
      <strong>Нурик.</strong> Кем работает твоя мама?<br>
      <strong>Вы.</strong> Моя мама — учительница. А папа — врач.<br>
      <strong>Нурик.</strong> Очень интересно.</p>
    `
  },
  {
    html: `
      <p><strong>Նուրիկ.</strong> Քաղցած ե՞ս:<br>
      <strong>Դուք.</strong> Այո, շատ եմ քաղցած:<br>
      <strong>Նուրիկ.</strong> Ի՞նչ ուզում ես ուտել:<br>
      <strong>Դուք.</strong> Ուզում եմ հաց և պանիր:<br>
      <strong>Նուրիկ.</strong> Լավ, գնանք խանութ:<br>
      <strong>Դուք.</strong> Շնորհակալություն:</p>
      <hr>
      <p><strong>Nurik.</strong> Are you hungry?<br>
      <strong>You.</strong> Yes, I am very hungry.<br>
      <strong>Nurik.</strong> What do you want to eat?<br>
      <strong>You.</strong> I want bread and cheese.<br>
      <strong>Nurik.</strong> OK, let's go to the shop.<br>
      <strong>You.</strong> Thank you.</p>
      <hr>
      <p><strong>Нурик.</strong> Ты голоден?<br>
      <strong>Вы.</strong> Да, очень голоден.<br>
      <strong>Нурик.</strong> Что хочешь съесть?<br>
      <strong>Вы.</strong> Хочу хлеб и сыр.<br>
      <strong>Нурик.</strong> Хорошо, пошли в магазин.<br>
      <strong>Вы.</strong> Спасибо.</p>
    `
  },
  {
    html: `
      <p><strong>Նուրիկ.</strong> Որտե՞ղ է խանութը:<br>
      <strong>Դուք.</strong> Այստեղից ձախ:<br>
      <strong>Նուրիկ.</strong> Որքա՞ն արժե այս գիրքը:<br>
      <strong>Վաճառող.</strong> Երկու հազար դրամ:<br>
      <strong>Նուրիկ.</strong> Թանկ է: Զեղչ կա՞:<br>
      <strong>Վաճառող.</strong> Ոչ, զեղչ չկա:</p>
      <hr>
      <p><strong>Nurik.</strong> Where is the shop?<br>
      <strong>You.</strong> To the left from here.<br>
      <strong>Nurik.</strong> How much is this book?<br>
      <strong>Seller.</strong> Two thousand dram.<br>
      <strong>Nurik.</strong> It's expensive. Is there a discount?<br>
      <strong>Seller.</strong> No, there is no discount.</p>
      <hr>
      <p><strong>Нурик.</strong> Где магазин?<br>
      <strong>Вы.</strong> Налево отсюда.<br>
      <strong>Нурик.</strong> Сколько стоит эта книга?<br>
      <strong>Продавец.</strong> Две тысячи драм.<br>
      <strong>Нурик.</strong> Дорого. Есть скидка?<br>
      <strong>Продавец.</strong> Нет, скидки нет.</p>
    `
  },
  {
    html: `
      <p><strong>Նուրիկ.</strong> Ժամը քանի՞սն է:<br>
      <strong>Դուք.</strong> Ժամը տասն է:<br>
      <strong>Նուրիկ.</strong> Շուտով ճաշի ժամն է:<br>
      <strong>Դուք.</strong> Այո, ժամը մեկին ճաշում ենք:<br>
      <strong>Նուրիկ.</strong> Լավ, գնանք:</p>
      <hr>
      <p><strong>Nurik.</strong> What time is it?<br>
      <strong>You.</strong> It is ten o'clock.<br>
      <strong>Nurik.</strong> It's almost lunch time.<br>
      <strong>You.</strong> Yes, we have lunch at one.<br>
      <strong>Nurik.</strong> OK, let's go.</p>
      <hr>
      <p><strong>Нурик.</strong> Который час?<br>
      <strong>Вы.</strong> Десять часов.<br>
      <strong>Нурик.</strong> Скоро время обеда.<br>
      <strong>Вы.</strong> Да, мы обедаем в час.<br>
      <strong>Нурик.</strong> Хорошо, пошли.</p>
    `
  },
  {
    html: `
      <p><strong>Նուրիկ.</strong> Ի՞նչ եղանակ է:<br>
      <strong>Դուք.</strong> Արևոտ է և տաք:<br>
      <strong>Նուրիկ.</strong> Գնանք զբոսնելու:<br>
      <strong>Դուք.</strong> Հիանալի գաղափար է:</p>
      <hr>
      <p><strong>Nurik.</strong> What's the weather like?<br>
      <strong>You.</strong> It's sunny and warm.<br>
      <strong>Nurik.</strong> Let's go for a walk.<br>
      <strong>You.</strong> That's a great idea.</p>
      <hr>
      <p><strong>Нурик.</strong> Какая погода?<br>
      <strong>Вы.</strong> Солнечно и тепло.<br>
      <strong>Нурик.</strong> Пойдём гулять.<br>
      <strong>Вы.</strong> Отличная идея.</p>
    `
  },
  {
    html: `
      <p><strong>Նուրիկ.</strong> Ինչով ես զբաղվում:<br>
      <strong>Դուք.</strong> Ես ծրագրավորող եմ: Իսկ դու՞:<br>
      <strong>Նուրիկ.</strong> Ես ուսուցիչ եմ:<br>
      <strong>Դուք.</strong> Հետաքրքիր աշխատանք է:<br>
      <strong>Նուրիկ.</strong> Շնորհակալություն:</p>
      <hr>
      <p><strong>Nurik.</strong> What do you do?<br>
      <strong>You.</strong> I am a programmer. And you?<br>
      <strong>Nurik.</strong> I am a teacher.<br>
      <strong>You.</strong> That's an interesting job.<br>
      <strong>Nurik.</strong> Thank you.</p>
      <hr>
      <p><strong>Нурик.</strong> Кем ты работаешь?<br>
      <strong>Вы.</strong> Я программист. А ты?<br>
      <strong>Нурик.</strong> Я учитель.<br>
      <strong>Вы.</strong> Интересная работа.<br>
      <strong>Нурик.</strong> Спасибо.</p>
    `
  },
  {
    html: `
      <p><strong>Նուրիկ.</strong> Ի՞նչ ես սիրում անել ազատ ժամանակ:<br>
      <strong>Դուք.</strong> Ես սիրում եմ կարդալ: Իսկ դու՞:<br>
      <strong>Նուրիկ.</strong> Ես սիրում եմ լուսանկարել:<br>
      <strong>Դուք.</strong> Հիանալի է: Ցույց տուր քո լուսանկարները:<br>
      <strong>Նուրիկ.</strong> Լավ, հաճույքով:</p>
      <hr>
      <p><strong>Nurik.</strong> What do you like to do in your free time?<br>
      <strong>You.</strong> I like to read. And you?<br>
      <strong>Nurik.</strong> I like to take photos.<br>
      <strong>You.</strong> That's great. Show me your photos.<br>
      <strong>Nurik.</strong> OK, with pleasure.</p>
      <hr>
      <p><strong>Нурик.</strong> Что ты любишь делать в свободное время?<br>
      <strong>Вы.</strong> Я люблю читать. А ты?<br>
      <strong>Нурик.</strong> Я люблю фотографировать.<br>
      <strong>Вы.</strong> Отлично. Покажи свои фотографии.<br>
      <strong>Нурик.</strong> Хорошо, с удовольствием.</p>
    `
  },
  {
    html: `
      <p><strong>Նուրիկ.</strong> Սիրում ես ճամփորդել:<br>
      <strong>Դուք.</strong> Այո, շատ: Ես եղել եմ Ֆրանսիայում և Իտալիայում:<br>
      <strong>Նուրիկ.</strong> Ես էլ եմ ուզում այցելել Իտալիա:<br>
      <strong>Դուք.</strong> Պետք է գնաս, շատ գեղեցիկ է:<br>
      <strong>Նուրիկ.</strong> Երբ կարող եմ:</p>
      <hr>
      <p><strong>Nurik.</strong> Do you like to travel?<br>
      <strong>You.</strong> Yes, very much. I have been to France and Italy.<br>
      <strong>Nurik.</strong> I also want to visit Italy.<br>
      <strong>You.</strong> You should go, it's very beautiful.<br>
      <strong>Nurik.</strong> When I can.</p>
      <hr>
      <p><strong>Нурик.</strong> Ты любишь путешествовать?<br>
      <strong>Вы.</strong> Да, очень. Я был во Франции и Италии.<br>
      <strong>Нурик.</strong> Я тоже хочу посетить Италию.<br>
      <strong>Вы.</strong> Тебе нужно поехать, там очень красиво.<br>
      <strong>Нурик.</strong> Когда смогу.</p>
    `
  }
];