export const APP_VERSION = "2.0.0";

export const changelogData = [
  {
    version: "2.0.0",
    date: {
      id: "5 Mei 2026",
      en: "May 5, 2026",
      jp: "2026年5月5日",
    },
    title: {
      id: "Dark Premium UI Overhaul",
      en: "Dark Premium UI Overhaul",
      jp: "ダークプレミアムUIオーバーホール",
    },
    highlight: true,
    description: {
      id: "Pembaruan terbesar sejak Grand Launch. Seluruh antarmuka aplikasi kini hadir dalam tema gelap premium dengan palet warna CSS variables yang konsisten, glassmorphism, glow effects, dan tipografi font-black di setiap sudut. Rasakan QuizApp yang benar-benar baru.",
      en: "The biggest update since Grand Launch. The entire app interface now comes in a premium dark theme with consistent CSS variable color palette, glassmorphism, glow effects, and font-black typography throughout. Experience a whole new QuizApp.",
      jp: "グランドローンチ以来最大のアップデート。アプリ全体のインターフェイスが、一貫したCSS変数カラーパレット、グラスモーフィズム、グロー効果、そしてfont-blackタイポグラフィを備えたプレミアムダークテーマに生まれ変わりました。",
    },
    changes: [
      {
        type: "new",
        text: {
          id: "Tema Gelap Premium: Seluruh halaman — Dashboard, History, ReviewPage, Shop, Inventory, About, WhatsNew, Friends, Notifications — kini menggunakan sistem warna gelap berbasis CSS variables (--color-surface-* dan --color-brand-*) yang konsisten dan elegan.",
          en: "Premium Dark Theme: Every page — Dashboard, History, ReviewPage, Shop, Inventory, About, WhatsNew, Friends, Notifications — now uses a consistent, elegant dark color system based on CSS variables (--color-surface-* and --color-brand-*).",
          jp: "プレミアムダークテーマ：ダッシュボード、履歴、レビューページ、ショップ、インベントリ、概要、新機能、フレンド、通知など、すべてのページが一貫したエレガントなCSSカスタムプロパティに基づくダークカラーシステムを採用しました。",
        },
      },
      {
        type: "new",
        text: {
          id: "Banner Header Immersif: Setiap halaman utama kini memiliki banner gelap premium dengan efek glow blob, dot grid overlay, dan ikon dekoratif semi-transparan.",
          en: "Immersive Header Banners: Every main page now features a premium dark banner with glow blob effects, dot grid overlay, and semi-transparent decorative icons.",
          jp: "没入型ヘッダーバナー：メインページごとにグローブロブ効果、ドットグリッドオーバーレイ、半透明の装飾アイコンを備えたプレミアムダークバナーが追加されました。",
        },
      },
      {
        type: "new",
        text: {
          id: "Glassmorphism Komponen: Header sticky, modal, chip statistik, dan kartu profil kini menggunakan efek glassmorphism dark dengan backdrop-blur dan border semi-transparan.",
          en: "Glassmorphism Components: Sticky headers, modals, stat chips, and profile cards now use dark glassmorphism effects with backdrop-blur and semi-transparent borders.",
          jp: "グラスモーフィズムコンポーネント：スティッキーヘッダー、モーダル、統計チップ、プロフィールカードが半透明ボーダーとバックドロップブラーを持つダークグラスモーフィズムエフェクトに変更されました。",
        },
      },
      {
        type: "improvement",
        text: {
          id: "Kartu Quiz & Riwayat Kontekstual: Kartu soal, kartu riwayat, dan lencana kini berwarna sesuai konteks — hijau untuk benar, merah untuk salah, oranye untuk duel, ungu untuk survival — semuanya dalam palet gelap yang konsisten.",
          en: "Contextual Quiz & History Cards: Question cards, history cards, and badges are now colored by context — green for correct, red for wrong, orange for duel, purple for survival — all in a consistent dark palette.",
          jp: "コンテキスト別クイズ・履歴カード：問題カード、履歴カード、バッジがコンテキストに応じて色分け — 正解は緑、不正解は赤、デュエルはオレンジ、サバイバルは紫 — すべて一貫したダークパレットで統一されました。",
        },
      },
      {
        type: "improvement",
        text: {
          id: "Tipografi & Hirarki Visual: Seluruh judul dan label penting kini menggunakan font-black untuk hierarki yang lebih tegas dan mudah dibaca di atas latar gelap.",
          en: "Typography & Visual Hierarchy: All titles and important labels now use font-black for bolder hierarchy that's easier to read on dark backgrounds.",
          jp: "タイポグラフィ＆ビジュアル階層：すべてのタイトルと重要なラベルがfont-blackを使用し、ダーク背景での読みやすさが大幅に向上しました。",
        },
      },
      {
        type: "improvement",
        text: {
          id: "Animasi & Transisi Halus: Kartu dan elemen halaman kini hadir dengan stagger animation (motion.div) dan hover transition yang lebih responsif dan natural.",
          en: "Smooth Animations & Transitions: Cards and page elements now feature stagger animations (motion.div) and more responsive, natural hover transitions.",
          jp: "スムーズなアニメーションとトランジション：カードとページ要素にスタガーアニメーション（motion.div）とより自然なホバートランジションが追加されました。",
        },
      },
      {
        type: "improvement",
        text: {
          id: "Refactor Logika Warna: Setiap halaman kini menggunakan objek konfigurasi terpusat (TYPE, QUIZ_TYPE, qCardColor, dst.) sehingga tidak ada lagi ternary panjang berulang di JSX.",
          en: "Color Logic Refactor: Each page now uses centralized config objects (TYPE, QUIZ_TYPE, qCardColor, etc.) eliminating long repetitive ternaries in JSX.",
          jp: "カラーロジックのリファクタリング：各ページが一元化された設定オブジェクト（TYPE、QUIZ_TYPE、qCardColorなど）を使用し、JSX内の長い繰り返し三項演算子を排除しました。",
        },
      },
      {
        type: "improvement",
        text: {
          id: "AI Assessment Dark: Kotak penilaian AI di ReviewPage kini hadir dalam varian gelap tinted — oranye-emas untuk jawaban memukau (skor ≥90), brand-indigo untuk jawaban standar.",
          en: "Dark AI Assessment Box: The AI grading box in ReviewPage now comes in dark tinted variants — golden-amber for stunning answers (score ≥90), brand-indigo for standard ones.",
          jp: "ダークAI評価ボックス：レビューページのAI採点ボックスがダークティント仕様に — 優秀な回答（スコア≥90）はゴールドアンバー、標準はブランドインディゴになりました。",
        },
      },
      {
        type: "fix",
        text: {
          id: "Konsistensi Warna Modal & Overlay: Semua modal, dropdown, dan overlay kini mengikuti sistem warna gelap yang sama sehingga tidak ada lagi komponen yang tampak terang di tengah antarmuka gelap.",
          en: "Modal & Overlay Color Consistency: All modals, dropdowns, and overlays now follow the same dark color system — no more light components appearing in the middle of a dark interface.",
          jp: "モーダル＆オーバーレイの色一貫性：すべてのモーダル、ドロップダウン、オーバーレイが同じダークカラーシステムに統一され、ダークインターフェース内に明るいコンポーネントが表示されなくなりました。",
        },
      },
    ],
  },
  {
    version: "1.8.0",
    date: {
      id: "25 Jan 2026",
      en: "Jan 25, 2026",
      jp: "2026年1月25日",
    },
    title: {
      id: "Lobby Upgrades, Wagers & Machine Learning",
      en: "Lobby Upgrades, Wagers & Machine Learning",
      jp: "ロビーのアップグレード、賭け、機械学習",
    },
    highlight: false,
    changes: [
      {
        type: "new",
        text: {
          id: "Lobby Santai (0 Detik): Host kini bisa mengatur waktu ke 0 menit untuk mode tanpa batas waktu. Ideal untuk belajar santai.",
          en: "Relaxed Lobby (0 Seconds): Hosts can now set timer to 0 minutes for unlimited time mode. Ideal for relaxed studying.",
          jp: "リラックスロビー（0秒）：ホストはタイマーを0分に設定して、無制限の時間モードにすることができます。リラックスした勉強に最適です。",
        },
      },
      {
        type: "new",
        text: {
          id: "Taruhan Koin: Duel semakin panas! Host bisa mengatur jumlah taruhan koin untuk setiap tantangan.",
          en: "Coin Wagers: Duels get hotter! Hosts can set a coin wager amount for each challenge.",
          jp: "コインの賭け：決闘が熱くなる！ホストは、各チャレンジのコイン賭け金を設定できます。",
        },
      },
      {
        type: "new",
        text: {
          id: "Kode Room: Bagikan 6-digit kode room kepada teman untuk bergabung ke lobi dengan mudah.",
          en: "Room Codes: Share a 6-digit room code with friends to join the lobby easily.",
          jp: "ルームコード：6桁のルームコードを友達と共有して、ロビーに簡単に参加できます。",
        },
      },
      {
        type: "new",
        text: {
          id: "Lobby Challenge: Kini kamu bisa menantang teman untuk duel langsung di lobi.",
          en: "Lobby Challenge: Now you can challenge friends to a duel directly in the lobby.",
          jp: "ロビーチャレンジ：今すぐ友達にロビーで直接決闘を挑むことができます。",
        },
      },
      {
        type: "new",
        text: {
          id: "Machine Learning: Sistem rekomendasi soal berdasarkan tingkat kesulitan dan performa pengguna.",
          en: "Machine Learning: Question recommendation system based on difficulty level and user performance.",
          jp: "機械学習：難易度とユーザーのパフォーマンスに基づいた問題推薦システム。",
        },
      },
      {
        type: "improvement",
        text: {
          id: "Database Sync: Terjemahan kini disinkronkan langsung dari server, memastikan pembaruan bahasa instan tanpa update aplikasi.",
          en: "Database Sync: Translations are now synced directly from the server, ensuring instant language updates without app updates.",
          jp: "データベース同期：翻訳がサーバーから直接同期されるようになり、アプリの更新なしで即座に言語が更新されます。",
        },
      },
    ],
  },
  {
    version: "1.7.0",
    date: {
      id: "14 Jan 2026",
      en: "Jan 14, 2026",
      jp: "2026年1月14日",
    },
    title: {
      id: "Multi-Language & AI Genius Mode",
      en: "Multi-Language & AI Genius Mode",
      jp: "多言語 & AI天才モード",
    },
    highlight: false,
    changes: [
      {
        type: "new",
        text: {
          id: "Multi-Language System: Kini QuizApp mendukung 3 bahasa utama: Indonesia 🇮🇩, Inggris 🇺🇸, dan Jepang 🇯🇵. Atur preferensimu di menu Pengaturan.",
          en: "Multi-Language System: QuizApp now supports 3 main languages: Indonesian 🇮🇩, English 🇺🇸, and Japanese 🇯🇵. Set your preference in Settings.",
          jp: "多言語システム：QuizAppは現在、インドネシア語🇮🇩、英語🇺🇸、日本語🇯🇵の3つの主要言語をサポートしています。設定メニューで設定してください。",
        },
      },
      {
        type: "new",
        text: {
          id: "AI Translation: Terintegrasi dengan Google Gemini AI untuk menerjemahkan soal dan opsi jawaban secara instan dan akurat.",
          en: "AI Translation: Integrated with Google Gemini AI to translate questions and answer options instantly and accurately.",
          jp: "AI翻訳：Google Gemini AIと統合され、質問と回答の選択肢を瞬時かつ正確に翻訳します。",
        },
      },
      {
        type: "improvement",
        text: {
          id: "Smart Context Button: Tombol terjemahan pintar yang hanya muncul saat kamu membutuhkannya.",
          en: "Smart Context Button: A smart translation button that only appears when you need it.",
          jp: "スマートコンテキストボタン：必要な場合にのみ表示されるスマート翻訳ボタン。",
        },
      },
      {
        type: "improvement",
        text: {
          id: "Full Localization: Toko, Inventaris, Modal, dan seluruh antarmuka kini telah diterjemahkan sepenuhnya.",
          en: "Full Localization: Shop, Inventory, Modals, and the entire interface have now been fully translated.",
          jp: "完全なローカライズ：ショップ、インベントリ、モーダル、およびインターフェイス全体が完全に翻訳されました。",
        },
      },
    ],
  },
  {
    version: "1.6.0",
    date: {
      id: "03 Jan 2026",
      en: "Jan 03, 2026",
      jp: "2026年1月03日",
    },
    title: {
      id: "Indonesian Localization, Reports System & Admin Revamp",
      en: "Indonesian Localization, Reports System & Admin Revamp",
      jp: "インドネシア語ローカライズ、レポートシステム、管理画面の刷新",
    },
    highlight: false,
    changes: [
      {
        type: "new",
        text: {
          id: "Sistem Laporan & Ulasan: Kamu sekarang bisa melaporkan soal/pengguna yang melanggar aturan, serta memberikan rating bintang untuk kuis yang telah dimainkan.",
          en: "Report & Review System: You can now report questions/users violating rules, and give star ratings for played quizzes.",
          jp: "レポート＆レビューシステム：ルールに違反する質問/ユーザーを報告し、プレイしたクイズに星の評価を付けることができるようになりました。",
        },
      },
      {
        type: "new",
        text: {
          id: "Mode Baru: Mode survival baru yang memberikan tantangan yang lebih seru dan menantang.",
          en: "New Mode: New survival mode providing more exciting and challenging gameplay.",
          jp: "新しいモード：よりエキサイティングでやりがいのあるゲームプレイを提供する新しいサバイバルモード。",
        },
      },
      {
        type: "improvement",
        text: {
          id: "Full Bahasa Indonesia: Seluruh antarmuka aplikasi kini tersedia dalam Bahasa Indonesia yang baku dan mudah dipahami.",
          en: "Full Indonesian Language: The entire app interface is now available in standard and easy-to-understand Indonesian.",
          jp: "完全なインドネシア語：アプリのインターフェイス全体が、標準的でわかりやすいインドネシア語で利用可能になりました。",
        },
      },
      {
        type: "improvement",
        text: {
          id: "Admin Dashboard 2.0: Tampilan baru dashboard admin dengan grafik analitik mingguan, distribusi topik, dan statistik performa soal.",
          en: "Admin Dashboard 2.0: New admin dashboard look with weekly analytics charts, topic distribution, and question performance stats.",
          jp: "管理ダッシュボード2.0：週次分析チャート、トピック分布、質問パフォーマンス統計を備えた新しい管理ダッシュボードの外観。",
        },
      },
      {
        type: "new",
        text: {
          id: "Realtime Broadcasts: Pengumuman dari admin kini muncul secara realtime dengan kategori (Info, Warning, Danger) dan tampilan visual yang menarik.",
          en: "Realtime Broadcasts: Admin announcements now appear in realtime with categories (Info, Warning, Danger) and attractive visuals.",
          jp: "リアルタイム放送：管理者からのアナウンスが、カテゴリ（情報、警告、危険）と魅力的なビジュアルでリアルタイムに表示されるようになりました。",
        },
      },
      {
        type: "new",
        text: {
          id: "Sistem Classroom: Buat kelas belajar virtual, bagikan kode kelas, dan kerjakan kuis bersama teman sekelas.",
          en: "Classroom System: Create virtual study classes, share class codes, and take quizzes with classmates.",
          jp: "クラスルームシステム：仮想学習クラスを作成し、クラスコードを共有し、クラスメートとクイズを受けます。",
        },
      },
      {
        type: "new",
        text: {
          id: "Global Leaderboard: Bandingkan skormu dengan pemain lain di seluruh dunia dan raih puncak klasemen!",
          en: "Global Leaderboard: Compare your score with other players worldwide and reach the top of the leaderboard!",
          jp: "グローバルリーダーボード：世界中の他のプレイヤーとスコアを比較し、リーダーボードのトップを目指しましょう！",
        },
      },
      {
        type: "improvement",
        text: {
          id: "Admin Reports Enhanced: Admin kini dapat melihat username pelapor dan judul target secara detail untuk penanganan laporan yang lebih cepat.",
          en: "Admin Reports Enhanced: Admins can now view reporter username and target title in detail for faster report handling.",
          jp: "管理者レポートの強化：管理者は、レポートの処理を高速化するために、報告者のユーザー名とターゲットのタイトルを詳細に表示できるようになりました。",
        },
      },
    ],
  },
  {
    version: "1.5.3",
    date: { id: "26 Des 2025", en: "Dec 26, 2025", jp: "2025年12月26日" },
    title: {
      id: "Leave Lobby, Bug Fixes & Performance Improvements",
      en: "Leave Lobby, Bug Fixes & Performance Improvements",
      jp: "ロビー退出、バグ修正、パフォーマンス改善",
    },
    highlight: false,
    changes: [
      {
        type: "new",
        text: {
          id: "Fitur Leave Lobby: Kini kamu bisa keluar dari lobi tantangan sebelum memulai duel tanpa harus menunggu lawan.",
          en: "Leave Lobby Feature: You can now leave the challenge lobby before starting a duel without waiting for an opponent.",
          jp: "ロビー退出機能：対戦相手を待たずに、決闘を開始する前にチャレンジロビーを退出できるようになりました。",
        },
      },
      {
        type: "improvement",
        text: {
          id: "Peningkatan Performa Aplikasi: Optimalisasi kode untuk pengalaman pengguna yang lebih lancar dan responsif.",
          en: "App Performance Improvement: Code optimization for a smoother and more responsive user experience.",
          jp: "アプリのパフォーマンス向上：よりスムーズで応答性の高いユーザーエクスペリエンスのためのコード最適化。",
        },
      },
      {
        type: "fix",
        text: {
          id: "Perbaikan bug minor dan peningkatan performa aplikasi secara keseluruhan.",
          en: "Minor bug fixes and overall app performance improvements.",
          jp: "マイナーなバグ修正と全体的なアプリのパフォーマンス向上。",
        },
      },
    ],
  },
  {
    version: "1.5.2",
    date: { id: "24 Des 2025", en: "Dec 24, 2025", jp: "2025年12月24日" },
    title: {
      id: "Visual Overhaul: Skeleton, Inventory & 3D Avatars",
      en: "Visual Overhaul: Skeleton, Inventory & 3D Avatars",
      jp: "ビジュアルオーバーホール：スケルトン、インベントリ、3Dアバター",
    },
    highlight: false,
    description: {
      id: "Pembaruan fokus pada keindahan visual dan kenyamanan pengguna. Aplikasi kini terasa lebih cepat dan hidup!",
      en: "Update focused on visual beauty and user comfort. The app now feels faster and more alive!",
      jp: "ビジュアルの美しさとユーザーの快適さに焦点を当てたアップデート。アプリはより高速で生き生きとしています！",
    },
    changes: [
      {
        type: "new",
        text: {
          id: "Skeleton Loading System: Transisi antar halaman kini jauh lebih mulus dengan animasi skeleton modern.",
          en: "Skeleton Loading System: Page transitions are now much smoother with modern skeleton animations.",
          jp: "スケルトンローディングシステム：最新のスケルトンアニメーションにより、ページ間の遷移がはるかにスムーズになりました。",
        },
      },
      {
        type: "new",
        text: {
          id: "Inventory 2.0: Tampilan Tas baru dengan 'Live Preview'.",
          en: "Inventory 2.0: New Bag look with 'Live Preview'.",
          jp: "インベントリ2.0：「ライブプレビュー」を備えた新しいバッグの外観。",
        },
      },
      {
        type: "new",
        text: {
          id: "3D Avatar Frames: Bingkai avatar kini hidup dengan efek animasi visual nyata.",
          en: "3D Avatar Frames: Avatar frames now come alive with real visual animation effects.",
          jp: "3Dアバターフレーム：アバターフレームは、実際の視覚アニメーション効果で生き生きとしています。",
        },
      },
    ],
  },
  {
    version: "1.0.0",
    date: { id: "5 Des 2025", en: "Dec 5, 2025", jp: "2025年12月5日" },
    title: {
      id: "Grand Launching",
      en: "Grand Launching",
      jp: "グランドローンチ",
    },
    highlight: false,
    changes: [
      {
        type: "new",
        text: {
          id: "Rilis perdana QuizApp!",
          en: "QuizApp initial release!",
          jp: "QuizApp 初回リリース！",
        },
      },
    ],
  },
];
