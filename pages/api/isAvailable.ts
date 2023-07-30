import { NextApiRequest, NextApiResponse } from "next";
import { BlockFrostAPI } from "@blockfrost/blockfrost-js";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL as string,
  token: process.env.UPSTASH_REDIS_REST_TOKEN as string,
});

const HANDLE_POLICY_ID =
  "f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a";

// Initialize the Blockfrost API client
const Blockfrost = new BlockFrostAPI({
  projectId: process.env.BLOCKFROST_PROJECT_ID as string,
});

export interface AvailabilityInfo {
  name: string;
  isAvailable: boolean;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const words = (await redis.getdel("wordsToFind")) as string[];
  const availabilityFetches = words.map((word) => handleIsAvailableFetch(word));

  const availabilityInfos: AvailabilityInfo[] = (
    await Promise.allSettled(availabilityFetches)
  )
    .filter((result) => result.status === "fulfilled")
    .map((result) => (result as PromiseFulfilledResult<any>).value);

  const onlyAvailableWords = availabilityInfos
    .filter((info) => info.isAvailable === true)
    .map((info) => info.name);

  return res.status(200).json({ availableWords: onlyAvailableWords });
}

async function handleIsAvailableFetch(name: string): Promise<AvailabilityInfo> {
  // A blank Handle name should always be ignored.
  if (name.length === 0) {
    return {
      name,
      isAvailable: false,
    };
  }
  // Convert handleName to hex encoding.
  const assetName = Buffer.from(name).toString("hex");
  const assetId = `${HANDLE_POLICY_ID}${assetName}`;

  try {
    await Blockfrost.assetsAddresses(assetId);
    return {
      name,
      isAvailable: false,
    };
  } catch (e) {
    return {
      name,
      isAvailable: true,
    };
  }
}
