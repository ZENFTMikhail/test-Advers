import { Meteor } from "meteor/meteor";
import { getDb } from "../db";
import { TranslationRow } from "../types";

const cache = new Map<string, string>();

Meteor.methods({
  async "translate.get"(token: string): Promise<string> {
    if (typeof token !== "string" || token.trim().length === 0) {
      throw new Meteor.Error(
        "invalid-token",
        "Token must be a non-empty string",
      );
    }

    const normalizedToken = token.toLowerCase().trim();

    if (cache.has(normalizedToken)) {
      return cache.get(normalizedToken)!;
    }

    const db = await getDb();

    const [rows] = await db.execute(
      "SELECT token, translation FROM translations WHERE token = ?",
      [normalizedToken],
    );

    const resultRows = rows as TranslationRow[];

    let result: string;

    if (resultRows.length > 0) {
      result = resultRows[0].translation;
      console.log(`Перевод: ${normalizedToken} → ${result}`);
    } else {
      result = normalizedToken;
      console.log(`Нет перевода для: ${normalizedToken}`);
    }

    cache.set(normalizedToken, result);

    return result;
  },
});
