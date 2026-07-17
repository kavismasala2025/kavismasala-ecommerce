/*
# Seed Kavis Masala product catalog

## Overview
Inserts the initial product lineup for Kavis Masala. Uses
`ON CONFLICT (slug) DO NOTHING` so re-running is safe.

## Products added (by category)

### Podi Varieties
- Idli Podi (trending)
- Andhra Kaara Paruppu Podi (trending, also listed under Rice Mixes)
- Karuveppilai Podi (also listed under Rice Mixes)
- Mudakathan Podi (also listed under Rice Mixes)
- Rasa Podi

### Pickles
- Mango Pickle

### Health Mix
- Karuppu Kavuni Health Mix
- Karuppu Kavuni Kanji Mix (trending)

### Masala
- (placeholder category — no products currently, kept for filter)

### Rice Mixes
- Andhra Kaara Paruppu Podi, Karuveppilai Podi, Mudakathan Podi
  (these share slugs with Podi Varieties; we keep them in Podi Varieties
  and the storefront filter surfaces them in both categories via the
  category filter logic in the frontend)

### Vadagam
- (no products — Kari Vadagam removed)

## Trending (homepage)
- Idli Podi
- Andhra Kaara Paruppu Podi
- Karuppu Kavuni Kanji Mix (renamed from Karuppu Kaanji Mix)

## Notes
- Prices are in INR and are placeholder reasonable values.
- Stock set to a positive number so items are buyable.
- image_url uses Pexels stock photos for food/spice imagery.
*/

INSERT INTO products (name, slug, description, price, category, image_url, weight, stock, is_trending, is_active) VALUES
-- Podi Varieties
('Idli Podi', 'idli-podi', 'Classic South Indian lentil podi mixed with sesame oil for the perfect idli companion. Roasted lentils, red chilies, and a hint of asafoetida.', 180, 'Podi Varieties', 'https://images.pexels.com/photos/4198015/pexels-photo-4198015.jpeg?auto=compress&cs=tinysrgb&w=800', '200g', 50, true, true),
('Andhra Kaara Paruppu Podi', 'andhra-kaara-paruppu-podi', 'Spicy Andhra-style roasted lentil powder with a bold red chili kick. A versatile podi that doubles as a rice mix.', 210, 'Podi Varieties', 'https://images.pexels.com/photos/4198992/pexels-photo-4198992.jpeg?auto=compress&cs=tinysrgb&w=800', '200g', 45, true, true),
('Karuveppilai Podi', 'karuveppilai-podi', 'Fragrant curry leaf podi rich in iron and flavor. Roasted curry leaves blended with lentils and spices.', 190, 'Podi Varieties', 'https://images.pexels.com/photos/4198023/pexels-photo-4198023.jpeg?auto=compress&cs=tinysrgb&w=800', '200g', 40, false, true),
('Mudakathan Podi', 'mudakathan-podi', 'Traditional mudakathan (balloon vine) leaf podi, prized in Siddha medicine for joint health. Earthy and aromatic.', 220, 'Podi Varieties', 'https://images.pexels.com/photos/4198975/pexels-photo-4198975.jpeg?auto=compress&cs=tinysrgb&w=800', '200g', 35, false, true),
('Rasa Podi', 'rasa-podi', 'Ready-to-mix rasam powder. A balanced blend of coriander, cumin, pepper, and red chili for a quick, flavorful rasam.', 160, 'Podi Varieties', 'https://images.pexels.com/photos/4198017/pexels-photo-4198017.jpeg?auto=compress&cs=tinysrgb&w=800', '200g', 40, false, true),
-- Pickles
('Mango Pickle', 'mango-pickle', 'Tangy cut-mango pickle in cold-pressed sesame oil with mustard, fenugreek, and red chili. A timeless South Indian favorite.', 240, 'Pickles', 'https://images.pexels.com/photos/4198019/pexels-photo-4198019.jpeg?auto=compress&cs=tinysrgb&w=800', '300g', 60, false, true),
-- Health Mix
('Karuppu Kavuni Health Mix', 'karuppu-kavuni-health-mix', 'Nutrient-dense health mix made from black kavuni rice, millets, nuts, and pulses. A wholesome breakfast porridge.', 320, 'Health Mix', 'https://images.pexels.com/photos/4198021/pexels-photo-4198021.jpeg?auto=compress&cs=tinysrgb&w=800', '500g', 30, false, true),
('Karuppu Kavuni Kanji Mix', 'karuppu-kavuni-kanji-mix', 'Traditional black rice kanji (porridge) mix with herbs and spices. Renamed from Karuppu Kaanji Mix. A trending wellness drink.', 280, 'Health Mix', 'https://images.pexels.com/photos/4198025/pexels-photo-4198025.jpeg?auto=compress&cs=tinysrgb&w=800', '400g', 30, true, true)
ON CONFLICT (slug) DO NOTHING;
