# One Card Wiser — Web beta enhancement handover

This is a review-only update to the isolated `beta/` preview on PR #2. The existing live site, production Supabase project, authentication and mobile branches were not changed.

## Implemented

- 172 English beta questions (140 existing plus 32 additional logic, probability, perception, science, comparisons and riddles adapted from mobile PR #33's **work-in-progress** editorial collection).
- The embedded quiz catalog and `questions.json` are synchronized to make the preview self-contained.
- Chaos chooses labeled surprise/reasoning questions from those 32 new items (practice only in web beta).
- The browseable Library now has a Show More control instead of hiding all entries after the first 60.
- 24 new English editorial learning stories imported from the **draft** mobile refinement packs with IDs, source attribution, body and takeaway; 12 are shown in Seasonal Discoveries.
- Learn Something presents editorial stories, follow-on related quizzes and once-per-card reading claims; quiz answers add an optional non-scored reflection.
- Profile interests are optional, stored locally, and influence topic ordering and Learn selection without hiding topics.
- Progress compares the last seven recorded Daily Challenge days with the previous seven; knowledge map retains its activity-not-ability caveat.

## Honest beta limits

- Web beta rewards/scoring are still a separate implementation from mobile mastery. Do not claim shared scoring, cloud synchronization or account continuity.
- Web content is currently English. The mobile team's multilingual PR #33 is independent and still under development; no translation import or merge has occurred.
- The 32 new questions and 24 learning stories are derived from an unfinished editorial source PR and should receive factual, translation and native-speaker review before production.
- No real-device/browser end-to-end test has been executed in this review. JavaScript syntax, content structure, inline catalog parity and DOM ID consistency have been checked.
- Reflection is user-reported (no extra rewards). Reading claims are explicitly user-confirmed; they are not proof of reading comprehension.
- No live deployment, account auth, database migrations or production changes are authorized here.

## Next gates

1. Run browser end-to-end coverage for Daily, Chaos, Topic quiz, Learn, paging, Profile interests, Progress and local persistence.
2. Review all new questions and learning card facts and source URLs.
3. Only after mobile PR #33 settles, design one versioned content catalog and mastery storage schema, then stage sync in an isolated test project with explicit approval.
4. Revisit full ten-language support and accessibility before publishing.
