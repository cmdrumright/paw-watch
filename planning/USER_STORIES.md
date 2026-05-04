# PawWatch Clarksville — User Stories

## Auth

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| A-1 | As a visitor, I want to register with my email and password, so that I can access the site. | Registration form accepts email + password. Duplicate email shows an error. On success, user is logged in and redirected to the map. |
| A-2 | As a registered user, I want to log in with my email and password, so that I can access my account. | Valid credentials redirect to the map. Invalid credentials show an error message. |
| A-3 | As a logged-in user, I want to log out, so that my session is ended on shared devices. | Clicking log out clears the session and redirects to the login page. |
| A-4 | As a visitor who is not logged in, I want to be redirected to the login page, so that I know registration is required to use the site. | Any route besides login and register redirects unauthenticated users to the login page. |

---

## Browsing & Map

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| B-1 | As a logged-in user, I want to see a map of Clarksville with pins for all active posts, so that I can visually scan for nearby lost or found pets. | Map loads centered on Clarksville. Active lost and found posts appear as color-coded pins. |
| B-2 | As a logged-in user, I want lost and found pins to look different, so that I can distinguish them at a glance. | Lost pins and found pins use distinct colors or icons. A legend is visible on the map. |
| B-3 | As a logged-in user, I want to click a pin on the map and see a preview card, so that I can quickly assess a post without leaving the map. | Clicking a pin opens a card showing pet photo, name, species, status, and a link to the full post. |
| B-4 | As a logged-in user, I want to see a list view of all active posts, so that I can browse without using the map. | A list/feed view shows posts sorted by most recent. Each entry shows pet photo, name, type, species, and status. |

---

## Posts

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| P-1 | As a logged-in user, I want to create a lost pet post, so that my community can help me find my pet. | Form accepts type (lost), pet name, species, breed, color, description, incident date, up to 4 photos, and a map pin. Submitted post appears on the map and list. |
| P-2 | As a logged-in user, I want to create a found pet post, so that I can help reunite a pet with its owner. | Same as P-1 but type is found. |
| P-3 | As a post owner, I want to edit my post, so that I can correct details or add new information. | Owner can edit all fields. Changes are saved and reflected immediately. Non-owners cannot edit. |
| P-4 | As a post owner, I want to delete my post, so that I can remove it if it is no longer relevant. | Owner can delete their post. Post is removed from the map and list. Non-owners cannot delete. |
| P-5 | As a logged-in user, I want to view a full post page, so that I can read all details and comments. | Post page shows all fields, all photos, current status, and the full comment thread. |
| P-6 | As a logged-in user, I want to drop a pin on the map when creating a post, so that others know where the pet was last seen or found. | Map picker is embedded in the post form. User can click or drag a pin to set the location. Coordinates and a label are saved with the post. |

---

## Labels

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| L-1 | As a logged-in user, I want to select labels when creating or editing a post, so that others can quickly understand key details about the pet. | The post form shows all available labels as a multi-select checklist. Zero or more labels can be selected. Saved labels are stored with the post. |
| L-2 | As a logged-in user, I want to see labels displayed on a post, so that I can quickly assess the situation at a glance. | Selected labels appear as pills/badges on the post detail page and on list view cards. No labels shown if none were selected. |
| L-3 | As a logged-in user, I want to see labels on map pin preview cards, so that I can gauge urgency without opening the full post. | Pin preview cards display any labels associated with the post. |

---

## Comments & Sightings

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| C-1 | As a logged-in user, I want to comment on a post, so that I can share information that may help. | Comment form is available on every post page. Submitted comment appears in the thread immediately. |
| C-2 | As a logged-in user, I want to attach photos to my comment, so that I can share visual evidence of a sighting. | Comment form allows up to 2 photo uploads. Photos appear inline in the comment. |
| C-3 | As a logged-in user, I want to drop a pin on the map when commenting, so that I can indicate where I saw the pet. | Map picker is optional in the comment form. If a pin is set, it appears on the post's map alongside the original pin. |
| C-4 | As a post owner, I want to mark a comment as a confirmed sighting, so that others know the pet has been spotted. | Post owner sees a "Confirm sighting" button on each comment. Confirming updates the post status to `sighting_reported` and visually flags the comment. |
| C-5 | As a logged-in user, I want to delete my own comment, so that I can remove something I posted by mistake. | Comment author sees a delete button on their own comments. Deleted comments are removed from the thread. |

---

## Status Updates

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| S-1 | As a post owner, I want to update the status of my post, so that the community knows the current situation. | Owner can change status to any value: `active`, `sighting_reported`, `reunited`, `closed`. Status is updated immediately and shown on the post and map pin. |
| S-2 | As a post owner, I want to mark my post as reunited, so that the community knows the pet has been found. | Setting status to `reunited` displays a celebratory banner on the post page. |
| S-3 | As a logged-in user, I want closed and reunited posts to be hidden from the main map, so that I can focus on active cases. | Posts with status `reunited` or `closed` are removed from the map and default list view. They remain accessible via direct link. |

---

## Admin

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| AD-1 | As an admin, I want to delete any post, so that I can remove spam or inappropriate content. | Admin sees a delete option on all posts regardless of ownership. |
| AD-2 | As an admin, I want to delete any comment, so that I can moderate the comment threads. | Admin sees a delete option on all comments regardless of authorship. |
| AD-3 | As an admin, I want to add new labels, so that I can expand the available options as community needs grow. | Admin can create a new label by entering a unique name. New label becomes immediately available in the post form. |
| AD-4 | As an admin, I want to edit a label's name, so that I can correct or improve existing labels. | Admin can rename any label. The updated name is reflected everywhere the label is displayed. |
| AD-5 | As an admin, I want to delete a label, so that I can remove options that are no longer relevant. | Admin can delete a label. Deleting removes it from the label list and detaches it from any posts that had it applied. |

---

## Stretch — Label Filtering

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| LF-1 | As a logged-in user, I want to filter the map and list view by label, so that I can find posts that match specific criteria (e.g. only urgent or injured pets). | A filter panel allows selecting one or more labels. Map pins and list results update to show only posts with all selected labels. Clearing filters restores the full view. |

---

## Stretch — Shelter Accounts

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| SH-1 | As a shelter, I want a verified account badge on my posts, so that community members know the post comes from an official source. | Shelter accounts display a verified badge on their profile and all their posts. |
| SH-2 | As a shelter, I want to post found animals on behalf of my organization, so that owners can find pets that have been taken in. | Shelter posts display the shelter name instead of an individual display name. |
