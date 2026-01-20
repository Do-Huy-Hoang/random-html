const QUESTION_CONFIG = {
  questions: [
    {
      text: "Bé không gầy hơn anh được đúng không?",
      runningButtons: ["no"],
      btnYesText: "Đúng rồi!",
      btnNoText: "Không đúng!",
      yesResultText: "💕",
      noResultText: "😢",
    },
    {
      text: "Anh cho bé 500k bé lấy hem nè?",
      runningButtons: ["yes"],
      btnYesText: "Có lấy!",
      btnNoText: "Không lấy!",
      yesResultText: "💕",
      noResultText: "😢",
    },
    {
      text: "Anh bao nhiêu kí ",
      runningButtons: ["yes"],
      btnYesText: "95 kg",
      btnNoText: "75 kg",
      yesResultText: "😢",
      noResultText:  "💕",
    }
  ],

  buttonBehavior: {
    triggerDistance: 120,
  },
};
