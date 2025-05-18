import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Missing game title' });

  const search = await fetch(`https://www.cheapshark.com/api/1.0/games?title=${encodeURIComponent(title)}`);
  const searchData = await search.json();
  if (!searchData.length) return res.status(404).json({ error: 'Game not found' });

  const gameID = searchData[0].gameID;
  const gameDetails = await fetch(`https://www.cheapshark.com/api/1.0/games?id=${gameID}`);
  const gameData = await gameDetails.json();

  const deal = gameData.deals[0];
  const { storeID, price } = deal;

  const storeRes = await fetch('https://www.cheapshark.com/api/1.0/stores');
  const storeList = await storeRes.json();
  const storeName = storeList.find(s => s.storeID === storeID)?.storeName || `Store ${storeID}`;

  const { data, error } = await supabase.from('saved_games').insert([{
    title: searchData[0].external,
    store: storeName,
    price: parseFloat(price)
  }]);

  if (error) return res.status(500).json({ error });
  res.status(200).json(data[0]);
}
