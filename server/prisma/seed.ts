import { PrismaClient, OnboardingQuestionType } from "@prisma/client";

const prisma = new PrismaClient();

const questions = [
  {
    prompt: "How many years have you been trading?",
    type: OnboardingQuestionType.SINGLE_SELECT,
    order: 1,
    options: [
      { label: "<1 year", value: "less_than_one_year", order: 1 },
      { label: "1-3 years", value: "one_to_three_years", order: 2 },
      { label: "3-5 years", value: "three_to_five_years", order: 3 },
      { label: "5+ years", value: "five_plus_years", order: 4 }
    ]
  },
  {
    prompt: "Which markets do you focus on?",
    type: OnboardingQuestionType.MULTI_SELECT,
    order: 2,
    options: [
      { label: "Forex", value: "forex", order: 1 },
      { label: "Stocks", value: "stocks", order: 2 },
      { label: "Crypto", value: "crypto", order: 3 },
      { label: "Indices", value: "indices", order: 4 },
      { label: "Commodities", value: "commodities", order: 5 }
    ]
  },
  {
    prompt: "What is your typical trade timeframe?",
    type: OnboardingQuestionType.SINGLE_SELECT,
    order: 3,
    options: [
      { label: "Scalping / Day trades", value: "scalping_day", order: 1 },
      { label: "Swing trades", value: "swing", order: 2 },
      { label: "Position trades", value: "position", order: 3 },
      { label: "Long-term investing", value: "long_term", order: 4 }
    ]
  },
  {
    prompt: "What best describes your trading style?",
    type: OnboardingQuestionType.SINGLE_SELECT,
    order: 4,
    options: [
      { label: "Technical analyst", value: "technical", order: 1 },
      { label: "Fundamental investor", value: "fundamental", order: 2 },
      { label: "Quantitative / systematic", value: "quantitative", order: 3 },
      { label: "Copy / social trader", value: "copy", order: 4 }
    ]
  },
  {
    prompt: "How would you rate your risk tolerance?",
    type: OnboardingQuestionType.SINGLE_SELECT,
    order: 5,
    options: [
      { label: "Conservative", value: "conservative", order: 1 },
      { label: "Balanced", value: "balanced", order: 2 },
      { label: "Aggressive", value: "aggressive", order: 3 },
      { label: "Willing to experiment", value: "experimental", order: 4 }
    ]
  },
  {
    prompt: "What is your primary goal on T-Line?",
    type: OnboardingQuestionType.SINGLE_SELECT,
    order: 6,
    options: [
      { label: "Learn fundamentals", value: "learn_fundamentals", order: 1 },
      { label: "Practice new strategies", value: "practice_strategies", order: 2 },
      { label: "Prepare for funded account", value: "funded_account", order: 3 },
      { label: "Grow consistent profits", value: "consistent_profits", order: 4 }
    ]
  }
];

const main = async () => {
  for (const question of questions) {
    const createdQuestion = await prisma.onboardingQuestion.upsert({
      where: { prompt: question.prompt },
      update: {
        type: question.type,
        order: question.order,
        isActive: true
      },
      create: {
        prompt: question.prompt,
        type: question.type,
        order: question.order,
        isActive: true,
        options: {
          create: question.options
        }
      }
    });

    for (const option of question.options) {
      await prisma.onboardingOption.upsert({
        where: {
          questionId_value: {
            questionId: createdQuestion.id,
            value: option.value
          }
        },
        update: {
          label: option.label,
          order: option.order
        },
        create: {
          questionId: createdQuestion.id,
          label: option.label,
          value: option.value,
          order: option.order
        }
      });
    }
  }
};

main()
  .then(() => {
    console.log("Onboarding questions seeded successfully.");
  })
  .catch((error) => {
    console.error("Failed to seed onboarding questions.", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
