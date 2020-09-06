const vdf = require("simple-vdf")
const fs = require("fs-extra")
const path = require("path")

const config = require("./config")
const CSGOParser = require("./parser")

const rarities = {
  common: 0,
  uncommon: 1,
  rare: 2,
  mythical: 3,
  legendary: 4,
  ancient: 5,
  immortal: 5
}

function main() {
  const gamePath = config.get("gamePath", undefined)
  const outputPath = config.get("outputPath", path.join(__dirname, "..", "dist", "stickers.txt"))

  const parser = new CSGOParser(gamePath)
  const stickers = parser.parseStickers()

  const outputStickers = {}

  for (const sticker of stickers) {
    const [englishName, russianName] = [
      parser.getTranslation(sticker.tag, "english"),
      parser.getTranslation(sticker.tag, "russian")
    ]

    const stickerCase = parser.getStickerCase(sticker.name)

    outputStickers[sticker.id] = {
      name: englishName,
      case: stickerCase ? parser.getTranslation(stickerCase.tag, "english") : "",
      rarity: rarities[sticker.rarity] || "",
      rus_name: russianName || englishName
    }
  }

  fs.outputFileSync(outputPath, vdf.stringify(outputStickers, true))
}

main()