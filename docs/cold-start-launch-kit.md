# ListingCut cold-start launch kit

This document contains the first outreach assets for ListingCut. Use the same positioning everywhere:

> ListingCut helps marketplace sellers batch-prepare product photos for Amazon, Etsy, and Shopify. Remove distracting backgrounds, choose white or transparent output, review the result, and download a ZIP without keeping an image history.

Do not position it as a generic “AI background remover.” The relevant audience is sellers who need a repeatable product-photo workflow.

## Before publishing anything

Complete these steps once. Do not launch until every item is ready.

1. Create or choose a founder profile that uses the same name and photo across Product Hunt, Indie Hackers, Reddit, and Facebook.
2. Record real source images you own or are authorized to use. Use simple physical products with clearly visible edges. Do not use supplier photos without permission.
3. Produce five visual assets and one short video from the actual ListingCut workflow:
   - **Cover image:** 1270 × 760 px. A product before/after pair, with `Batch-ready product photos` as the only headline.
   - **Amazon example:** a product photo before/after plus `White background workflow`.
   - **Etsy example:** a product photo before/after plus `Consistent shop photos`.
   - **Shopify example:** a product photo before/after plus `Clean collection grids`.
   - **Batch example:** a screen showing several completed results and the ZIP-download action.
   - **30-second GIF or video:** use the script below. Show real output, not a mockup.
4. Visit all links below while logged out. They must load quickly and show the correct brand:
   - `https://www.listingcut.shop/?utm_source=producthunt&utm_medium=launch&utm_campaign=cold_start`
   - `https://www.listingcut.shop/amazon-product-image-background-remover?utm_source=reddit&utm_medium=community&utm_campaign=cold_start`
   - `https://www.listingcut.shop/etsy-listing-photo-background-remover?utm_source=reddit&utm_medium=community&utm_campaign=cold_start`
   - `https://www.listingcut.shop/shopify-product-photo-background-remover?utm_source=facebook&utm_medium=community&utm_campaign=cold_start`
   - `https://www.listingcut.shop/batch-product-background-remover?utm_source=indiehackers&utm_medium=build_in_public&utm_campaign=cold_start`
5. In GA4, confirm that a page visit appears in **Reports → Realtime** before posting. Record a screenshot of the realtime report as a baseline.
6. Do not claim customer count, conversion rate, image-success rate, revenue, or marketplace approval unless you have real, documented numbers. Use the placeholders in this document only after replacing them with real figures.

## Asset script: 30-second ListingCut demo

Use a silent screen recording with brief captions. A GIF should be under the platform’s file-size limit; otherwise upload an MP4.

| Time | Screen action | On-screen caption |
|---|---|---|
| 0–3s | Show 3–5 original product photos with inconsistent backgrounds. | `Product photos, ready to list` |
| 3–7s | Open ListingCut and upload the images. | `Add up to 20 product photos` |
| 7–14s | Select white output, then show one transparent-output option. | `Choose white or transparent output` |
| 14–22s | Show completed images and zoom briefly into one clean edge. | `Review every result before publishing` |
| 22–27s | Select a marketplace canvas preset and show the batch. | `Keep the catalog consistent` |
| 27–30s | Click ZIP download and show the ListingCut URL. | `No image history. No subscription.` |

Avoid saying “perfect,” “one-click compliance,” or “Amazon approved.” ListingCut is a workflow aid; sellers must review final assets and current platform requirements.

---

# 1. Product Hunt: publish a product page

## What to publish

Product Hunt is a **product launch listing**, not a long founder article. Its job is to provide a credible product page, a compact demo, and an initial burst of feedback. It can create a branded referring page and send measurable launch traffic, but it is not a replacement for seller-community conversations.

## When to publish

Publish only after the cover image, five real screenshots, demo video, and support email are ready. Pick a day when you can monitor comments for the entire launch day and reply quickly in clear English.

Before submitting, read the current Product Hunt rules and community guidelines shown in its submission flow. Do not coordinate fake votes, create alternate accounts, or ask unrelated people for upvotes.

## Submission fields

Use this as the starting copy. Adjust only if the Product Hunt form has changed its field limits.

**Product name**

```text
ListingCut
```

**Tagline**

```text
Batch-ready product photos for Amazon, Etsy, and Shopify sellers
```

**Website URL**

```text
https://www.listingcut.shop/?utm_source=producthunt&utm_medium=launch&utm_campaign=cold_start
```

**Topics / categories**

Choose only categories that appear in the current Product Hunt selector and accurately describe the product. Prefer options closest to:

```text
Ecommerce, Photography, Productivity, SaaS
```

Do not add irrelevant “AI” categories only for reach.

**Maker comment (post immediately after the listing is live)**

```markdown
Hi Product Hunt — I’m Deshan, the maker of ListingCut.

I built it for the repetitive part of preparing product photos: cleaning backgrounds across a small batch, keeping the output consistent, and exporting images ready for a listing workflow.

ListingCut lets sellers upload up to 20 product photos, choose white or transparent output, apply Amazon/Etsy/Shopify canvas presets, review the result, and download a browser-generated ZIP. Product images are not kept as an image history; processing happens for the active request and output work stays in the browser.

Why this instead of another generic background remover? Marketplace sellers usually do not need one isolated cutout. They need a repeatable way to prepare a collection of SKUs without making the catalog look inconsistent.

The product is new, so I would especially value honest feedback on:

1. Which product-photo workflow is most painful for you today?
2. What makes you trust or reject an automatically removed background?
3. Which marketplace preset or export step would save you the most time?

There are two free image credits for trying the workflow. Thank you for taking a look.
```

## Launch-day actions

1. Submit the listing from the founder profile.
2. Add the maker comment above.
3. Share the launch only with people who can genuinely evaluate the product. Ask for feedback, not votes.
4. Reply to every substantive question. If the answer is unknown, say so and log it as a product-learning task.
5. Record results after 24 hours: Product Hunt visits, `upload_started`, `background_removed`, `checkout_started`, and comments. In GA4, filter by `utm_source=producthunt`.

## Product Hunt comment replies

**“How is this different from Remove.bg?”**

```text
ListingCut uses background-removal technology inside a seller workflow. The focus is not a single image API call; it is preparing a small product-photo batch with consistent white or transparent output, marketplace-oriented canvas presets, review, and ZIP export. Images are not kept as an image history by ListingCut.
```

**“Does this guarantee marketplace approval?”**

```text
No. The presets are workflow aids, not a guarantee of marketplace approval. Sellers should check current category requirements and review every image before publishing.
```

**“Are images stored?”**

```text
ListingCut does not keep a persistent image history. Images are processed for the active request, and previews and ZIP generation happen in the browser. The privacy page explains the third-party processing path in detail.
```

---

# 2. Indie Hackers: publish a Build in Public article

## What to publish

Publish one **founder story / build-in-public post**, not a launch announcement. The goal is to invite feedback from other founders and make the project’s approach linkable: a narrow user problem, a technical tradeoff, and an honest validation plan.

Use this exact URL in the post:

```text
https://www.listingcut.shop/batch-product-background-remover?utm_source=indiehackers&utm_medium=build_in_public&utm_campaign=cold_start
```

## How to publish

1. Create a maker profile with your real first name or the name you will consistently use elsewhere.
2. Find the current “Post” or “Build in Public” entry point. Select the closest honest category; do not categorize it as a growth result if you have no results yet.
3. Use the title and article below. Add the five real images after the opening paragraph and before the “what I built” section.
4. Publish once. Do not paste the same article into product-promotion threads.
5. Reply to comments with specifics: architecture, workflow, and real metrics only.
6. After 7 days, publish a follow-up with the actual numbers—not a revised version of this post.

## Article to publish

**Title**

```text
Why I built a batch product-photo workflow instead of another generic background remover
```

**Body**

```markdown
I recently launched [ListingCut](https://www.listingcut.shop/batch-product-background-remover?utm_source=indiehackers&utm_medium=build_in_public&utm_campaign=cold_start), a small tool for sellers who need to prepare product photos for Amazon, Etsy, and Shopify.

The obvious version of this product is “upload an image, remove the background.” That market is already crowded. The problem I want to test is narrower: sellers often have a small batch of product photos that need the same treatment before a catalog update or new listing goes live.

## The workflow I am trying to improve

The intended workflow is simple:

1. Upload up to 20 product photos.
2. Remove the background and choose white or transparent output.
3. Apply a consistent canvas preset when it helps the listing workflow.
4. Review each edge and download individual PNGs or one ZIP.

The point is consistency. A single clean cutout is useful, but a catalog often looks worse when every SKU has different padding, background treatment, or crop.

## Why I did not build image storage

I made one deliberate constraint: ListingCut does not keep a persistent image history.

The processing path is browser → Cloudflare Worker → Remove.bg → browser. The processed image comes back for the active request; previews, canvas adjustments, and ZIP creation happen in the browser. Cloudflare D1 is used for Google-login accounts, credits, and payment records, not for product-image files.

That means the product cannot offer a “come back to your old images” gallery. For early users, I think that is an acceptable tradeoff because sellers already keep their source assets, while avoiding permanent image storage makes the privacy promise much easier to explain.

## What is live today

- Batches of up to 20 JPG, PNG, or WebP product photos
- White or transparent background output
- Amazon, Etsy, and Shopify canvas presets
- Individual PNG and browser-generated ZIP downloads
- Google login and two free image credits
- One-time credit packs, not a subscription

The marketplace presets are workflow aids, not a guarantee of approval. Hair, fur, glass, smoke, netting, shadows, and low-contrast products still need a manual review.

## What I need to learn next

I am not going to invent traction numbers before I have them. Over the next two weeks, I am tracking:

- [replace with real number] product-photo uploads
- [replace with real number] completed background removals
- [replace with real number] users who reach checkout
- [replace with real percentage] acceptable results from real seller feedback

My current test is whether this narrow batch workflow is useful enough that at least a few sellers will pay for it, not whether I can collect a large number of generic signups.

If you sell on a marketplace or have built a similar tool, I would value blunt feedback:

1. What breaks your product-photo workflow today?
2. When do you need white versus transparent background output?
3. What would make you trust a batch image tool with a catalog update?
```

## Seven-day follow-up template

Do not publish this until the placeholders contain real data.

```markdown
## ListingCut week-one update

One week after posting, here is the actual result:

- Qualified visits: [real number]
- Users who started an upload: [real number]
- Successful background removals: [real number]
- Users who reached checkout: [real number]
- Paid purchases: [real number]
- Most common failure mode: [real observation]

The most useful feedback was: “[real user quote or paraphrase].”

Based on that, I am changing [specific next action]. I am not changing [unrelated feature] yet because I do not have evidence for it.
```

---

# 3. Reddit: publish helpful tutorial posts, one community at a time

## What to publish

Publish a **native tutorial/question-answer post** in one relevant seller community at a time. The post should solve the reader’s immediate workflow problem without requiring ListingCut. Link once, only at the end, and label your relationship to the tool.

Do not publish all three templates on the same day. Do not use the same text in multiple subreddits. Do not post until you have read the subreddit’s current sidebar, pinned promotion rules, and recurring self-promotion threads.

If direct links are prohibited, publish the tutorial without a link and answer questions. Only share the URL if a moderator permits it or someone specifically asks.

## Publishing sequence

1. Identify one community whose members actually sell in the relevant marketplace.
2. Read the latest rules, pinned threads, weekly promotion threads, and five high-performing discussion posts.
3. If it requires account history, spend time first giving useful, non-promotional answers. Do not manufacture engagement.
4. Publish one tutorial in the community’s normal format.
5. Remain available for 48 hours. Reply to questions; do not turn every reply into a link.
6. Wait at least 3–5 days before trying another community. Replace the next post’s examples and wording with what you learned.

## Reddit post: Amazon sellers

**Suggested title**

```text
How I would standardize a batch of product photos before an Amazon listing refresh
```

**Body**

```markdown
When a listing refresh involves more than one SKU, I think the goal should be consistency before cleverness.

My simple pre-upload checklist is:

1. Group similar products together rather than mixing very different subjects in one batch.
2. Start from a clean product-first image with enough contrast around the subject.
3. Use one background treatment and similar padding across related variants.
4. Review every edge at full size—especially glass, hair, fur, shadows, netting, and low-contrast edges.
5. Treat a white canvas or size preset as a workflow shortcut, then check the current category requirements before publishing.

The mistake I used to see most often is fixing one image perfectly and leaving the rest of the catalog visually inconsistent. A consistent batch usually improves the collection more than a single heavily edited hero image.

I made a small browser-based batch tool for this workflow. It gives two free credits, does not keep an image history, and exports white or transparent PNGs after review: https://www.listingcut.shop/amazon-product-image-background-remover?utm_source=reddit&utm_medium=community&utm_campaign=cold_start

I am the maker, so please treat that link as a transparent disclosure rather than a recommendation. What edge cases make background cleanup frustrating in your category?
```

## Reddit post: Etsy sellers

**Suggested title**

```text
A simple way to make product photos look more consistent across an Etsy shop
```

**Body**

```markdown
For a small Etsy shop, I would not try to make every listing photo identical. I would try to make the first product view immediately recognizable as part of the same shop.

My practical checklist:

1. Use the first image for a clear product view.
2. Keep lighting, crop, and empty space similar within one collection.
3. Use extra images for scale, texture, packaging, or real-world context.
4. If a background competes with the product, remove it or simplify it before building a branded composition.
5. Check difficult edges manually. Transparent objects, fur, lace, and shadows often need extra attention.

White backgrounds can be useful for a clean catalog look. Transparent cutouts can be useful if you build your own seasonal graphics or shop banners later. Neither option replaces a good product photo.

Disclosure: I made a small tool called ListingCut for batch-preparing product photos. It has a free trial and does not keep a persistent image history: https://www.listingcut.shop/etsy-listing-photo-background-remover?utm_source=reddit&utm_medium=community&utm_campaign=cold_start

I would love to know what makes a shop’s product photos feel cohesive without looking generic.
```

## Reddit post: Shopify sellers

**Suggested title**

```text
My checklist for cleaning up a new Shopify collection before it goes live
```

**Body**

```markdown
Before publishing a Shopify collection, I would check the product grid before I obsess over any individual image.

Here is the workflow:

1. Put the variant or collection photos side by side.
2. Choose a consistent crop and padding so products do not jump around in the grid.
3. Decide whether the storefront needs clean white images or transparent PNGs that will sit on a theme background.
4. Check sharpness and edge quality on a phone-sized preview as well as on desktop.
5. Keep the original files locally and export the final listing assets as a separate set.

The grid test catches a lot: one product sitting too low, inconsistent whitespace, or a busy background that makes a card look heavier than the rest.

Transparent backgrounds are useful when the theme supplies the visual treatment; white backgrounds are useful when the catalog needs a neutral, product-first presentation. The right answer depends on the theme and the product.

Disclosure: I built ListingCut to batch-remove product photo backgrounds and export a ZIP without keeping an image history. The free trial is here: https://www.listingcut.shop/shopify-product-photo-background-remover?utm_source=reddit&utm_medium=community&utm_campaign=cold_start

What image inconsistency do you notice first in a product grid?
```

## Replies to use on Reddit

**If someone asks whether the post is promotion**

```text
Yes—I made the tool linked at the end, which is why I disclosed it. The checklist is the useful part even if you use another editor. If the link is not appropriate for this community, I am happy to remove it.
```

**If someone reports a bad cutout**

```text
Thank you for calling that out. Those difficult edges are exactly where automation needs a manual review. If you can share a non-sensitive example or describe the material/background contrast, I will use it to improve the workflow guidance.
```

---

# 4. Facebook Groups: publish a shorter native post or comment

## What to publish

Use Facebook Groups only where self-promotion is explicitly allowed. In most groups, start with a **short native checklist post** or a helpful comment inside an existing question. Use one image (a genuine before/after) rather than five promotional slides.

Do not paste a Product Hunt launch link into groups. Use the marketplace-specific ListingCut page and disclose that you made it.

## How to publish

1. Join groups where the members are actual Amazon, Etsy, Shopify, or product-photography sellers.
2. Read the group rules and search the group for “promotion,” “self promotion,” “tools,” and “links.”
3. If promotions are only allowed on a weekly thread, post there instead of creating a new post.
4. For a normal post, attach one before/after image, use the text below, and include one link only if rules allow it.
5. If direct product promotion is prohibited, use the “comment answer” template on an existing relevant conversation instead.

## Facebook group post: catalog consistency

```markdown
When I prepare a new product collection, I check the whole grid before I edit individual images.

My quick checklist:

• similar crop and padding across related products
• one consistent background treatment
• clear edges around the product
• a mobile-size check before publishing
• manual review for glass, fur, shadows, lace, or low-contrast edges

White backgrounds work well for a clean catalog. Transparent PNGs are useful if your storefront theme or ad creative adds the background later.

I built a small batch tool around this workflow, so disclosure: I am the maker. It gives two free credits, processes up to 20 images in a batch, and does not keep an image history: https://www.listingcut.shop/batch-product-background-remover?utm_source=facebook&utm_medium=community&utm_campaign=cold_start

What is the first image inconsistency you notice when looking at a collection page?
```

## Facebook comment answer: use only when relevant

```markdown
For a batch like this, I would first standardize crop/padding, then use one white or transparent background treatment across the related products. I would still manually review glass, hair/fur, shadows, and low-contrast edges.

Disclosure: I made a small tool for that batch workflow. If links are allowed here, the free trial is https://www.listingcut.shop/batch-product-background-remover?utm_source=facebook&utm_medium=comment&utm_campaign=cold_start
```

---

# Measurement and decision log

Create one entry per post. Do not continue a channel merely because it supplied a backlink.

| Date | Channel | Post / community | UTM source | Visits | Upload starts | Completed removals | Checkout starts | Purchases | Qualitative feedback | Decision |
|---|---|---|---|---:|---:|---:|---:|---:|---|---|
| YYYY-MM-DD | Product Hunt | ListingCut launch | producthunt |  |  |  |  |  |  |  |
| YYYY-MM-DD | Indie Hackers | Build in public | indiehackers |  |  |  |  |  |  |  |
| YYYY-MM-DD | Reddit | Amazon tutorial | reddit |  |  |  |  |  |  |  |
| YYYY-MM-DD | Facebook | Catalog consistency post | facebook |  |  |  |  |  |  |  |

## First two-week success criteria

Use these as decision gates, not as claims in public posts:

- At least 100 qualified referral visits across the first four placements.
- At least 20 users start an upload.
- At least 10 users complete one background removal.
- At least 3 users reach checkout or explicitly state willingness to pay.
- At least 85% acceptable results from users who provide feedback on a real product image.

If a channel produces visits but no upload starts, improve the message and landing-page match before posting in more communities. If users upload but do not complete a removal, investigate image quality, credit messaging, or the workflow. If completed removals do not produce checkout intent, test the pricing/value proposition before chasing more backlinks.
