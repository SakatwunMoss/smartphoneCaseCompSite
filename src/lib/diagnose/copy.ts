/**
 * 診断・トップ診断導線用の和英コピー。
 * 表示は英語を上・日本語を下で並べる（イヤホン版と同じ）。
 */

export type BilingualCopy = {
  en: string;
  ja: string;
};

export const diagnoseCopy = {
  nav: {
    label: { en: "Find Your Match", ja: "好み診断" } satisfies BilingualCopy,
  },
  home: {
    promoEyebrow: {
      en: "Find Your Match",
      ja: "好み診断",
    } satisfies BilingualCopy,
    promoTitle: {
      en: "Find a case that fits you in about a minute",
      ja: "1分で、あなたに合うケースが見つかる",
    } satisfies BilingualCopy,
    promoBody: {
      en: "Pick your phone, then answer a few questions about protection, style, and budget. We'll suggest matches from our catalog.",
      ja: "端末を選んで、保護性やスタイル・予算などの質問に答えるだけでおすすめを提案します。",
    } satisfies BilingualCopy,
    promoCta: {
      en: "Start the quiz",
      ja: "診断をはじめる",
    } satisfies BilingualCopy,
  },
  quiz: {
    title: { en: "Find Your Match", ja: "好み診断" } satisfies BilingualCopy,
    intro: {
      en: "Answer a few questions and we'll suggest phone cases from our catalog that fit you.",
      ja: "いくつかの質問に答えると、登録ケースから相性のよいものを提案します。",
    } satisfies BilingualCopy,
    questionProgress: (current: number, total: number): BilingualCopy => ({
      en: `Question ${current} of ${total}`,
      ja: `質問 ${current} / ${total}`,
    }),
    back: { en: "Back", ja: "戻る" } satisfies BilingualCopy,
    next: { en: "Next", ja: "次へ" } satisfies BilingualCopy,
    seeResults: { en: "See results", ja: "結果を見る" } satisfies BilingualCopy,
    phoneSearchPlaceholder: {
      en: "Search phone models…",
      ja: "機種名で検索…",
    } satisfies BilingualCopy,
    phoneMakerLabel: {
      en: "Maker",
      ja: "メーカー",
    } satisfies BilingualCopy,
    phoneModelLabel: {
      en: "Model",
      ja: "機種",
    } satisfies BilingualCopy,
    phoneEmpty: {
      en: "No matching phones.",
      ja: "一致する端末がありません。",
    } satisfies BilingualCopy,
    questions: {
      phone: {
        en: "Which phone do you need a case for?",
        ja: "ケースを探す端末は？",
      } satisfies BilingualCopy,
      priorities: {
        en: "What matters most? (pick any)",
        ja: "特に重視するポイントは？（複数可）",
      } satisfies BilingualCopy,
      caseTypes: {
        en: "What case style do you prefer? (pick any)",
        ja: "希望のケースタイプは？（複数可）",
      } satisfies BilingualCopy,
      budget: {
        en: "What's your budget?",
        ja: "予算は？",
      } satisfies BilingualCopy,
    },
    options: {
      priorities: {
        protection: {
          en: "Drop protection",
          ja: "落下からの保護",
        } satisfies BilingualCopy,
        thin_light: {
          en: "Slim & light",
          ja: "薄さ・軽さ",
        } satisfies BilingualCopy,
        design: {
          en: "Design & looks",
          ja: "デザイン・見た目",
        } satisfies BilingualCopy,
        utility: {
          en: "Utility (card / stand)",
          ja: "実用性（カード収納・スタンド等）",
        } satisfies BilingualCopy,
        magsafe: {
          en: "MagSafe / wireless charging",
          ja: "MagSafe・ワイヤレス充電対応",
        } satisfies BilingualCopy,
        price: {
          en: "Low price",
          ja: "価格の安さ",
        } satisfies BilingualCopy,
      },
      caseTypes: {
        rugged: {
          en: "Rugged / shockproof",
          ja: "耐衝撃",
        } satisfies BilingualCopy,
        folio: {
          en: "Folio / wallet",
          ja: "手帳型",
        } satisfies BilingualCopy,
        clear: {
          en: "Clear",
          ja: "クリア",
        } satisfies BilingualCopy,
        silicone: {
          en: "Silicone / soft",
          ja: "シリコン・ソフト",
        } satisfies BilingualCopy,
        leather: {
          en: "Leather-like",
          ja: "レザー調",
        } satisfies BilingualCopy,
        strap: {
          en: "Strap-ready",
          ja: "ストラップ対応",
        } satisfies BilingualCopy,
        any: {
          en: "No preference",
          ja: "こだわらない",
        } satisfies BilingualCopy,
      },
      budget: {
        under_1500: {
          en: "Up to ¥1,500",
          ja: "〜1,500円",
        } satisfies BilingualCopy,
        range_1500_3000: {
          en: "¥1,500 – ¥3,000",
          ja: "1,500〜3,000円",
        } satisfies BilingualCopy,
        range_3000_5000: {
          en: "¥3,000 – ¥5,000",
          ja: "3,000〜5,000円",
        } satisfies BilingualCopy,
        over_5000: {
          en: "¥5,000+",
          ja: "5,000円〜",
        } satisfies BilingualCopy,
        any: {
          en: "No preference",
          ja: "こだわらない",
        } satisfies BilingualCopy,
      },
    },
  },
  results: {
    title: { en: "Your matches", ja: "診断結果" } satisfies BilingualCopy,
    intro: {
      en: "Here are scored picks based on your answers.",
      ja: "回答をもとにスコアリングしたおすすめケースです。",
    } satisfies BilingualCopy,
    guidance: {
      en: "Open a purchase link for a case you like, or compare other cases on the phone page.",
      ja: "気になるケースの購入先を開くか、端末ページでほかのケースと比較できます。",
    } satisfies BilingualCopy,
    empty: {
      en: "No matches found. Try changing your answers and run the quiz again.",
      ja: "条件に合うケースが見つかりませんでした。条件を変えてもう一度お試しください。",
    } satisfies BilingualCopy,
    relaxed: {
      en: "Few exact matches — showing close recommendations",
      ja: "条件に完全一致するものが少なかったため、近いものを表示しています",
    } satisfies BilingualCopy,
    relaxedPrefix: {
      en: "Relaxed",
      ja: "緩和",
    } satisfies BilingualCopy,
    count: (n: number): BilingualCopy => ({
      en: `${n} picks (by score)`,
      ja: `おすすめ ${n} 件（スコア順）`,
    }),
    restart: {
      en: "Retake the quiz",
      ja: "もう一度診断する",
    } satisfies BilingualCopy,
    editAnswers: {
      en: "Edit answers",
      ja: "回答を修正する",
    } satisfies BilingualCopy,
    viewPhone: {
      en: "Compare cases for this phone",
      ja: "この端末のケースを比較する",
    } satisfies BilingualCopy,
    compareTop: (n: number): BilingualCopy => ({
      en: `Compare top ${n}`,
      ja: `上位${n}件を比較する`,
    }),
    viewPhonePage: {
      en: "Go to this phone’s page",
      ja: "この端末のページへ",
    } satisfies BilingualCopy,
    score: (rank: number, score: number): BilingualCopy => ({
      en: `#${rank} · Score ${score}`,
      ja: `#${rank} · スコア ${score}`,
    }),
    price: { en: "Price", ja: "価格" } satisfies BilingualCopy,
    brand: { en: "Brand", ja: "ブランド" } satisfies BilingualCopy,
    whyFit: {
      en: "Why it fits",
      ja: "この商品が合う理由",
    } satisfies BilingualCopy,
    buyLink: {
      en: "View purchase options",
      ja: "購入先を見る",
    } satisfies BilingualCopy,
  },
  resume: {
    banner: {
      en: "Resumed where you left off",
      ja: "前回の続きから再開しました",
    } satisfies BilingualCopy,
    startOver: {
      en: "Start over",
      ja: "最初からやり直す",
    } satisfies BilingualCopy,
  },
  reasons: {
    typeMatch: (labels: BilingualCopy[]): BilingualCopy => ({
      en: `Style match: ${labels.map((l) => l.en).join(", ")}`,
      ja: `タイプ一致: ${labels.map((l) => l.ja).join("・")}`,
    }),
    priorityMatch: (labels: BilingualCopy[]): BilingualCopy => ({
      en: `Priority match: ${labels.map((l) => l.en).join(", ")}`,
      ja: `重視ポイント一致: ${labels.map((l) => l.ja).join("・")}`,
    }),
    inBudget: { en: "Within budget", ja: "予算内" } satisfies BilingualCopy,
    closeMatch: {
      en: "Close match",
      ja: "条件に近い候補",
    } satisfies BilingualCopy,
  },
  relaxedFilters: {
    caseTypes: {
      en: "Case style",
      ja: "ケースタイプ",
    } satisfies BilingualCopy,
    budget: { en: "Budget", ja: "予算" } satisfies BilingualCopy,
  },
  meta: {
    title: { en: "Find Your Match", ja: "好み診断" } satisfies BilingualCopy,
    description: {
      en: "Answer a few questions about your phone, priorities, and budget to get case recommendations.",
      ja: "端末・重視ポイント・予算などの質問に答えて、相性のよいスマホケースを提案します。",
    } satisfies BilingualCopy,
    breadcrumb: {
      en: "Find Your Match",
      ja: "好み診断",
    } satisfies BilingualCopy,
  },
} as const;

export type RelaxedFilterId = keyof typeof diagnoseCopy.relaxedFilters;
