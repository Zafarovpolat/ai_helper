// База знаний. Аватар отвечает ТОЛЬКО по этим материалам (RAG, без выдумывания).
// Каждая запись: keywords для поиска (латиница + кириллица), вариант ru и uz.
// Источники — атрибуция ответа, выводится на экране.

export const ENTRIES = [
  {
    id: 'temur',
    keywords: ['амир темур', 'темур', 'темир', 'тамерлан', 'амир', 'amir temur', 'temur', 'tamerlan', 'amir'],
    ru: {
      title: 'Амир Темур',
      answer: 'Амир Темур (1336–1405) — великий полководец и государственный деятель, основатель империи Тимуридов. Родился в селении Ходжа-Ильгар близ Кеша (ныне Шахрисабз), столицей своего государства сделал Самарканд.',
      source: 'Экспозиция «Амир Темур и эпоха Тимуридов»'
    },
    uz: {
      title: 'Amir Temur',
      answer: 'Amir Temur (1336–1405) — buyuk sarkarda va davlat arbobi, Temuriylar imperiyasining asoschisi. Kesh (hozirgi Shahrisabz) yaqinidagi Xoja Ilg\'or qishlog\'ida tug\'ilgan, davlati poytaxtini Samarqandga ko\'chirgan.',
      source: '«Amir Temur va Temuriylar davri» ekspozitsiyasi'
    }
  },
  {
    id: 'ulugbek',
    keywords: ['улугбек', 'мирзо улугбек', 'mirzo ulugbek', 'ulugbek', 'обсерватори', 'observatoriy'],
    ru: {
      title: 'Мирзо Улугбек',
      answer: 'Мирзо Улугбек (1394–1449) — внук Амира Темура, выдающийся астроном и математик. В Самарканде построил обсерваторию, где составил звёздный каталог «Зиджи-Гурагани», содержащий координаты более 1000 звёзд.',
      source: 'Экспозиция «Наука эпохи Тимуридов»'
    },
    uz: {
      title: 'Mirzo Ulug\'bek',
      answer: 'Mirzo Ulug\'bek (1394–1449) — Amir Temurning nabirasi, buyuk astronom va matematik. Samarqandda rasadxona qurdirib, 1000 dan ortiq yulduz koordinatalari keltirilgan «Ziji Ko\'ragoniy» yulduzlar jadvalini tuzgan.',
      source: '«Temuriylar davri fani» ekspozitsiyasi'
    }
  },
  {
    id: 'registan',
    keywords: ['регистан', 'регисон', 'registan', 'registon', 'медресе', 'madrasa'],
    ru: {
      title: 'Регистан',
      answer: 'Регистан — парадная площадь и архитектурный ансамбль Самарканда из трёх медресе: Улугбека (XV век), Шердор и Тилля-Кари (XVII век). Символ города и объект Всемирного наследия ЮНЕСКО.',
      source: 'Экспозиция «Архитектура Самарканда»'
    },
    uz: {
      title: 'Registon',
      answer: 'Registon — Samarqandning bosh maydoni va uch madrasadan iborat me\'moriy ansambli: Ulug\'bek (XV asr), Sherdor va Tillakori (XVII asr). Shahar ramzi va YuNESKOning Butunjahon merosi obyekti.',
      source: '«Samarqand me\'morchiligi» ekspozitsiyasi'
    }
  },
  {
    id: 'samarkand',
    keywords: ['самарканд', 'самарқанд', 'samarqand', 'samarkand', 'город самарканд'],
    ru: {
      title: 'Самарканд',
      answer: 'Самарканд — один из древнейших городов мира, ему более 2750 лет. Был столицей империи Амира Темура, крупным центром Великого шёлкового пути. Исторический центр внесён в список ЮНЕСКО.',
      source: 'Экспозиция «Самарканд — перекрёсток культур»'
    },
    uz: {
      title: 'Samarqand',
      answer: 'Samarqand — dunyoning eng qadimiy shaharlaridan biri, yoshi 2750 yildan ortiq. Amir Temur imperiyasining poytaxti, Buyuk Ipak yo\'lining yirik markazi bo\'lgan. Tarixiy markazi YuNESKO ro\'yxatiga kiritilgan.',
      source: '«Samarqand — madaniyatlar chorrahasi» ekspozitsiyasi'
    }
  },
  {
    id: 'bukhara',
    keywords: ['бухара', 'бухоро', 'buxoro', 'bukhara'],
    ru: {
      title: 'Бухара',
      answer: 'Бухаре более 2500 лет. В средние века — крупнейший центр науки и исламской культуры Средней Азии, город медресе и базаров. Исторический центр — объект ЮНЕСКО.',
      source: 'Экспозиция «Благородная Бухара»'
    },
    uz: {
      title: 'Buxoro',
      answer: 'Buxoro shahriga 2500 yildan ortiq. O\'rta asrlarda O\'rta Osiyoning eng yirik ilm va islom madaniyati markazi, madrasa va bozorlar shahri bo\'lgan. Tarixiy markazi YuNESKO obyekti.',
      source: '«Muqaddas Buxoro» ekspozitsiyasi'
    }
  },
  {
    id: 'khiva',
    keywords: ['хива', 'хиво', 'xiva', 'khiva', 'ичан-кала', 'ichan qala', 'ichon qala', 'ичан кала'],
    ru: {
      title: 'Хива',
      answer: 'Хива — город-музей в Хорезме. Его внутренняя крепость Ичан-Кала — целостный средневековый ансамбль из мечетей, медресе, минаретов и дворцов, полностью включённый в список ЮНЕСКО.',
      source: 'Экспозиция «Хива — город под открытым небом»'
    },
    uz: {
      title: 'Xiva',
      answer: 'Xiva — Xorazmdagi muzey-shahar. Uning ichki qal\'asi Ichan Qal\'a — masjid, madrasa, minoralar va saroylardan iborat yaxlit o\'rta asr ansambli bo\'lib, to\'liq YuNESKO ro\'yxatiga kiritilgan.',
      source: '«Xiva — ochiq osmon ostidagi shahar» ekspozitsiyasi'
    }
  },
  {
    id: 'tashkent',
    keywords: ['ташкент', 'тошкент', 'toshkent', 'tashkent', 'столица', 'poytaxt'],
    ru: {
      title: 'Ташкент',
      answer: 'Ташкент — столица и крупнейший город Узбекистана. Один из старейших городов Средней Азии, ему более 2200 лет. Современный политический, экономический и культурный центр страны.',
      source: 'Экспозиция «Современный Узбекистан»'
    },
    uz: {
      title: 'Toshkent',
      answer: 'Toshkent — O\'zbekistonning poytaxti va eng yirik shahri. O\'rta Osiyoning eng qadimiy shaharlaridan biri, yoshi 2200 yildan ortiq. Mamlakatning zamonaviy siyosiy, iqtisodiy va madaniy markazi.',
      source: '«Zamonaviy O\'zbekiston» ekspozitsiyasi'
    }
  },
  {
    id: 'silkroad',
    keywords: ['шёлковый путь', 'шелковый путь', 'великий шелковый', 'ипак йули', 'ipak yoli', 'silk road', 'buyuk ipak'],
    ru: {
      title: 'Великий шёлковый путь',
      answer: 'Великий шёлковый путь — сеть караванных дорог, веками соединявших Китай, Среднюю Азию, Ближний Восток и Европу. Через Узбекистан проходили ключевые маршруты, а Самарканд и Бухара были важнейшими узлами торговли.',
      source: 'Экспозиция «Великий шёлковый путь»'
    },
    uz: {
      title: 'Buyuk Ipak yo\'li',
      answer: 'Buyuk Ipak yo\'li — asrlar davomida Xitoy, O\'rta Osiyo, Yaqin Sharq va Yevropani bog\'lagan karvon yo\'llari tarmog\'i. O\'zbekiston orqali asosiy yo\'nalishlar o\'tgan, Samarqand va Buxoro savdoning muhim markazlari bo\'lgan.',
      source: '«Buyuk Ipak yo\'li» ekspozitsiyasi'
    }
  },
  {
    id: 'navoi',
    keywords: ['навои', 'алишер навои', 'navoiy', 'alisher navoiy', 'поэт', 'shoir'],
    ru: {
      title: 'Алишер Навои',
      answer: 'Алишер Навои (1441–1501) — великий поэт, мыслитель и государственный деятель, основоположник узбекской классической литературы. Его главный труд — «Хамса», пять поэм, написанных на тюркском языке.',
      source: 'Экспозиция «Литература эпохи Тимуридов»'
    },
    uz: {
      title: 'Alisher Navoiy',
      answer: 'Alisher Navoiy (1441–1501) — buyuk shoir, mutafakkir va davlat arbobi, o\'zbek mumtoz adabiyotining asoschisi. Uning asosiy asari — turkiy tilda yozilgan besh dostondan iborat «Xamsa».',
      source: '«Temuriylar davri adabiyoti» ekspozitsiyasi'
    }
  },
  {
    id: 'bibikhanym',
    keywords: ['биби-ханым', 'биби ханым', 'бибихоним', 'bibixonim', 'bibikhanym', 'мечеть'],
    ru: {
      title: 'Биби-Ханым',
      answer: 'Биби-Ханым — соборная мечеть Самарканда, возведённая по приказу Амира Темура в конце XIV века в честь его старшей жены Сарай-мульк-ханым. Одна из крупнейших мечетей средневекового Востока.',
      source: 'Экспозиция «Монументы Самарканда»'
    },
    uz: {
      title: 'Bibi-Xonim',
      answer: 'Bibi-Xonim — Amir Temur buyrug\'i bilan XIV asr oxirida katta xotini Saroymulkxonim sharafiga qurilgan Samarqand jome masjidi. O\'rta asr Sharqining eng yirik masjidlaridan biri.',
      source: '«Samarqand obidalari» ekspozitsiyasi'
    }
  },
  {
    id: 'gureamir',
    keywords: ['гур-эмир', 'гур эмир', 'гури амир', 'gori amir', 'gur emir', 'мавзолей', 'maqbara'],
    ru: {
      title: 'Гур-Эмир',
      answer: 'Гур-Эмир — мавзолей в Самарканде, усыпальница Амира Темура и его потомков-Тимуридов. Построен в начале XV века, знаменит бирюзовым ребристым куполом.',
      source: 'Экспозиция «Монументы Самарканда»'
    },
    uz: {
      title: 'Go\'ri Amir',
      answer: 'Go\'ri Amir — Samarqanddagi maqbara, Amir Temur va uning Temuriy avlodlari dafn etilgan joy. XV asr boshida qurilgan, feruza gumbazi bilan mashhur.',
      source: '«Samarqand obidalari» ekspozitsiyasi'
    }
  },
  {
    id: 'shahizinda',
    keywords: ['шахи-зинда', 'шахи зинда', 'шохи зинда', 'shohi zinda', 'shahizinda', 'некрополь'],
    ru: {
      title: 'Шахи-Зинда',
      answer: 'Шахи-Зинда — ансамбль мавзолеев самаркандской знати, «улица мёртвых». Название означает «Живой царь» и связано с почитанием Кусама ибн Аббаса.',
      source: 'Экспозиция «Некрополь Шахи-Зинда»'
    },
    uz: {
      title: 'Shohi-Zinda',
      answer: 'Shohi-Zinda — Samarqand zodagonlarining maqbaralar ansambli, «tirik shoh» degan ma\'noni anglatadi va Qusam ibn Abbos e\'tiqodi bilan bog\'liq.',
      source: '«Shohi-Zinda nekropoli» ekspozitsiyasi'
    }
  },
  {
    id: 'independence',
    keywords: ['независимость', 'мустакиллик', 'mustaqillik', 'independence', '1991', 'конституция', 'konstitutsiya'],
    ru: {
      title: 'Независимость Узбекистана',
      answer: 'Узбекистан провозгласил независимость 31 августа 1991 года, а 1 сентября отмечается как День независимости. 18 ноября 1991 года был принят государственный флаг страны.',
      source: 'Экспозиция «Новейшая история Узбекистана»'
    },
    uz: {
      title: 'O\'zbekiston mustaqilligi',
      answer: 'O\'zbekiston 1991-yil 31-avgustda mustaqilligini e\'lon qilgan, 1-sentyabr Mustaqillik kuni sifatida nishonlanadi. 1991-yil 18-noyabrda davlat bayrog\'i qabul qilingan.',
      source: '«O\'zbekistonning yangi tarixi» ekspozitsiyasi'
    }
  },
  {
    id: 'khorezmi',
    keywords: ['хорезми', 'аль-хорезми', 'ал-хорезми', 'xorazmiy', 'al xorazmiy', 'алгебр', 'algebra', 'алгоритм', 'algoritm'],
    ru: {
      title: 'Мухаммад аль-Хорезми',
      answer: 'Мухаммад ибн Муса аль-Хорезми (около 783–850) — великий математик, астроном и географ, уроженец Хорезма. От его имени происходят слова «алгебра» и «алгоритм».',
      source: 'Экспозиция «Наука Средневекового Востока»'
    },
    uz: {
      title: 'Muhammad al-Xorazmiy',
      answer: 'Muhammad ibn Muso al-Xorazmiy (taxminan 783–850) — buyuk matematik, astronom va geograf, Xorazmda tug\'ilgan. Uning nomidan «algebra» va «algoritm» so\'zlari kelib chiqqan.',
      source: '«O\'rta asr Sharqi fani» ekspozitsiyasi'
    }
  },
  {
    id: 'bukhari',
    keywords: ['бухари', 'аль-бухари', 'ал-бухари', 'buxoriy', 'imom buxoriy', 'хадис', 'hadis'],
    ru: {
      title: 'Имам аль-Бухари',
      answer: 'Имам аль-Бухари (810–870) — знаменитый собиратель хадисов, автор сборника «Сахих аль-Бухари», одной из самых авторитетных книг исламской традиции. Родился в Бухаре.',
      source: 'Экспозиция «Исламская культура Узбекистана»'
    },
    uz: {
      title: 'Imom al-Buxoriy',
      answer: 'Imom al-Buxoriy (810–870) — mashhur hadis to\'plovchisi, islom an\'anasining eng ishonchli kitoblaridan biri bo\'lgan «Sahihi Buxoriy» asarining muallifi. Buxoroda tug\'ilgan.',
      source: '«O\'zbekiston islom madaniyati» ekspozitsiyasi'
    }
  },
  {
    id: 'timurids',
    keywords: ['тимуриды', 'темуриды', 'temuriylar', 'timuriylar', 'империя', 'imperiya', 'ренессанс', 'renessans'],
    ru: {
      title: 'Империя Тимуридов',
      answer: 'Империя Тимуридов — государство, основанное Амиром Темуром в конце XIV века со столицей в Самарканде. Её расцвет связан с расцветом науки, искусства и архитектуры — «Тимуридским Ренессансом».',
      source: 'Экспозиция «Эпоха Тимуридов»'
    },
    uz: {
      title: 'Temuriylar imperiyasi',
      answer: 'Temuriylar imperiyasi — XIV asr oxirida Amir Temur asos solgan, poytaxti Samarqand bo\'lgan davlat. Uning gullab-yashnashi fan, san\'at va me\'morchilik yuksalishi — «Temuriylar Renessansi» bilan bog\'liq.',
      source: '«Temuriylar davri» ekspozitsiyasi'
    }
  }
]

// Дежурные фразы, когда в базе нет уверенного ответа.
export const FALLBACK = {
  ru: {
    answer: 'Простите, по этому вопросу в моей базе пока нет проверенных материалов. Попробуйте спросить иначе или выберите вопрос из списка.',
    source: null
  },
  uz: {
    answer: 'Kechirasiz, bu savol bo\'yicha bazamda hali tekshirilgan materiallar yo\'q. Boshqacha so\'rab ko\'ring yoki ro\'yxatdan savol tanlang.',
    source: null
  }
}

// Популярные вопросы (кнопки для быстрого старта).
export const POPULAR = {
  ru: [
    'Кто такой Амир Темур?',
    'Расскажи про Регистан',
    'Что такое Великий шёлковый путь?',
    'Когда Узбекистан стал независимым?'
  ],
  uz: [
    'Amir Temur kim?',
    'Registon haqida gapirib bering',
    'Buyuk Ipak yo\'li nima?',
    'O\'zbekiston qachon mustaqil bo\'lgan?'
  ]
}
