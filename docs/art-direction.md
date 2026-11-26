# Aanch: art direction and AI prompt system

How every image and video for Aanch is made, so a hundred generated images look like one shoot.
Concept and palette: [concept.md](concept.md).

## 1. Rules

1. **One shoot, one light.** Every prompt starts from a shared style block (section 3), copied word
   for word. Change only the subject lines.
2. **Shape first, then everything else.** Each product's shape comes from its profile drawing
   (section 5), so the photographs and the code-drawn profile agree.
3. **One master per product, the rest are edits.** Generate the packshot first. Every other angle,
   scene and finish is made by giving that master to the model as a reference image and asking it to
   keep the object identical. Never re-prompt a product from scratch, because it comes back as a
   different pot.
4. **Honesty.** The footer's demo line says the photographs and films are AI-generated
   ([concept.md](concept.md), section 14). No invented customers, reviews or press. Studio people
   are shown as hands at work, not portraits.
5. **Cultural care.** Real home food, cooked and eaten the way it is at home. No marigold-and-brass
   clichés outside Festive, no sacred symbols on tableware, no banana leaf unless asked, no Western
   cutlery or chopsticks.
6. **Record everything.** Every kept asset gets a row in `assets/manifest.json` (section 9).

## 2. Shot types per product

| Code | Shot | Use on the site | Framing |
|---|---|---|---|
| **A** | Packshot, 3/4 view | Listing card, gallery main, shelf view | 30° above, centred, white seamless, 4:5 |
| **B** | Front elevation | Generation reference only; checks the profile | Dead level, orthographic feel, 1:1 |
| **C** | Top-down | Gallery; shows rim, well and print layout | 90° overhead, white seamless, 1:1 |
| **D** | Detail close-up | Gallery; glaze breaking on the rim, print texture | Macro, rim and wall, 4:5 |
| **E** | In hand | Gallery, for scale (cups, katoris, jars, diyas) | Hand holding naturally, neutral ground, 4:5 |
| **F** | In use with food | Gallery, listing hover | 45°, real food in the piece, stone or teak, 4:5 |
| **G** | On the table | Gallery last frame, collection pages | Overhead, with other Aanch pieces in a meal, 3:2 |
| **L/R** | Light pair | The "move the light" close-up | Identical macro, light from left, then from right, 1:1 |

**Per product, lead finish:** A, B, C, D, F, plus E for small pieces, plus G for the 6 hero products.
**Per extra finish:** A only. That finish's texture comes from its swatch (section 6).
**Light pairs:** the lead finish of the 6 hero products only: Thali, Katori, Cutting Chai Cup,
Everyday Mug, Serving Bowl, Masala Dabba.

## 3. Style blocks (copy verbatim)

**S1: Studio packshot (A, B, C)**
> Studio product photograph of a single handmade wheel-thrown stoneware piece on a seamless pure white
> paper background, evenly lit, no props, no text. Large soft window light from the upper left with
> a gentle fill from the right and a soft natural contact shadow directly beneath the piece. 85 mm
> lens, f/8, everything in focus, true-to-life colour, neutral white balance. Photorealistic. The
> surface shows real handmade character: faint throwing lines, a slightly uneven rim, iron speckle
> in the clay, glaze pooling in hollows and thinning on edges, an unglazed foot ring of warm
> speckled toasted-sand stoneware.

**S2: Food and table (F, G, home heroes)**
> Editorial food photograph of a real home-cooked Indian meal, daylight from a window on the left, soft
> natural shadows, no artificial flash. Natural, slightly lived-in styling: a few grains of rice, a
> drip of dal on the rim, a folded handloom cotton napkin in undyed off-white. Food freshly cooked,
> glossy and appetising, not restaurant-plated. Colour natural and warm without an orange cast, no
> heavy grading, no vignette. Photorealistic, 35 mm lens, f/5.6.

**S3: Close-up (D, L/R, finish swatches)**
> Macro photograph of the glazed surface of a handmade stoneware piece, filling the frame, raking soft
> daylight so the texture reads: glaze pooling, pinholes, iron speckle, the edge where glaze thins
> over the rim to show the clay. 100 mm macro lens, f/11, sharp across the frame, true-to-life colour.

**S4: Studio process**
> Documentary photograph inside a small working pottery studio in Bengaluru, daylight through a high
> window, clay dust in the air, worn concrete floor, wooden shelves of drying pots. Hands and forearms
> of a potter in an everyday cotton kurta with a canvas apron; the face is out of frame. Honest,
> unstaged, a little untidy. 35 mm lens, f/4, natural colour.

**Avoid list (append to every image prompt):**
> Avoid: text, logos, watermarks, brand names, packaging labels, perfect machine symmetry, glossy CGI
> or 3D-render look, plastic sheen, extra objects not named, distorted hands or extra fingers,
> steel or brass utensils unless named, Western cutlery, chopsticks, marigolds, diyas (unless the
> prompt is Festive), banana leaf, blurry glaze, oversaturated colour.

Generators differ: some take the avoid list as a negative-prompt field, others read it as plain
text. Section 10 notes the differences.

## 4. Finish descriptions (paste into the subject line)

| Finish | Prompt text |
|---|---|
| Neel | glossy deep cobalt-blue glaze that pools almost navy in hollows and breaks to pale blue-white on the rim and edges |
| Haldi | satin turmeric-ochre yellow glaze with fine dark iron speckle showing through |
| Monsoon | translucent glossy grey-green celadon glaze with a very fine crackle, deeper green where it pools |
| Laterite | satin iron red-brown glaze with dark speckle, like laterite stone, breaking to orange-brown on the rim |
| Chuna | matte chalky limewash-white glaze, dry and soft-looking, with faint iron specks |
| Buti | matte limewash-white glaze printed with small five-petal flower motifs stamped in cobalt-blue slip, scattered in a loose half-drop repeat; each stamp slightly uneven in ink density with soft misregistration, as if pressed by hand with a carved wooden block |
| Jaal | glossy cobalt-blue glaze with an interlocking ogee lattice pattern in limewash-white lines made by wax resist; lines slightly irregular and hand-drawn |
| Bel | satin turmeric-ochre glaze with a continuous trailing vine-and-leaf border stamped in cobalt blue around the rim only, the repeat visibly hand-placed with small gaps and overlaps |
| Leheriya | satin iron red-brown glaze with fine diagonal rippling wave lines scratched through to the pale clay underneath (sgraffito), lines hand-cut and slightly wavering |

## 5. Product sheets (subject lines)

Shape words come from the profile data, which also draws the code profile.

| Product | Subject line |
|---|---|
| Thali 28 cm | a wide round thali plate, 28 cm across, flat base with a gently flared 3.5 cm tall rim (deeper than a Western dinner plate, to hold gravy), softly rolled rim edge |
| Quarter Plate 20 cm | a small round side plate, 20 cm across, shallow 2 cm rim, softly rolled edge |
| Katori, set of 4 | four small straight-walled bowls (katoris), 9 cm across and 4.5 cm tall, 150 ml each, slightly flared lips, stacked two and two |
| Dal Bowl 400 ml | a deep round bowl, 13 cm across and 6.5 cm tall, gently curved walls, a narrow foot |
| Serving Bowl | a wide serving bowl, 20 cm across and 9 cm tall, rounded walls, generous foot ring |
| Cutting Chai Cup, set of 2 | two small handleless tumbler cups, 6 cm across and 7 cm tall, 90 ml, slightly waisted like a cutting-chai glass |
| Kulhad, set of 4 | four small tapered cups shaped like a traditional clay kulhad, wider at the mouth, 150 ml, a thin rim, the clay showing below the glaze line |
| Everyday Mug | a straight-sided mug, 8.5 cm across and 9.5 cm tall, a pulled loop handle with a thumb dimple |
| Davara-Tumbler | a South Indian filter-coffee set: a tall straight tumbler 7 cm across and 9 cm tall sitting inside a wide low davara bowl with a flared rim, 12 cm across |
| Achaar Jar with lid | a rounded lidded pickle jar, 10 cm across and 12 cm tall, a flat lid with a small knob, a short wide neck |
| Dahi Handi | a round-bellied curd-setting pot, 13 cm across and 10 cm tall, a short rolled collar, a loose flat lid |
| Masala Dabba | a round lidded spice box 22 cm across holding seven small bowls (six in a ring around one in the centre), a flat close-fitting lid |
| Ghee Pot with spoon | a small squat lidded pot, 8 cm across and 7 cm tall, with a slim matching stoneware spoon through a notch in the lid |
| Diya, set of 6 | six small open oil lamps (diyas), 7 cm across, pinched spout on one side, shallow well |
| Bud Vase | a narrow-necked bud vase, 14 cm tall, a round belly 8 cm across, a small flared lip |
| Agarbatti Stand | a low round incense stand, 10 cm across, a shallow dish with a raised central boss pierced with three small holes |
| First Home Set | the set together: two thali plates, four katoris and two cutting chai cups, arranged as one group |

## 6. Site and scene prompts

**Finish swatches (one per finish, 10 total).** S3 plus: "Surface: [finish text]. The swatch shows
about 5 cm of a flat plate well and a strip of the rim edge, 1:1."

**Home tables (4).** S2 plus: "Overhead 90° top-down view, 3:2, on [surface]." Leave the right third
quieter for the headline at narrow widths.

| Table | Surface | Aanch pieces | Food |
|---|---|---|---|
| Chai | old teak table | 2 Cutting Chai Cups in Buti, Quarter Plate in Neel | milky ginger chai with steam, onion pakoras, plain glucose biscuits (unbranded) |
| Thali | grey-green Kota stone | 2 Thalis in Neel, 6 Katoris in Neel, Haldi and Jaal, Serving Bowl in Monsoon | jeera rice, dal tadka, aloo gobi, bhindi fry, phulkas, curd, mango pickle, onion and lemon |
| Pantry | black kadappa stone | Achaar Jar in Bel (open), Dahi Handi in Chuna, Masala Dabba in Neel (open), Ghee Pot | mango pickle, set curd, turmeric, red chilli, mustard seed, cumin, coriander seed, fenugreek, garam masala, ghee |
| Festive | old teak table at dusk | 6 Diyas in Laterite (lit), Quarter Plates in Haldi, Bud Vase with one stem | kaju katli, besan laddoo, a small corner of painted rangoli (no text) |

Then make each a cinemagraph (section 7).

**Clay to table, 5 chapters.** S4 plus one line each:
1. Wedging: hands kneading a mound of grey stoneware clay on a canvas-covered wooden bench.
2. Throwing: wet hands raising a cylinder on a spinning wheel, slip on the knuckles.
3. Stamping: a carved wooden print block (teak, the motif visible on its face) pressed into a
   leather-hard plate, a tray of cobalt slip beside it.
4. Glazing: a bisque-fired thali held by its foot, half dipped into a bucket of glaze.
5. Opening the kiln: the door of a gas kiln just opened, glowing pieces on kiln shelves, heat haze.

**Other assets.**
- Packaging: a kraft box opened to show coir padding and a piece wrapped in undyed cotton, a
  printed-paper band (Buti) around it, no legible text.
- Breakage promise: hands taking a piece out of coir packing, intact.
- Studio notes (journal): S4, with subjects chosen per post.

## 7. Video (image-to-video, from the kept still)

Always animate a still you have already approved, so the video matches the image. Keep the camera
locked off or on a very slow push, at natural speed. Generate the full clip and trim it to a 4–6 s
loop in editing.

> Animate this image. Keep the camera locked off and every object, its position and the lighting
> exactly as in the image. Only this moves: [motion]. Subtle, natural speed, the last frame close to
> the first so it loops. No new objects, no text, no cuts, no music, no speech.

| Clip | Motion |
|---|---|
| Chai table | steam rising slowly from both cups, drifting left with the window air |
| Thali table | a hand tears a phulka and dips it in the dal, then withdraws |
| Throwing | the wheel spins and the wet walls rise a little under the hands |
| Stamping | the block lifts off the clay to reveal the fresh impression |
| Opening the kiln | heat haze shimmers over the glowing shelves, glow slowly cooling |

Delivery: MP4 (H.264) and WebM, 1080p and 720p, with the audio track removed, under 1.5 MB each,
plus a poster frame.

## 8. Worked example: Thali 28 cm

**Step 1, the shape reference.** Export the Thali profile drawing as a white-on-black front
silhouette (`scripts/` will generate this from the profile data in a later milestone).

**Step 2, master A (lead finish Neel).**
> [S1] Subject: a wide round thali plate, 28 cm across, flat base with a gently flared 3.5 cm tall rim
> (deeper than a Western dinner plate, to hold gravy), softly rolled rim edge. Finish: glossy deep
> cobalt-blue glaze that pools almost navy in hollows and breaks to pale blue-white on the rim and
> edges. Camera 30° above, the plate centred and filling 75% of a 4:5 vertical frame. Match the
> silhouette in the reference image exactly. [Avoid list]

Generate 4–8, keep one, and record it in the manifest. This is the master.

**Step 3, the other shots (master attached as reference).**
> B: The same plate as the reference image, identical shape, glaze and lighting. Camera moved to
> exactly level with the rim, straight-on side view, 1:1. [S1] [Avoid list]

> C: The same plate as the reference image, identical in every way. Camera directly overhead, 90°
> top-down, the plate centred filling 85% of a 1:1 frame. [S1] [Avoid list]

> D: [S3] The same plate as the reference image. Frame a 6 cm section of the rim and the inner wall,
> where the cobalt glaze pools navy at the base of the rim and breaks pale blue-white over the edge,
> the unglazed foot just visible below. 4:5. [Avoid list]

> F: [S2] The same plate as the reference image, identical shape and glaze, at 45° on grey-green Kota
> stone, serving a home lunch: jeera rice, a pool of dal tadka held in by the deep rim, aloo gobi,
> two phulkas folded at the edge, a spoon of mango pickle. 4:5. [Avoid list]

> G: [S2] Overhead 90°, 3:2, on grey-green Kota stone. Two of the plates from the reference image as
> the centre of a lunch for two, surrounded by katoris of dal, curd and sabzi, a serving bowl of
> rice, hands of two people reaching in. [Avoid list]

> L/R: [S3] The same rim section as image D, identical framing. Light only from the left, low and
> raking. (Then the same with light only from the right.) 1:1. [Avoid list]

**Step 4, extra finishes (A only).**
> The same plate as the reference image, identical shape, camera, framing, lighting and shadow.
> Change only the surface to: [finish text for Buti / Jaal / Monsoon / Chuna]. [Avoid list]

Thali total: 8 images in Neel (A B C D F G L R), plus A in four other finishes = **12**.

## 9. Files and manifest

```
assets-src/               (originals, kept out of the app bundle)
  products/thali/neel/A.png   B.png C.png D.png F.png G.png L.png R.png
  products/thali/buti/A.png
  finishes/neel.png ...
  scenes/table-thali.png    scenes/table-thali.mp4
  process/03-stamping.png
assets/manifest.json      one entry per kept asset
```

Manifest entry: `{ file, product, finish, shot, prompt, reference, model, seed, date, alt }`.
The `alt` text is written at the same time as the image, by a person looking at it.

Specs: export PNG at 2400 px on the long side; the app makes AVIF/WebP at display sizes. Where the
originals are stored (repo, Git LFS or object storage via the admin upload) is a Checkpoint 3 decision.

## 10. When assets are made

Assets are made **when a milestone needs them**, not up front. Each milestone's plan lists the
assets it needs; until a real image arrives, the build uses a code-drawn placeholder (the product's
profile drawing on cotton), so nothing waits on images.

| First needed in | Assets |
|---|---|
| Design system | A few finish swatches, one home table, the Thali master set (this proves the workflow) |
| Catalogue and product page | Lead-finish sets, extra-finish packshots, as each product is seeded |
| Home and story | The remaining home tables, process stills, video loops |
| Polish | Light pairs, packaging, journal |

Rough total over the project: about 180. Free daily limits on both tools make this pace a good fit.

## 11. Tool notes: ChatGPT (images) and Google Flow (video)

**ChatGPT, for images**
- Use **one chat per product**. Generate the master there, then attach the master again with every
  follow-up prompt ("the same plate as the attached image...").
- There's no negative-prompt field or seed. Paste the avoid list as a normal sentence at the end of
  the prompt, and record the chat link in the manifest's `model` field in place of a seed.
- Portrait output isn't 4:5. Ask for portrait (2:3) and crop to 4:5 at export, keeping the object
  inside the 4:5 safe area (the prompt says "leave space above and below the object").
- If the shape drifts in an edit, start again from the master rather than editing an edit.

**Google Flow, for video**
- Start each clip from an approved still used as the first frame, so the video matches the
  photograph. Paste the section 7 prompt.
- Clips can come with generated sound. Strip the audio track at export (the site never plays sound).
- Trim to a 4–6 s loop where the motion is calmest. Export the poster from the clip's first frame.
- Flow can also make stills. Use it for images only if ChatGPT keeps drifting on a product, and
  keep each product's whole set in one tool so the look stays consistent.

These notes follow how the tools worked when this was written. Check each tool's current options
(output sizes, limits, reference uploads) before a big batch.
