"use client";

export default function Level0Page() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 text-black">
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
        <div id="level0-content" className="bg-white p-8 rounded-2xl shadow-xl text-black">
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
                <th className="p-2 text-left border">#</th>
                <th className="p-2 text-left border">Տառ</th>
                <th className="p-2 text-left border">Անուն</th>
                <th className="p-2 text-left border">EN</th>
                <th className="p-2 text-left border">RU</th>
                <th className="p-2 text-left border">Օրինակ</th>
              </tr>
            </thead>
            <tbody>
              {alphabetData.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="p-2 border text-black">{row.id}</td>
                  <td className="p-2 border text-black">{row.letter}</td>
                  <td className="p-2 border text-black">{row.name}</td>
                  <td className="p-2 border text-black">{row.en}</td>
                  <td className="p-2 border text-black">{row.ru}</td>
                  <td className="p-2 border text-black">{row.example}</td>
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
                <th className="p-2 text-left border">Հայերեն</th>
                <th className="p-2 text-left border">English</th>
                <th className="p-2 text-left border">Русский</th>
              </tr>
            </thead>
            <tbody>
              {phrasesData.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="p-2 border text-black">{row.hy}</td>
                  <td className="p-2 border text-black">{row.en}</td>
                  <td className="p-2 border text-black">{row.ru}</td>
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
                <th className="p-2 text-left border">#</th>
                <th className="p-2 text-left border">Հայերեն</th>
                <th className="p-2 text-left border">English</th>
                <th className="p-2 text-left border">Русский</th>
              </tr>
            </thead>
            <tbody>
              {numbersData.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="p-2 border text-black">{row.id}</td>
                  <td className="p-2 border text-black">{row.hy}</td>
                  <td className="p-2 border text-black">{row.en}</td>
                  <td className="p-2 border text-black">{row.ru}</td>
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
                <th className="p-2 text-left border">Հայերեն</th>
                <th className="p-2 text-left border">English</th>
                <th className="p-2 text-left border">Русский</th>
              </tr>
            </thead>
            <tbody>
              {familyData.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="p-2 border text-black">{row.hy}</td>
                  <td className="p-2 border text-black">{row.en}</td>
                  <td className="p-2 border text-black">{row.ru}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="font-semibold text-black mt-2">Օգտակար արտահայտություններ.</p>
          <table className="w-full border-collapse text-sm mb-6">
            <thead>
              <tr className="bg-blue-800 text-white">
                <th className="p-2 text-left border">Հայերեն</th>
                <th className="p-2 text-left border">English</th>
                <th className="p-2 text-left border">Русский</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-gray-50"><td className="p-2 border text-black">Ունե՞ս ընտանիք</td><td className="p-2 border text-black">Do you have a family?</td><td className="p-2 border text-black">У тебя есть семья?</td></tr>
              <tr><td className="p-2 border text-black">Ունեմ մայր, հայր և եղբայր</td><td className="p-2 border text-black">I have a mother, father and a brother</td><td className="p-2 border text-black">У меня есть мама, папа и брат</td></tr>
              <tr className="bg-gray-50"><td className="p-2 border text-black">Իմ մայրը բժշկուհի է</td><td className="p-2 border text-black">My mother is a doctor</td><td className="p-2 border text-black">Моя мама — врач</td></tr>
              <tr><td className="p-2 border text-black">Իմ հայրը ինժեներ է</td><td className="p-2 border text-black">My father is an engineer</td><td className="p-2 border text-black">Мой папа — инженер</td></tr>
            </tbody>
          </table>

          {/* ===== ԳՈՒՅՆԵՐ ===== */}
          <h2 className="text-2xl font-bold text-blue-800 border-l-4 border-blue-800 pl-4 mt-10 mb-4">
            🎨 5. Գույներ
          </h2>
          <table className="w-full border-collapse text-sm mb-6">
            <thead>
              <tr className="bg-blue-800 text-white">
                <th className="p-2 text-left border">Հայերեն</th>
                <th className="p-2 text-left border">English</th>
                <th className="p-2 text-left border">Русский</th>
              </tr>
            </thead>
            <tbody>
              {colorsData.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="p-2 border text-black">{row.hy}</td>
                  <td className="p-2 border text-black">{row.en}</td>
                  <td className="p-2 border text-black">{row.ru}</td>
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
                <th className="p-2 text-left border">Հայերեն</th>
                <th className="p-2 text-left border">English</th>
                <th className="p-2 text-left border">Русский</th>
              </tr>
            </thead>
            <tbody>
              {verbsData.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="p-2 border text-black">{row.hy}</td>
                  <td className="p-2 border text-black">{row.en}</td>
                  <td className="p-2 border text-black">{row.ru}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3 className="text-xl font-bold text-blue-700 mt-4">«Լինել» բայի խոնարհումը</h3>
          <table className="w-full border-collapse text-sm mb-6">
            <thead>
              <tr className="bg-blue-800 text-white">
                <th className="p-2 text-left border">Դեմք</th>
                <th className="p-2 text-left border">Հայերեն</th>
                <th className="p-2 text-left border">English</th>
                <th className="p-2 text-left border">Русский</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-gray-50"><td className="p-2 border text-black">Ես</td><td className="p-2 border text-black">ես եմ</td><td className="p-2 border text-black">I am</td><td className="p-2 border text-black">я есть</td></tr>
              <tr><td className="p-2 border text-black">Դու</td><td className="p-2 border text-black">դու ես</td><td className="p-2 border text-black">you are</td><td className="p-2 border text-black">ты есть</td></tr>
              <tr className="bg-gray-50"><td className="p-2 border text-black">Նա</td><td className="p-2 border text-black">նա է</td><td className="p-2 border text-black">he/she/it is</td><td className="p-2 border text-black">он/она/оно есть</td></tr>
              <tr><td className="p-2 border text-black">Մենք</td><td className="p-2 border text-black">մենք ենք</td><td className="p-2 border text-black">we are</td><td className="p-2 border text-black">мы есть</td></tr>
              <tr className="bg-gray-50"><td className="p-2 border text-black">Դուք</td><td className="p-2 border text-black">դուք եք</td><td className="p-2 border text-black">you are (pl)</td><td className="p-2 border text-black">вы есть</td></tr>
              <tr><td className="p-2 border text-black">Նրանք</td><td className="p-2 border text-black">նրանք են</td><td className="p-2 border text-black">they are</td><td className="p-2 border text-black">они есть</td></tr>
            </tbody>
          </table>
          <p className="font-semibold text-black">Օրինակներ.</p>
          <table className="w-full border-collapse text-sm mb-6">
            <thead>
              <tr className="bg-blue-800 text-white">
                <th className="p-2 text-left border">Հայերեն</th>
                <th className="p-2 text-left border">English</th>
                <th className="p-2 text-left border">Русский</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-gray-50"><td className="p-2 border text-black">Ես հայ եմ</td><td className="p-2 border text-black">I am Armenian</td><td className="p-2 border text-black">Я армянин</td></tr>
              <tr><td className="p-2 border text-black">Դու ուսանող ես</td><td className="p-2 border text-black">You are a student</td><td className="p-2 border text-black">Ты студент</td></tr>
              <tr className="bg-gray-50"><td className="p-2 border text-black">Նա բժիշկ է</td><td className="p-2 border text-black">He/She is a doctor</td><td className="p-2 border text-black">Он/Она врач</td></tr>
            </tbody>
          </table>

          {/* ===== ԴԻԱԼՈԳՆԵՐ ===== */}
          <h2 className="text-2xl font-bold text-blue-800 border-l-4 border-blue-800 pl-4 mt-10 mb-4">
            💬 7. Առաջին Դիալոգներ
          </h2>
          {dialoguesData.map((dlg, idx) => (
            <div key={idx} className="bg-white border-l-4 border-red-600 p-5 mb-6 rounded-r-lg shadow-sm text-black">
              <div className="flex gap-3 mb-2 text-sm font-semibold">
                <span className="text-red-600">🇦🇲 Հայերեն</span>
                <span className="text-blue-600">🇬🇧 English</span>
                <span className="text-green-700">🇷🇺 Русский</span>
              </div>
              {dlg.lines.map((line, li) => (
                <p key={li} className="text-black">{line}</p>
              ))}
            </div>
          ))}

          {/* ===== ՕԳՏԱԿԱՐ ԲԱՌԵՐ ===== */}
          <h2 className="text-2xl font-bold text-blue-800 border-l-4 border-blue-800 pl-4 mt-10 mb-4">
            📌 8. Օգտակար Բառեր
          </h2>
          <h3 className="text-xl font-semibold text-blue-700 mt-4">Հարցական Բառեր</h3>
          <table className="w-full border-collapse text-sm mb-4">
            <thead><tr className="bg-blue-800 text-white"><th className="p-2 text-left border">Հայերեն</th><th className="p-2 text-left border">English</th><th className="p-2 text-left border">Русский</th></tr></thead>
            <tbody>
              <tr className="bg-gray-50"><td className="p-2 border text-black">ինչ</td><td className="p-2 border text-black">what</td><td className="p-2 border text-black">что</td></tr>
              <tr><td className="p-2 border text-black">ով</td><td className="p-2 border text-black">who</td><td className="p-2 border text-black">кто</td></tr>
              <tr className="bg-gray-50"><td className="p-2 border text-black">որտեղ</td><td className="p-2 border text-black">where</td><td className="p-2 border text-black">где</td></tr>
              <tr><td className="p-2 border text-black">երբ</td><td className="p-2 border text-black">when</td><td className="p-2 border text-black">когда</td></tr>
              <tr className="bg-gray-50"><td className="p-2 border text-black">ինչու</td><td className="p-2 border text-black">why</td><td className="p-2 border text-black">почему</td></tr>
              <tr><td className="p-2 border text-black">ինչպես</td><td className="p-2 border text-black">how</td><td className="p-2 border text-black">как</td></tr>
              <tr className="bg-gray-50"><td className="p-2 border text-black">որ</td><td className="p-2 border text-black">which</td><td className="p-2 border text-black">который</td></tr>
              <tr><td className="p-2 border text-black">քանի</td><td className="p-2 border text-black">how many</td><td className="p-2 border text-black">сколько</td></tr>
            </tbody>
          </table>
          <h3 className="text-xl font-semibold text-blue-700 mt-4">Նախդիրներ</h3>
          <table className="w-full border-collapse text-sm mb-4">
            <thead><tr className="bg-blue-800 text-white"><th className="p-2 text-left border">Հայերեն</th><th className="p-2 text-left border">English</th><th className="p-2 text-left border">Русский</th></tr></thead>
            <tbody>
              <tr className="bg-gray-50"><td className="p-2 border text-black">մեջ</td><td className="p-2 border text-black">in / inside</td><td className="p-2 border text-black">в</td></tr>
              <tr><td className="p-2 border text-black">վրա</td><td className="p-2 border text-black">on</td><td className="p-2 border text-black">на</td></tr>
              <tr className="bg-gray-50"><td className="p-2 border text-black">տակ</td><td className="p-2 border text-black">under</td><td className="p-2 border text-black">под</td></tr>
              <tr><td className="p-2 border text-black">մոտ</td><td className="p-2 border text-black">near</td><td className="p-2 border text-black">около</td></tr>
              <tr className="bg-gray-50"><td className="p-2 border text-black">կողքին</td><td className="p-2 border text-black">next to</td><td className="p-2 border text-black">рядом</td></tr>
              <tr><td className="p-2 border text-black">դիմաց</td><td className="p-2 border text-black">in front of</td><td className="p-2 border text-black">перед</td></tr>
              <tr className="bg-gray-50"><td className="p-2 border text-black">հետևում</td><td className="p-2 border text-black">behind</td><td className="p-2 border text-black">за</td></tr>
              <tr><td className="p-2 border text-black">առանց</td><td className="p-2 border text-black">without</td><td className="p-2 border text-black">без</td></tr>
              <tr className="bg-gray-50"><td className="p-2 border text-black">հետ</td><td className="p-2 border text-black">with</td><td className="p-2 border text-black">с</td></tr>
              <tr><td className="p-2 border text-black">համար</td><td className="p-2 border text-black">for</td><td className="p-2 border text-black">для</td></tr>
            </tbody>
          </table>
          <h3 className="text-xl font-semibold text-blue-700 mt-4">Շաղկապներ</h3>
          <table className="w-full border-collapse text-sm mb-6">
            <thead><tr className="bg-blue-800 text-white"><th className="p-2 text-left border">Հայերեն</th><th className="p-2 text-left border">English</th><th className="p-2 text-left border">Русский</th></tr></thead>
            <tbody>
              <tr className="bg-gray-50"><td className="p-2 border text-black">և</td><td className="p-2 border text-black">and</td><td className="p-2 border text-black">и</td></tr>
              <tr><td className="p-2 border text-black">կամ</td><td className="p-2 border text-black">or</td><td className="p-2 border text-black">или</td></tr>
              <tr className="bg-gray-50"><td className="p-2 border text-black">բայց</td><td className="p-2 border text-black">but</td><td className="p-2 border text-black">но</td></tr>
              <tr><td className="p-2 border text-black">որ</td><td className="p-2 border text-black">that</td><td className="p-2 border text-black">что</td></tr>
              <tr className="bg-gray-50"><td className="p-2 border text-black">որովհետև</td><td className="p-2 border text-black">because</td><td className="p-2 border text-black">потому что</td></tr>
              <tr><td className="p-2 border text-black">եթե</td><td className="p-2 border text-black">if</td><td className="p-2 border text-black">если</td></tr>
              <tr className="bg-gray-50"><td className="p-2 border text-black">երբ</td><td className="p-2 border text-black">when</td><td className="p-2 border text-black">когда</td></tr>
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
    lines: [
      '🇦🇲 Նուրիկ. Բարև: Ինչպե՞ս ես:',
      '🇦🇲 Դուք. Բարև, լավ եմ: Իսկ դու՞:',
      '🇦🇲 Նուրիկ. Շատ լավ, շնորհակալություն: Իմ անունը Նուրիկ է: Իսկ քոնը՞:',
      '🇦🇲 Դուք. Իմ անունը … է:',
      '🇦🇲 Նուրիկ. Ուրախ եմ ծանոթանալու համար:',
      '🇦🇲 Դուք. Ես էլ:',
      '',
      '🇬🇧 Nurik. Hello! How are you?',
      '🇬🇧 You. Hello, I\'m fine. And you?',
      '🇬🇧 Nurik. Very well, thank you. My name is Nurik. And yours?',
      '🇬🇧 You. My name is …',
      '🇬🇧 Nurik. Nice to meet you.',
      '🇬🇧 You. Me too.',
      '',
      '🇷🇺 Нурик. Привет! Как дела?',
      '🇷🇺 Вы. Привет, хорошо. А ты?',
      '🇷🇺 Нурик. Очень хорошо, спасибо. Меня зовут Нурик. А тебя?',
      '🇷🇺 Вы. Меня зовут …',
      '🇷🇺 Нурик. Приятно познакомиться.',
      '🇷🇺 Вы. Мне тоже.',
    ]
  },
  {
    lines: [
      '🇦🇲 Նուրիկ. Որտեղի՞ց ես:',
      '🇦🇲 Դուք. Ես Հայաստանից եմ: Իսկ դու՞:',
      '🇦🇲 Նուրիկ. Ես Ռուսաստանից եմ: Ապրում եմ Երևանում:',
      '🇦🇲 Դուք. Երևանը գեղեցիկ քաղաք է:',
      '🇦🇲 Նուրիկ. Այո, շատ գեղեցիկ է:',
      '',
      '🇬🇧 Nurik. Where are you from?',
      '🇬🇧 You. I am from Armenia. And you?',
      '🇬🇧 Nurik. I am from Russia. I live in Yerevan.',
      '🇬🇧 You. Yerevan is a beautiful city.',
      '🇬🇧 Nurik. Yes, it is very beautiful.',
      '',
      '🇷🇺 Нурик. Откуда ты?',
      '🇷🇺 Вы. Я из Армении. А ты?',
      '🇷🇺 Нурик. Я из России. Я живу в Ереване.',
      '🇷🇺 Вы. Ереван — красивый город.',
      '🇷🇺 Нурик. Да, очень красивый.',
    ]
  },
  {
    lines: [
      '🇦🇲 Նուրիկ. Ունե՞ս ընտանիք:',
      '🇦🇲 Դուք. Այո, ունեմ: Ես ունեմ մայր, հայր և եղբայր:',
      '🇦🇲 Նուրիկ. Ի՞նչ է քո մայրը:',
      '🇦🇲 Դուք. Իմ մայրը ուսուցիչ է: Իսկ հայրս բժիշկ է:',
      '🇦🇲 Նուրիկ. Շատ հետաքրքիր է:',
      '',
      '🇬🇧 Nurik. Do you have a family?',
      '🇬🇧 You. Yes, I do. I have a mother, father, and a brother.',
      '🇬🇧 Nurik. What is your mother?',
      '🇬🇧 You. My mother is a teacher. And my father is a doctor.',
      '🇬🇧 Nurik. Very interesting.',
      '',
      '🇷🇺 Нурик. У тебя есть семья?',
      '🇷🇺 Вы. Да. У меня есть мама, папа и брат.',
      '🇷🇺 Нурик. Кем работает твоя мама?',
      '🇷🇺 Вы. Моя мама — учительница. А папа — врач.',
      '🇷🇺 Нурик. Очень интересно.',
    ]
  },
  {
    lines: [
      '🇦🇲 Նուրիկ. Քաղցած ե՞ս:',
      '🇦🇲 Դուք. Այո, շատ եմ քաղցած:',
      '🇦🇲 Նուրիկ. Ի՞նչ ուզում ես ուտել:',
      '🇦🇲 Դուք. Ուզում եմ հաց և պանիր:',
      '🇦🇲 Նուրիկ. Լավ, գնանք խանութ:',
      '🇦🇲 Դուք. Շնորհակալություն:',
      '',
      '🇬🇧 Nurik. Are you hungry?',
      '🇬🇧 You. Yes, I am very hungry.',
      '🇬🇧 Nurik. What do you want to eat?',
      '🇬🇧 You. I want bread and cheese.',
      '🇬🇧 Nurik. OK, let\'s go to the shop.',
      '🇬🇧 You. Thank you.',
      '',
      '🇷🇺 Нурик. Ты голоден?',
      '🇷🇺 Вы. Да, очень голоден.',
      '🇷🇺 Нурик. Что хочешь съесть?',
      '🇷🇺 Вы. Хочу хлеб и сыр.',
      '🇷🇺 Нурик. Хорошо, пошли в магазин.',
      '🇷🇺 Вы. Спасибо.',
    ]
  },
  {
    lines: [
      '🇦🇲 Նուրիկ. Որտե՞ղ է խանութը:',
      '🇦🇲 Դուք. Այստեղից ձախ:',
      '🇦🇲 Նուրիկ. Որքա՞ն արժե այս գիրքը:',
      '🇦🇲 Վաճառող. Երկու հազար դրամ:',
      '🇦🇲 Նուրիկ. Թանկ է: Զեղչ կա՞:',
      '🇦🇲 Վաճառող. Ոչ, զեղչ չկա:',
      '',
      '🇬🇧 Nurik. Where is the shop?',
      '🇬🇧 You. To the left from here.',
      '🇬🇧 Nurik. How much is this book?',
      '🇬🇧 Seller. Two thousand dram.',
      '🇬🇧 Nurik. It\'s expensive. Is there a discount?',
      '🇬🇧 Seller. No, there is no discount.',
      '',
      '🇷🇺 Нурик. Где магазин?',
      '🇷🇺 Вы. Налево отсюда.',
      '🇷🇺 Нурик. Сколько стоит эта книга?',
      '🇷🇺 Продавец. Две тысячи драм.',
      '🇷🇺 Нурик. Дорого. Есть скидка?',
      '🇷🇺 Продавец. Нет, скидки нет.',
    ]
  },
  {
    lines: [
      '🇦🇲 Նուրիկ. Ժամը քանի՞սն է:',
      '🇦🇲 Դուք. Ժամը տասն է:',
      '🇦🇲 Նուրիկ. Շուտով ճաշի ժամն է:',
      '🇦🇲 Դուք. Այո, ժամը մեկին ճաշում ենք:',
      '🇦🇲 Նուրիկ. Լավ, գնանք:',
      '',
      '🇬🇧 Nurik. What time is it?',
      '🇬🇧 You. It is ten o\'clock.',
      '🇬🇧 Nurik. It\'s almost lunch time.',
      '🇬🇧 You. Yes, we have lunch at one.',
      '🇬🇧 Nurik. OK, let\'s go.',
      '',
      '🇷🇺 Нурик. Который час?',
      '🇷🇺 Вы. Десять часов.',
      '🇷🇺 Нурик. Скоро время обеда.',
      '🇷🇺 Вы. Да, мы обедаем в час.',
      '🇷🇺 Нурик. Хорошо, пошли.',
    ]
  },
  {
    lines: [
      '🇦🇲 Նուրիկ. Ի՞նչ եղանակ է:',
      '🇦🇲 Դուք. Արևոտ է և տաք:',
      '🇦🇲 Նուրիկ. Գնանք զբոսնելու:',
      '🇦🇲 Դուք. Հիանալի գաղափար է:',
      '',
      '🇬🇧 Nurik. What\'s the weather like?',
      '🇬🇧 You. It\'s sunny and warm.',
      '🇬🇧 Nurik. Let\'s go for a walk.',
      '🇬🇧 You. That\'s a great idea.',
      '',
      '🇷🇺 Нурик. Какая погода?',
      '🇷🇺 Вы. Солнечно и тепло.',
      '🇷🇺 Нурик. Пойдём гулять.',
      '🇷🇺 Вы. Отличная идея.',
    ]
  },
  {
    lines: [
      '🇦🇲 Նուրիկ. Ինչով ես զբաղվում:',
      '🇦🇲 Դուք. Ես ծրագրավորող եմ: Իսկ դու՞:',
      '🇦🇲 Նուրիկ. Ես ուսուցիչ եմ:',
      '🇦🇲 Դուք. Հետաքրքիր աշխատանք է:',
      '🇦🇲 Նուրիկ. Շնորհակալություն:',
      '',
      '🇬🇧 Nurik. What do you do?',
      '🇬🇧 You. I am a programmer. And you?',
      '🇬🇧 Nurik. I am a teacher.',
      '🇬🇧 You. That\'s an interesting job.',
      '🇬🇧 Nurik. Thank you.',
      '',
      '🇷🇺 Нурик. Кем ты работаешь?',
      '🇷🇺 Вы. Я программист. А ты?',
      '🇷🇺 Нурик. Я учитель.',
      '🇷🇺 Вы. Интересная работа.',
      '🇷🇺 Нурик. Спасибо.',
    ]
  },
  {
    lines: [
      '🇦🇲 Նուրիկ. Ի՞նչ ես սիրում անել ազատ ժամանակ:',
      '🇦🇲 Դուք. Ես սիրում եմ կարդալ: Իսկ դու՞:',
      '🇦🇲 Նուրիկ. Ես սիրում եմ լուսանկարել:',
      '🇦🇲 Դուք. Հիանալի է: Ցույց տուր քո լուսանկարները:',
      '🇦🇲 Նուրիկ. Լավ, հաճույքով:',
      '',
      '🇬🇧 Nurik. What do you like to do in your free time?',
      '🇬🇧 You. I like to read. And you?',
      '🇬🇧 Nurik. I like to take photos.',
      '🇬🇧 You. That\'s great. Show me your photos.',
      '🇬🇧 Nurik. OK, with pleasure.',
      '',
      '🇷🇺 Нурик. Что ты любишь делать в свободное время?',
      '🇷🇺 Вы. Я люблю читать. А ты?',
      '🇷🇺 Нурик. Я люблю фотографировать.',
      '🇷🇺 Вы. Отлично. Покажи свои фотографии.',
      '🇷🇺 Нурик. Хорошо, с удовольствием.',
    ]
  },
  {
    lines: [
      '🇦🇲 Նուրիկ. Սիրում ես ճամփորդել:',
      '🇦🇲 Դուք. Այո, շատ: Ես եղել եմ Ֆրանսիայում և Իտալիայում:',
      '🇦🇲 Նուրիկ. Ես էլ եմ ուզում այցելել Իտալիա:',
      '🇦🇲 Դուք. Պետք է գնաս, շատ գեղեցիկ է:',
      '🇦🇲 Նուրիկ. Երբ կարող եմ:',
      '',
      '🇬🇧 Nurik. Do you like to travel?',
      '🇬🇧 You. Yes, very much. I have been to France and Italy.',
      '🇬🇧 Nurik. I also want to visit Italy.',
      '🇬🇧 You. You should go, it\'s very beautiful.',
      '🇬🇧 Nurik. When I can.',
      '',
      '🇷🇺 Нурик. Ты любишь путешествовать?',
      '🇷🇺 Вы. Да, очень. Я был во Франции и Италии.',
      '🇷🇺 Нурик. Я тоже хочу посетить Италию.',
      '🇷🇺 Вы. Тебе нужно поехать, там очень красиво.',
      '🇷🇺 Нурик. Когда смогу.',
    ]
  }
];