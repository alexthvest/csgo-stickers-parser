const vdf = require("simple-vdf")
const path = require("path")
const fs = require("fs-extra")

module.exports = class CSGOParser {

  /**
   *
   * @param gamePath
   */
  constructor(gamePath) {
    if (gamePath === undefined)
      throw new Error("No CS:GO game path was found. Please open config.json and set 'gamePath' to CS:GO path")

    this._gamePath = gamePath
    this._root = this._prepareRoot()
    this._languages = {}

    this._rarities = [
      "common",
      "uncommon",
      "rare",
      "mythical",
      "legendary",
      "ancient",
      "immortal"
    ]
  }

  /**
   *
   * @private
   */
  _prepareRoot() {
    const itemsPath = path.join(this._gamePath, "scripts/items/items_game.txt")
    return vdf.parse(fs.readFileSync(itemsPath, "utf-8"))
  }

  /**
   *
   * @param {string} language
   * @private
   */
  _installLanguage(language) {
    const languagePath = path.join(this._gamePath, `/resource/csgo_${language}.txt`)

    if (!fs.existsSync(languagePath))
      throw new Error(`File ${languagePath} doesn't exists`)

    const tokens = vdf.parse(fs.readFileSync(languagePath, "utf16le"))["lang"]["Tokens"]
    const entries = Object.entries(tokens).map(([key, value]) => [key.toLowerCase(), value])

    return this._languages[language] = Object.fromEntries(entries)
  }

  /**
   *
   * @param {string} itemName
   */
  getStickerCase(itemName) {
    const lootLists = this._root["items_game"]["client_loot_lists"]

    let stickerCaseId = Object.keys(lootLists).find(caseId => {
      return Object.keys(lootLists[caseId]).some(item => item === `[${itemName}]sticker`)
    })

    if (stickerCaseId === undefined || stickerCaseId.includes("coupon"))
      return undefined

    const stickerCase = Object.values(this._root["items_game"]["items"]).find(({ name, loot_list_name }) => {
      return loot_list_name === stickerCaseId || name === stickerCaseId
        .replace(new RegExp(`_(${this._rarities.join("|")}|foil|gold)`, "i"), "")
    })

    if (stickerCase === undefined)
      return undefined

    return {
      name: stickerCase.name,
      tag: stickerCase.item_name
    }
  }

  /**
   *
   * @param {string} tag
   * @param {string} language
   */
  getTranslation(tag, language) {
    if (this._languages.hasOwnProperty(language) === false)
      this._installLanguage(language)

    tag = tag.replace("#", "").toLowerCase()

    return this._languages[language][tag]
      || this._languages[language][tag.replace("dignitas", "teamdignitas")]
  }

  parseStickers() {
    const stickers = []
    const rawStickers = this._root["items_game"]["sticker_kits"]

    delete rawStickers["0"]

    Object.keys(rawStickers).forEach(stickerId => {
      const { name, item_name: tag, item_rarity: rarity } = rawStickers[stickerId]
      stickers.push({ id: stickerId, name, tag, rarity })
    })

    return stickers
  }
}