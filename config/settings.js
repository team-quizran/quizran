var Settings = module.exports = {};

// クイズの難易度ごとの取得ポイント数
Settings.getPoint = {
  1: 1,
  2: 3,
  3: 5
};

// ガチャの際に使用するポイント数
Settings.usePoint = 5;

// ガチャの出現確率
Settings.gachaProbability = {
  1: 80,
  2: 20
};

// コレクションアイテムのレア度
Settings.rarities = {
  'normal': 1,
  'rare': 2
};

// 有効なコレクションアイテムの数
Settings.availableItemCount = {
  1: 9,
  2: 5
};
